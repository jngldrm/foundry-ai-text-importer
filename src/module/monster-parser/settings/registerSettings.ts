import featureFlags from '../../featureFlags';
import OpenAIAPIKeyForm from './openai-api-key/OpenAIAPIKeyForm';

export const registerSettings = (): void => {
  game.settings.registerMenu('llm-text-content-importer', 'openaiAPIKeyMenu', {
    name: 'OpenAI API Key',
    label: 'OpenAI API Key',
    hint: 'Your Secret API key for OpenAI (stored locally)',
    icon: 'fas fa-wrench',
    type: OpenAIAPIKeyForm, // Number, Boolean, String, Object
    restricted: true,
  });
  game.settings.register('llm-text-content-importer', 'compendiumImportDestination', {
    name: 'Compendium Import Destination',
    hint: 'The compendium your monsters will be imported to',
    type: String,
    config: true, // Might want to take it out and just have it in input UI
    scope: 'world', // "world" | "client" | "server"
  });
  game.settings.register('llm-text-content-importer', 'openaiModel', {
    name: 'OpenAI Model',
    hint: 'The OpenAI model to use for generating monsters',
    type: String,
    config: featureFlags.modelSelector, // TODO - this needs to support a dropdown, not plaintext
    scope: 'world', // "world" | "client" | "server"
  });
};
