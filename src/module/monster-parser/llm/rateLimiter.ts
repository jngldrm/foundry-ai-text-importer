/**
 * Rate limiter for OpenAI API calls to prevent quota exceeded errors
 */

import apiConfig from './apiConfig';

interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerSecond: number;
  maxConcurrent: number;
}

interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RateLimiter {
  private config: RateLimitConfig;
  private requestQueue: QueuedRequest[] = [];
  private activeRequests = 0;
  private requestTimestamps: number[] = [];

  constructor(config?: RateLimitConfig) {
    this.config = config || this.getConfigFromAPIConfig();
  }

  private getConfigFromAPIConfig(): RateLimitConfig {
    const rateLimitConfig = apiConfig.getRateLimitConfig();
    return {
      requestsPerMinute: rateLimitConfig.requestsPerMinute,
      requestsPerSecond: rateLimitConfig.requestsPerSecond,
      maxConcurrent: rateLimitConfig.maxConcurrent
    };
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If rate limiting is disabled, execute immediately
    if (!apiConfig.getRateLimitConfig().enabled) {
      return fn();
    }

    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({
        execute: fn,
        resolve,
        reject
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0 || this.activeRequests >= this.config.maxConcurrent) {
      return;
    }

    if (!this.canMakeRequest()) {
      // Wait and try again
      const delay = this.getWaitTime();
      setTimeout(() => this.processQueue(), delay);
      return;
    }

    const request = this.requestQueue.shift();
    if (!request) return;

    this.activeRequests++;
    this.requestTimestamps.push(Date.now());

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      // Process next request after a small delay
      setTimeout(() => this.processQueue(), 100);
    }
  }

  private canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneSecondAgo = now - 1000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);

    const requestsInLastMinute = this.requestTimestamps.length;
    const requestsInLastSecond = this.requestTimestamps.filter(ts => ts > oneSecondAgo).length;

    return requestsInLastMinute < this.config.requestsPerMinute && 
           requestsInLastSecond < this.config.requestsPerSecond;
  }

  private getWaitTime(): number {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    const requestsInLastSecond = this.requestTimestamps.filter(ts => ts > oneSecondAgo).length;
    
    if (requestsInLastSecond >= this.config.requestsPerSecond) {
      // Wait until we can make another request per second
      return 1000;
    }
    
    // Default small delay
    return 200;
  }

  /**
   * Get current rate limiter status
   */
  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneSecondAgo = now - 1000;
    
    const requestsInLastMinute = this.requestTimestamps.filter(ts => ts > oneMinuteAgo).length;
    const requestsInLastSecond = this.requestTimestamps.filter(ts => ts > oneSecondAgo).length;
    
    return {
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      requestsInLastMinute,
      requestsInLastSecond,
      canMakeRequest: this.canMakeRequest()
    };
  }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter();

export default globalRateLimiter;
export { RateLimiter, type RateLimitConfig };