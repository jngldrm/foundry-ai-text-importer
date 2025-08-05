const VALIDATION_API_ENDPOINT = 'https://api.openai.com/v1/models';
const VALID_MODEL_CONTAINS = 'gpt-4';
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
    // Validate the key against the backend
    const response = await fetch(VALIDATION_API_ENDPOINT, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 200) {
      const models = await response.json();
      if (!!models?.data?.find((model) => model.id.includes(VALID_MODEL_CONTAINS))) {
        return 'VALID';
      } else return 'NO_MODEL_ACCESS';
    }
    return 'INVALID_KEY';
  }
}
