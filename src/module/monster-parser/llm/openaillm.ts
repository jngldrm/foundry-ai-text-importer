import { OpenAI } from 'langchain/llms/openai';
import OpenAIAPIKeyStorage from '../settings/openai-api-key/OpenAIAPIKeyStorage';
import featureFlags from '../../featureFlags';

const DEFAULT_OPENAI_MODEL_NAME = 'gpt-4-turbo-preview';

const OpenAILLM = (modelOverride?: string): OpenAI => {
  let modelName;
  if (featureFlags.modelSelector) {
    const selectedModelName = game.settings.get('llm-text-content-importer', 'openaiModel') as string;
    modelName = modelOverride || selectedModelName || DEFAULT_OPENAI_MODEL_NAME;
  } else {
    modelName = modelOverride || DEFAULT_OPENAI_MODEL_NAME;
  }
  console.log('initializing OpenAI LLM with model: ', modelName);
  return new OpenAI({
    modelName,
    temperature: 0,
    openAIApiKey: OpenAIAPIKeyStorage.getApiKey(),
  });
};

export default OpenAILLM;
