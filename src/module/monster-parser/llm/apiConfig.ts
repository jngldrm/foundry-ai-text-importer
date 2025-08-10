/**
 * Configuration for OpenAI API optimization settings
 */

interface APIOptimizationConfig {
  // Rate limiting settings
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerSecond: number;
    maxConcurrent: number;
  };
  
  // Retry settings
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
  };
  
  // Batch processing settings
  batching: {
    enabled: boolean;
    maxBatchSize: number;
    batchTimeoutMs: number;
  };
  
  // Monster parsing strategy
  parsing: {
    defaultStrategy: 'ONE_CALL' | 'SEPARATE_ITEMS_AND_STATS' | 'SMALL_SCHEMA_NO_CHUNKS' | 'SMALL_SCHEMA_IN_CHUNKS';
    useChunksForComplexItems: boolean;
    itemComplexityThreshold: number; // characters
  };
  
  // Debug settings
  debug: {
    logRateLimiterStatus: boolean;
    logBatchingStatus: boolean;
    logRetryAttempts: boolean;
  };
}

class APIConfigManager {
  private static instance: APIConfigManager;
  private config: APIOptimizationConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.loadFromFoundrySettings();
  }

  static getInstance(): APIConfigManager {
    if (!APIConfigManager.instance) {
      APIConfigManager.instance = new APIConfigManager();
    }
    return APIConfigManager.instance;
  }

  private getDefaultConfig(): APIOptimizationConfig {
    return {
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 50,
        requestsPerSecond: 3,
        maxConcurrent: 5
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 5,
        initialDelayMs: 2000,
        maxDelayMs: 60000,
        backoffMultiplier: 2.5
      },
      batching: {
        enabled: true,
        maxBatchSize: 5,
        batchTimeoutMs: 100
      },
      parsing: {
        defaultStrategy: 'SMALL_SCHEMA_NO_CHUNKS',
        useChunksForComplexItems: false,
        itemComplexityThreshold: 500
      },
      debug: {
        logRateLimiterStatus: false,
        logBatchingStatus: false,
        logRetryAttempts: true
      }
    };
  }

  private loadFromFoundrySettings(): void {
    try {
      // Load from Foundry settings if available
      if (typeof game !== 'undefined' && game && (game as any).settings) {
        const settings = (game as any).settings;
        
        // Rate limiting settings
        const rateLimitEnabled = settings.get('llm-text-content-importer', 'rateLimitingEnabled') as boolean;
        if (rateLimitEnabled !== undefined) {
          this.config.rateLimiting.enabled = rateLimitEnabled;
        }
        
        const requestsPerMinute = settings.get('llm-text-content-importer', 'requestsPerMinute') as number;
        if (requestsPerMinute) {
          this.config.rateLimiting.requestsPerMinute = requestsPerMinute;
        }
        
        const maxConcurrent = settings.get('llm-text-content-importer', 'maxConcurrentRequests') as number;
        if (maxConcurrent) {
          this.config.rateLimiting.maxConcurrent = maxConcurrent;
        }
        
        // Batching settings
        const batchingEnabled = settings.get('llm-text-content-importer', 'batchingEnabled') as boolean;
        if (batchingEnabled !== undefined) {
          this.config.batching.enabled = batchingEnabled;
        }
        
        // Parsing strategy
        const parsingStrategy = settings.get('llm-text-content-importer', 'defaultParsingStrategy') as string;
        if (parsingStrategy) {
          this.config.parsing.defaultStrategy = parsingStrategy as any;
        }
        
        // Debug settings
        const debugLogging = settings.get('llm-text-content-importer', 'debugLogging') as boolean;
        if (debugLogging !== undefined) {
          this.config.debug.logRateLimiterStatus = debugLogging;
          this.config.debug.logBatchingStatus = debugLogging;
        }
      }
    } catch (error) {
      console.warn('Failed to load API optimization settings from Foundry:', error);
    }
  }

  getConfig(): APIOptimizationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<APIOptimizationConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      rateLimiting: { ...this.config.rateLimiting, ...(updates.rateLimiting || {}) },
      retryPolicy: { ...this.config.retryPolicy, ...(updates.retryPolicy || {}) },
      batching: { ...this.config.batching, ...(updates.batching || {}) },
      parsing: { ...this.config.parsing, ...(updates.parsing || {}) },
      debug: { ...this.config.debug, ...(updates.debug || {}) },
    };
  }

  /**
   * Get rate limiting configuration
   */
  getRateLimitConfig() {
    return this.config.rateLimiting;
  }

  /**
   * Get retry policy configuration
   */
  getRetryConfig() {
    return this.config.retryPolicy;
  }

  /**
   * Get batching configuration
   */
  getBatchConfig() {
    return this.config.batching;
  }

  /**
   * Get parsing configuration
   */
  getParsingConfig() {
    return this.config.parsing;
  }

  /**
   * Check if debug logging is enabled for a specific feature
   */
  isDebugEnabled(feature: keyof APIOptimizationConfig['debug']): boolean {
    return this.config.debug[feature];
  }

  /**
   * Get user-friendly status report
   */
  getStatusReport() {
    return {
      rateLimiting: {
        enabled: this.config.rateLimiting.enabled,
        limits: `${this.config.rateLimiting.requestsPerSecond}/sec, ${this.config.rateLimiting.requestsPerMinute}/min`,
        maxConcurrent: this.config.rateLimiting.maxConcurrent
      },
      retryPolicy: {
        enabled: this.config.retryPolicy.enabled,
        maxRetries: this.config.retryPolicy.maxRetries,
        backoffRange: `${this.config.retryPolicy.initialDelayMs}ms - ${this.config.retryPolicy.maxDelayMs}ms`
      },
      batching: {
        enabled: this.config.batching.enabled,
        maxBatchSize: this.config.batching.maxBatchSize,
        timeout: `${this.config.batching.batchTimeoutMs}ms`
      },
      parsing: {
        strategy: this.config.parsing.defaultStrategy,
        chunking: this.config.parsing.useChunksForComplexItems ? 'Smart chunking' : 'Disabled'
      }
    };
  }

  /**
   * Register Foundry settings for the optimization config
   */
  static registerFoundrySettings(): void {
    const settings = (game as any).settings;
    const moduleId = 'llm-text-content-importer';

    // Rate limiting settings
    settings.register(moduleId, 'rateLimitingEnabled', {
      name: 'Enable API Rate Limiting',
      hint: 'Limit the rate of OpenAI API calls to prevent quota exceeded errors',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    settings.register(moduleId, 'requestsPerMinute', {
      name: 'Requests Per Minute',
      hint: 'Maximum number of OpenAI API requests per minute',
      scope: 'world',
      config: true,
      type: Number,
      default: 50,
      range: {
        min: 10,
        max: 500,
        step: 10
      }
    });

    settings.register(moduleId, 'maxConcurrentRequests', {
      name: 'Max Concurrent Requests',
      hint: 'Maximum number of simultaneous OpenAI API requests',
      scope: 'world',
      config: true,
      type: Number,
      default: 5,
      range: {
        min: 1,
        max: 20,
        step: 1
      }
    });

    // Batching settings
    settings.register(moduleId, 'batchingEnabled', {
      name: 'Enable Request Batching',
      hint: 'Group similar API requests together to reduce total calls',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Parsing strategy
    settings.register(moduleId, 'defaultParsingStrategy', {
      name: 'Default Parsing Strategy',
      hint: 'Strategy for parsing monsters - affects API usage and accuracy',
      scope: 'world',
      config: true,
      type: String,
      default: 'SMALL_SCHEMA_NO_CHUNKS',
      choices: {
        'ONE_CALL': 'One Call (Fastest, least API usage)',
        'SEPARATE_ITEMS_AND_STATS': 'Separate Items and Stats (Balanced)',
        'SMALL_SCHEMA_NO_CHUNKS': 'Small Schema (Recommended)',
        'SMALL_SCHEMA_IN_CHUNKS': 'Small Schema with Chunks (Most thorough, highest API usage)'
      }
    });

    // Debug settings
    settings.register(moduleId, 'debugLogging', {
      name: 'Enable Debug Logging',
      hint: 'Log detailed information about API rate limiting and batching',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
  }
}

// Export singleton instance
const apiConfig = APIConfigManager.getInstance();
export default apiConfig;
export { APIConfigManager, type APIOptimizationConfig };