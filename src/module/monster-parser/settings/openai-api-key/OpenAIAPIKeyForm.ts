import OpenAIAPIKeyStorage from './OpenAIAPIKeyStorage';
/* eslint-disable @typescript-eslint/ban-ts-comment */

export default class OpenAIAPIKeyForm extends foundry.applications.api.ApplicationV2 {
  onValidated: () => void;

  constructor(options = {}, onValidated: () => void = () => undefined) {
    super(options);
    this.onValidated = onValidated;
  }

  static DEFAULT_OPTIONS = {
    id: 'openai-api-key-form',
    tag: 'form',
    window: {
      title: 'OpenAI API Key',
      icon: 'fas fa-key'
    },
    position: {
      width: 500,
      height: 'auto'
    },
    form: {
      handler: OpenAIAPIKeyForm.formHandler,
      submitOnChange: false,
      closeOnSubmit: false
    },
    classes: ['form', 'sheet']
  };

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, this.DEFAULT_OPTIONS);
  }
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const validationStatus = await OpenAIAPIKeyStorage.getStoredApiKeyValidationStatus();
    if (validationStatus === 'VALID') this.onValidated();
    return {
      ...context,
      // TODO - add non-localStorage option
      apiKey: OpenAIAPIKeyStorage.getApiKey(),
      apiKeyIsValid: validationStatus === 'VALID',
      apiKeyIsInvalid: validationStatus === 'INVALID_KEY',
      apiKeyHasNoModelAccess: validationStatus === 'NO_MODEL_ACCESS',
    };
  }

  get title() {
    // TODO - localize
    return 'OpenAI API Key Settings';
  }

  static async formHandler(event, form, formData) {
    OpenAIAPIKeyStorage.setApiKey(formData.get('apiKey'));
    // Note: 'this' context is different in static method
    // The form instance would need to be passed or accessed differently
  }

  async _renderHTML(context, options) {
    const template = 'modules/llm-text-content-importer/templates/openai_api_key_form.hbs';
    return renderTemplate(template, context);
  }
}
