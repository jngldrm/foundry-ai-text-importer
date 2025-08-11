const VALIDATION_API_ENDPOINT = 'https://api.openai.com/v1/models';
const VALID_MODEL_CONTAINS = 'gpt-5';
export type APIKeyValidationStatus = 'VALID' | 'NO_MODEL_ACCESS' | 'INVALID_KEY';

export default class OpenAIAPIKeyStorage {
  static setApiKey(apiKey: string) {
    localStorage.setItem('openai-api-key', apiKey);
  }

  static getApiKey(): string {
    return localStorage.getItem('openai-api-key') || '';
  }

  static async getStoredApiKeyValidationStatus(): Promise<APIKeyValidationStatus> {
    const apiKey = OpenAIAPIKeyStorage.getApiKey();
    if (apiKey === '') {
      return 'INVALID_KEY';
    }
    
    try {
      // Validate the key against the backend
      const response = await fetch(VALIDATION_API_ENDPOINT, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Key validation response status:', response.status);
      
      if (response.status === 200) {
        const models = await response.json();
        console.log('Available models:', models?.data?.map(m => m.id) || []);
        
        if (!!models?.data?.find((model) => model.id.includes(VALID_MODEL_CONTAINS))) {
          console.log('API key validation: VALID');
          return 'VALID';
        } else {
          console.log('API key validation: NO_MODEL_ACCESS');
          return 'NO_MODEL_ACCESS';
        }
      } else {
        const errorText = await response.text();
        console.error('API key validation failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('API key validation error:', error);
    }
    
    return 'INVALID_KEY';
  }
}
