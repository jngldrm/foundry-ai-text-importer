import { ChatOpenAI } from '@langchain/openai';
import OpenAIAPIKeyStorage from '../settings/openai-api-key/OpenAIAPIKeyStorage';
import featureFlags from '../../featureFlags';

const DEFAULT_OPENAI_MODEL_NAME = 'gpt-5-mini';

const OpenAILLM = (modelOverride?: string): ChatOpenAI => {
  let modelName;
  if (featureFlags.modelSelector) {
    const selectedModelName = (game as any).settings.get('llm-text-content-importer', 'openaiModel') as string;
    modelName = modelOverride || selectedModelName || DEFAULT_OPENAI_MODEL_NAME;
  } else {
    modelName = modelOverride || DEFAULT_OPENAI_MODEL_NAME;
  }
  console.log('initializing ChatOpenAI LLM with model: ', modelName);
  return new ChatOpenAI({
    model: modelName,
    temperature: 1,
    apiKey: OpenAIAPIKeyStorage.getApiKey(),
  });
};

export default OpenAILLM;
