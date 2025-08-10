/**
 * Retry handler with exponential backoff for OpenAI API errors
 */

import apiConfig from './apiConfig';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

interface RetryError extends Error {
  status?: number;
  code?: string;
}

class RetryHandler {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = this.getConfigFromAPIConfig(config);
  }

  private getConfigFromAPIConfig(overrides?: Partial<RetryConfig>): RetryConfig {
    const retryConfig = apiConfig.getRetryConfig();
    return {
      maxRetries: retryConfig.maxRetries,
      initialDelay: retryConfig.initialDelayMs,
      maxDelay: retryConfig.maxDelayMs,
      backoffMultiplier: retryConfig.backoffMultiplier,
      retryableStatusCodes: [429, 500, 502, 503, 504],
      ...overrides
    };
  }

  /**
   * Execute a function with retry logic and exponential backoff
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: string = 'API call'
  ): Promise<T> {
    // If retry policy is disabled, execute once
    if (!apiConfig.getRetryConfig().enabled) {
      return fn();
    }

    let lastError: RetryError;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // Log successful retry if this wasn't the first attempt
        if (attempt > 0) {
          console.log(`${context} succeeded after ${attempt} retries`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error as RetryError;
        
        // Check if this error is retryable
        if (!this.isRetryableError(error)) {
          console.error(`${context} failed with non-retryable error:`, error);
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === this.config.maxRetries) {
          console.error(`${context} failed after ${this.config.maxRetries} retries:`, error);
          throw error;
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt);
        
        // Log retry attempt
        console.warn(
          `${context} failed (attempt ${attempt + 1}/${this.config.maxRetries + 1}). ` +
          `Retrying in ${delay}ms. Error: ${error.message}`
        );
        
        // Wait before retrying
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private isRetryableError(error: any): boolean {
    // Check for specific OpenAI/LangChain error patterns
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return true;
    }
    
    // Check status codes
    if (error.status && this.config.retryableStatusCodes.includes(error.status)) {
      return true;
    }
    
    // Check for network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // Check for specific LangChain OpenAI errors
    if (error.name === 'InsufficientQuotaError' || error.name === 'RateLimitError') {
      return true;
    }
    
    return false;
  }

  private calculateDelay(attempt: number): number {
    const delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt);
    
    // Add jitter to avoid thundering herd
    const jitter = Math.random() * 0.1 * delay;
    
    return Math.min(delay + jitter, this.config.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse retry-after header from 429 responses
   */
  static parseRetryAfter(error: any): number | null {
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000; // Convert to milliseconds
      }
    }
    return null;
  }

  /**
   * Create a retry handler configured for OpenAI API
   */
  static forOpenAI(config: Partial<RetryConfig> = {}): RetryHandler {
    return new RetryHandler({
      maxRetries: 5,
      initialDelay: 2000,
      maxDelay: 60000,
      backoffMultiplier: 2.5,
      retryableStatusCodes: [429, 500, 502, 503, 504],
      ...config
    });
  }
}

// Global retry handler instance for OpenAI
const openAIRetryHandler = RetryHandler.forOpenAI();

export default openAIRetryHandler;
export { RetryHandler, type RetryConfig, type RetryError };