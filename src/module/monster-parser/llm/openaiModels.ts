import OpenAIAPIKeyStorage from '../settings/openai-api-key/OpenAIAPIKeyStorage';

type OpenAIModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

const MODELS_API_ENDPOINT = 'https://api.openai.com/v1/models';

export const fetchGPTModels = async (): Promise<Array<OpenAIModel>> => {
  const apiKey = OpenAIAPIKeyStorage.getApiKey();
  const response = await fetch(MODELS_API_ENDPOINT, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const allModels = (await response.json()).data as Array<OpenAIModel>;
  return allModels.filter((model) => model.id.includes('gpt'));
};
