/**
 * Enhanced error handling for OpenAI API quota and rate limit errors
 */

interface APIErrorInfo {
  isQuotaError: boolean;
  isRateLimitError: boolean;
  userMessage: string;
  technicalMessage: string;
  suggestedAction: string;
  retryAfter?: number;
}

class APIErrorHandler {
  /**
   * Analyze and categorize API errors
   */
  static analyzeError(error: any): APIErrorInfo {
    const errorMessage = error.message || error.toString();
    const errorStatus = error.status || error.response?.status;
    
    // Check for quota exceeded errors
    if (this.isQuotaExceededError(error)) {
      return {
        isQuotaError: true,
        isRateLimitError: false,
        userMessage: "OpenAI API quota exceeded. Please check your billing and usage limits.",
        technicalMessage: errorMessage,
        suggestedAction: "Visit https://platform.openai.com/usage to check your quota and billing status. You may need to add credits or upgrade your plan."
      };
    }
    
    // Check for rate limit errors (429)
    if (this.isRateLimitError(error)) {
      const retryAfter = this.parseRetryAfter(error);
      return {
        isQuotaError: false,
        isRateLimitError: true,
        userMessage: `API rate limit exceeded. ${retryAfter ? `Retry after ${Math.ceil(retryAfter / 1000)} seconds.` : 'Please wait and try again.'}`,
        technicalMessage: errorMessage,
        suggestedAction: "The system will automatically retry with exponential backoff. If this persists, consider reducing concurrent requests.",
        retryAfter
      };
    }
    
    // Generic API errors
    if (errorStatus >= 400) {
      return {
        isQuotaError: false,
        isRateLimitError: false,
        userMessage: `OpenAI API error (${errorStatus}): ${this.getGenericErrorMessage(errorStatus)}`,
        technicalMessage: errorMessage,
        suggestedAction: this.getGenericErrorSuggestion(errorStatus)
      };
    }
    
    // Unknown errors
    return {
      isQuotaError: false,
      isRateLimitError: false,
      userMessage: "An unexpected error occurred while communicating with OpenAI.",
      technicalMessage: errorMessage,
      suggestedAction: "Please check your internet connection and API key configuration."
    };
  }

  /**
   * Display user-friendly error message in FoundryVTT
   */
  static displayError(errorInfo: APIErrorInfo, context: string = 'API operation') {
    const title = errorInfo.isQuotaError ? 'OpenAI Quota Exceeded' 
                 : errorInfo.isRateLimitError ? 'Rate Limit Exceeded'
                 : 'API Error';
                 
    const content = `
      <div style="margin-bottom: 10px;">
        <strong>${errorInfo.userMessage}</strong>
      </div>
      <div style="margin-bottom: 10px; font-size: 0.9em; color: #666;">
        Context: ${context}
      </div>
      <div style="margin-bottom: 10px; font-size: 0.9em;">
        <strong>Suggested Action:</strong><br>
        ${errorInfo.suggestedAction}
      </div>
      <details style="margin-top: 10px;">
        <summary style="cursor: pointer; color: #666;">Technical Details</summary>
        <pre style="font-size: 0.8em; background: #f5f5f5; padding: 10px; margin-top: 5px; border-radius: 4px;">${errorInfo.technicalMessage}</pre>
      </details>
    `;

    (ui as any).notifications.error(title, { content, permanent: true });
    
    // Also log to console for debugging
    console.error(`${title} in ${context}:`, {
      errorInfo,
      originalError: errorInfo.technicalMessage
    });
  }

  /**
   * Log rate limiter status for debugging
   */
  static logRateLimiterStatus(rateLimiter: any) {
    const status = rateLimiter.getStatus();
    console.log('Rate Limiter Status:', {
      activeRequests: status.activeRequests,
      queuedRequests: status.queuedRequests,
      requestsInLastMinute: status.requestsInLastMinute,
      requestsInLastSecond: status.requestsInLastSecond,
      canMakeRequest: status.canMakeRequest,
      timestamp: new Date().toISOString()
    });
  }

  private static isQuotaExceededError(error: any): boolean {
    const message = (error.message || '').toLowerCase();
    return message.includes('quota') && message.includes('exceeded') ||
           message.includes('insufficient_quota') ||
           error.name === 'InsufficientQuotaError' ||
           error.code === 'insufficient_quota';
  }

  private static isRateLimitError(error: any): boolean {
    const message = (error.message || '').toLowerCase();
    return error.status === 429 ||
           message.includes('rate limit') ||
           message.includes('429') ||
           error.name === 'RateLimitError';
  }

  private static parseRetryAfter(error: any): number | null {
    const retryAfter = error.response?.headers?.['retry-after'] || 
                      error.headers?.['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000; // Convert to milliseconds
      }
    }
    return null;
  }

  private static getGenericErrorMessage(status: number): string {
    switch (status) {
      case 401: return 'Invalid or missing API key';
      case 403: return 'Access forbidden - check API key permissions';
      case 404: return 'Requested resource not found';
      case 500: return 'OpenAI server error';
      case 502: return 'Bad gateway - OpenAI service issue';
      case 503: return 'Service temporarily unavailable';
      default: return 'Request failed';
    }
  }

  private static getGenericErrorSuggestion(status: number): string {
    switch (status) {
      case 401: return 'Check your OpenAI API key in the module settings.';
      case 403: return 'Verify your API key has the necessary permissions for GPT models.';
      case 404: return 'The requested model may not be available with your API key.';
      case 500:
      case 502:
      case 503: return 'This is a temporary OpenAI service issue. Please try again in a few minutes.';
      default: return 'Check your internet connection and try again.';
    }
  }
}

export default APIErrorHandler;
export { type APIErrorInfo };