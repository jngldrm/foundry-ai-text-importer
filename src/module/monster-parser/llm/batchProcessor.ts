/**
 * Batch processor to optimize OpenAI API calls by grouping similar requests
 */

import { ZodSchema } from 'zod';
import askLLM from './askLLM';
import apiConfig from './apiConfig';

interface BatchRequest<TInput, TOutput> {
  id: string;
  promptText: string;
  outputSchema: ZodSchema;
  inputOptions: TInput;
  outputOptions?: {
    overrides?: Record<string, any>;
    deletions?: string[];
  };
  resolve: (value: TOutput) => void;
  reject: (error: any) => void;
}

interface BatchConfig {
  maxBatchSize: number;
  batchTimeoutMs: number;
  enableBatching: boolean;
}

class BatchProcessor {
  private config: BatchConfig;
  private pendingRequests: Map<string, BatchRequest<any, any>[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<BatchConfig>) {
    this.config = this.getConfigFromAPIConfig(config);
  }

  private getConfigFromAPIConfig(overrides?: Partial<BatchConfig>): BatchConfig {
    const batchConfig = apiConfig.getBatchConfig();
    return {
      maxBatchSize: batchConfig.maxBatchSize,
      batchTimeoutMs: batchConfig.batchTimeoutMs,
      enableBatching: batchConfig.enabled,
      ...overrides
    };
  }

  /**
   * Process a request with optional batching
   */
  async processRequest<TInput, TOutput>(
    promptText: string,
    outputSchema: ZodSchema,
    inputOptions: TInput,
    outputOptions: {
      overrides?: Record<string, any>;
      deletions?: string[];
    } = {},
  ): Promise<TOutput> {
    // If batching is disabled, process immediately
    if (!this.config.enableBatching) {
      return askLLM<TInput, TOutput>(promptText, outputSchema, inputOptions, outputOptions);
    }

    // Check if this request type is batchable
    if (!this.isBatchable(promptText)) {
      return askLLM<TInput, TOutput>(promptText, outputOptions, inputOptions, outputOptions);
    }

    // Create batch key based on prompt pattern and schema
    const batchKey = this.createBatchKey(promptText, outputSchema);

    return new Promise<TOutput>((resolve, reject) => {
      const request: BatchRequest<TInput, TOutput> = {
        id: `${Date.now()}_${Math.random()}`,
        promptText,
        outputSchema,
        inputOptions,
        outputOptions,
        resolve,
        reject
      };

      // Add to pending requests
      if (!this.pendingRequests.has(batchKey)) {
        this.pendingRequests.set(batchKey, []);
      }
      
      const batch = this.pendingRequests.get(batchKey)!;
      batch.push(request);

      // Process batch if it's full
      if (batch.length >= this.config.maxBatchSize) {
        this.processBatch(batchKey);
        return;
      }

      // Set timeout to process batch
      if (!this.batchTimers.has(batchKey)) {
        const timer = setTimeout(() => {
          this.processBatch(batchKey);
        }, this.config.batchTimeoutMs);
        
        this.batchTimers.set(batchKey, timer);
      }
    });
  }

  /**
   * Process a batch of similar requests
   */
  private async processBatch(batchKey: string): Promise<void> {
    const requests = this.pendingRequests.get(batchKey);
    if (!requests || requests.length === 0) {
      return;
    }

    // Clear the batch
    this.pendingRequests.delete(batchKey);
    
    // Clear timer
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    // If only one request, process normally
    if (requests.length === 1) {
      const request = requests[0];
      try {
        const result = await askLLM(
          request.promptText,
          request.outputSchema,
          request.inputOptions,
          request.outputOptions
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
      return;
    }

    console.log(`Processing batch of ${requests.length} ${batchKey} requests`);

    // For batchable item parsing requests, try to combine them
    if (batchKey.startsWith('item_parsing')) {
      await this.processBatchedItemParsing(requests);
    } else {
      // Process individually with controlled concurrency
      await this.processSequentially(requests);
    }
  }

  /**
   * Process batched item parsing by combining multiple items into one request
   */
  private async processBatchedItemParsing(requests: BatchRequest<any, any>[]): Promise<void> {
    try {
      // Combine all items into a single prompt
      const combinedItems = requests.map((req, index) => ({
        index,
        name: req.inputOptions.itemName || `Item ${index + 1}`,
        text: req.inputOptions.itemText || req.inputOptions.text || 'No text provided'
      }));

      const combinedPrompt = `Parse the following monster items into the specified JSON schema format. Return an array of parsed items in the same order as provided.

ITEMS TO PARSE:
${combinedItems.map(item => `${item.index + 1}. ${item.name}: ${item.text}`).join('\n\n')}

Return the results as an array where each element follows the schema format.`;

      // Use the first request's schema but expect an array
      const firstRequest = requests[0];
      const arraySchema = {
        type: 'array',
        items: firstRequest.outputSchema._def,
        minItems: requests.length,
        maxItems: requests.length
      };

      const results = await askLLM(
        combinedPrompt,
        arraySchema as any,
        { items: combinedItems },
        firstRequest.outputOptions
      );

      // Distribute results back to individual requests
      if (Array.isArray(results) && results.length === requests.length) {
        results.forEach((result, index) => {
          if (index < requests.length) {
            requests[index].resolve(result);
          }
        });
      } else {
        // If batching failed, fall back to individual processing
        console.warn('Batch parsing returned unexpected format, falling back to individual processing');
        await this.processSequentially(requests);
      }

    } catch (error) {
      console.warn('Batch processing failed, falling back to individual processing:', error);
      await this.processSequentially(requests);
    }
  }

  /**
   * Process requests sequentially with small delays
   */
  private async processSequentially(requests: BatchRequest<any, any>[]): Promise<void> {
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      try {
        const result = await askLLM(
          request.promptText,
          request.outputSchema,
          request.inputOptions,
          request.outputOptions
        );
        request.resolve(result);
        
        // Add small delay between requests to spread them out
        if (i < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        request.reject(error);
      }
    }
  }

  /**
   * Check if a request can be batched with others
   */
  private isBatchable(promptText: string): boolean {
    const batchablePatterns = [
      'Parse the provided item text into',
      'Extract the item name and description',
      'Parse the following item data'
    ];
    
    return batchablePatterns.some(pattern => promptText.includes(pattern));
  }

  /**
   * Create a key for grouping similar requests
   */
  private createBatchKey(promptText: string, schema: ZodSchema): string {
    if (promptText.includes('Parse the provided item text into')) {
      return 'item_parsing';
    }
    if (promptText.includes('Extract the item name and description')) {
      return 'item_extraction';
    }
    
    // Default: hash of prompt template
    const templateHash = promptText.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '');
    return `generic_${templateHash}`;
  }

  /**
   * Get current batch processor status
   */
  getStatus() {
    const pendingCount = Array.from(this.pendingRequests.values())
      .reduce((total, batch) => total + batch.length, 0);
    
    return {
      enableBatching: this.config.enableBatching,
      pendingBatches: this.pendingRequests.size,
      pendingRequests: pendingCount,
      activeTimers: this.batchTimers.size
    };
  }

  /**
   * Enable or disable batching
   */
  setBatching(enabled: boolean) {
    this.config.enableBatching = enabled;
    
    // If disabling, process all pending batches immediately
    if (!enabled) {
      for (const batchKey of this.pendingRequests.keys()) {
        this.processBatch(batchKey);
      }
    }
  }
}

// Global batch processor instance
const globalBatchProcessor = new BatchProcessor();

export default globalBatchProcessor;
export { BatchProcessor, type BatchConfig };