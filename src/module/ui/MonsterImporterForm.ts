import { OpenAI } from '@langchain/openai';
import genFoundry5eMonsterActorFromTextBlock from '../genFoundryActorFromMonsterTextBlock';
import genFoundry5eItemActorFromTextBlock from '../genFoundryItemFromTextBlock';
import OpenAIAPIKeyStorage, {
  APIKeyValidationStatus,
} from '../monster-parser/settings/openai-api-key/OpenAIAPIKeyStorage';
import OpenAIAPIKeyForm from '../monster-parser/settings/openai-api-key/OpenAIAPIKeyForm';
import foundryMonsterCompendia, {
  DEFAULT_MONSTER_COMPENDIUM_NAME,
} from '../monster-parser/foundry-compendia/FoundryMonsterCompendia';
import foundryItemCompendia, {
  DEFAULT_ITEM_COMPENDIUM_NAME,
} from '../monster-parser/foundry-compendia/FoundryItemCompendia';
import { fetchGPTModels } from '../monster-parser/llm/openaiModels';
import featureFlags from '../featureFlags';
// V13 types - Data interface may have changed, will need to verify
// import { Data } from 'fvtt-types/src/foundry/foundry.js/roll';
import TaskTracker from '../performanceUtils/TaskTracker';

type DropdownOption = {
  name: string;
  label: string;
  isSelected: boolean;
};

type FormData = {
  title: string;
  invalidAPIKey: boolean;
  isLoading: boolean;
  actorCompendiumOptions: DropdownOption[];
  itemCompendiumOptions: DropdownOption[];
  modelOptions: DropdownOption[];
  showModelSelector: boolean;
  activeTab: 'monsters' | 'items';
};

const RERENDER_DURING_LOAD_INTERVAL_MS = 1000;
/**
 * Imports a monster from a single text block using AI
 *
 * Eventually, this will not be for just monsters, or there will be a generalized version.
 * 
 * Migrated to ApplicationV2 for FoundryVTT v13+ compatibility
 **/
class MonsterImporterForm extends foundry.applications.api.ApplicationV2 {
  userText: string;
  isLoading = false;
  apiKeyValidationStatus: APIKeyValidationStatus = 'VALID'; // Initialize to VALID but validate in the background
  doesAPIKeyHaveProperModelAccess = true;
  showProgressView = false;
  activeTab: 'monsters' | 'items' = 'monsters';
  // one-timevalidators
  hasValidatedAPIKey = false;
  hasEnsuredDefaultMonsterCompendiumExists = false;
  hasEnsuredDefaultItemCompendiumExists = false;
  hasValidatedSelectedMonsterCompendium = false;
  hasValidatedSelectedItemCompendium = false;
  keyForm: OpenAIAPIKeyForm;
  // Loading Tasks
  tickerTimeout: NodeJS.Timeout;
  // View state

  constructor(options = {}) {
    super(options);
    this.userText = '';
    this.checkAPIKey();
    this.keyForm = new OpenAIAPIKeyForm({}, this.reload);
    // Not the best place for this, I want to decouple this from MonsterImporterForm
    TaskTracker.clear();
  }

  reload = async () => {
    this.hasValidatedAPIKey = false; // re-validate API key
    this.hasEnsuredDefaultMonsterCompendiumExists = false;
    this.hasEnsuredDefaultItemCompendiumExists = false;
    this.hasValidatedSelectedMonsterCompendium = false;
    this.hasValidatedSelectedItemCompendium = false;
    this.render();
    await this.keyForm.close({ force: true });
  };

  static DEFAULT_OPTIONS = {
    id: 'monster-importer-form',
    tag: 'form',
    window: {
      title: 'LLMTCI.MonsterFormTitle',
      icon: 'fas fa-scroll-old',
      resizable: true
    },
    position: {
      width: 900,
      height: 'auto'
    },
    form: {
      handler: MonsterImporterForm.formHandler,
      submitOnChange: false,
      closeOnSubmit: false
    },
    classes: ['sheet']
  };

  static get defaultOptions() {
    return (foundry.utils as any).mergeObject(super.DEFAULT_OPTIONS, this.DEFAULT_OPTIONS);
  }

  startLoad() {
    this.isLoading = true;
    this.showProgressView = true;
    // when loading, "tick" to rerender and update the time elapsed
    this.tickerTimeout = setInterval(() => {
      this.render();
    }, RERENDER_DURING_LOAD_INTERVAL_MS);
  }

  endLoad() {
    this.isLoading = false;
    clearInterval(this.tickerTimeout);
    this.render();
  }

  updateTabDisplay(html: HTMLElement) {
    // Update tab button states
    const monsterTab = html.querySelector('#llmtci-tab-monsters');
    const itemTab = html.querySelector('#llmtci-tab-items');
    const monsterContent = html.querySelector('#monsters-content') as HTMLElement;
    const itemContent = html.querySelector('#items-content') as HTMLElement;

    if (monsterTab && itemTab && monsterContent && itemContent) {
      // Remove active class from all tabs
      monsterTab.classList.remove('active');
      itemTab.classList.remove('active');

      // Hide all content
      monsterContent.style.display = 'none';
      itemContent.style.display = 'none';

      // Show active tab and content
      if (this.activeTab === 'monsters') {
        monsterTab.classList.add('active');
        monsterContent.style.display = 'block';
      } else {
        itemTab.classList.add('active');
        itemContent.style.display = 'block';
      }
    }
  }

  async _renderHTML(context, options) {
    // ApplicationV2 template rendering
    const template = 'modules/llm-text-content-importer/templates/monster_importer_form.hbs';
    return renderTemplate(template, context);
  }

  async _replaceHTML(result, content, options) {
    // ApplicationV2 DOM replacement method
    content.innerHTML = result;
    return content;
  }

  async _onRender(context, options) {
    // ApplicationV2 equivalent of activateListeners
    await super._onRender(context, options);
    
    const html = this.element;
    
    // Initialize tab state
    this.updateTabDisplay(html);
    
    // Tab switching handlers
    html.querySelector('#llmtci-tab-monsters')?.addEventListener('click', async (event) => {
      event.preventDefault();
      this.activeTab = 'monsters';
      this.updateTabDisplay(html);
    });
    
    html.querySelector('#llmtci-tab-items')?.addEventListener('click', async (event) => {
      event.preventDefault();
      this.activeTab = 'items';
      this.updateTabDisplay(html);
    });
    
    // Submit button handler - handles both monsters and items
    html.querySelector('#llmtci-submit')?.addEventListener('click', async (event) => {
      event.preventDefault();
      const userText = (html.querySelector('#llmtci-userText') as HTMLInputElement)?.value as string;
      this.userText = userText;
      this.startLoad();
      
      if (this.activeTab === 'monsters') {
        // main text block parsing function for monsters
        await genFoundry5eMonsterActorFromTextBlock(userText);
      } else if (this.activeTab === 'items') {
        // main text block parsing function for items
        await genFoundry5eItemActorFromTextBlock(userText);
      }
      
      this.endLoad();
    });
    
    // API Key update button
    html.querySelector('#llmtci-updateAPIKey')?.addEventListener('click', async (event) => {
      event.preventDefault();
      this.keyForm.render(true);
    });
    
    // Monster compendium select handler
    html.querySelector('#llmtci-monster-compendiumSelect')?.addEventListener('change', async (event) => {
      event.preventDefault();
      const selectedCompendiumName = (event.target as HTMLSelectElement).value;
      (game as any).settings.set('llm-text-content-importer', 'compendiumImportDestination', selectedCompendiumName);
    });
    
    // Item compendium select handler
    html.querySelector('#llmtci-item-compendiumSelect')?.addEventListener('change', async (event) => {
      event.preventDefault();
      const selectedCompendiumName = (event.target as HTMLSelectElement).value;
      (game as any).settings.set('llm-text-content-importer', 'itemCompendiumImportDestination', selectedCompendiumName);
    });
    
    // Model selector (if enabled)
    if (featureFlags.modelSelector) {
      html.querySelector('#llmtci-modelSelect')?.addEventListener('change', async (event) => {
        event.preventDefault();
        const selectedModelId = (event.target as HTMLSelectElement).value;
        (game as any).settings.set('llm-text-content-importer', 'openaiModel', selectedModelId);
      });
    }
    
    // Import another button (progress view)
    if (this.showProgressView) {
      html.querySelector('#llmtci-import-another')?.addEventListener('click', async (event) => {
        event.preventDefault();
        this.showProgressView = false;
        TaskTracker.clear();
        this.render();
      });
    }
  }

  async checkAPIKey(): Promise<void> {
    const formerApiKeyValidationStatus = this.apiKeyValidationStatus;
    this.apiKeyValidationStatus = await OpenAIAPIKeyStorage.getStoredApiKeyValidationStatus();
    if (formerApiKeyValidationStatus !== this.apiKeyValidationStatus) {
      this.render();
    }
  }


  async genActorCompendiumOptions(): Promise<DropdownOption[]> {
    const actorCompendia = await foundryMonsterCompendia.getAllActorCompendia();
    // Compendium options
    const selectedCompendiumName = (game as any).settings.get('llm-text-content-importer', 'compendiumImportDestination');
    return actorCompendia.map((compendium) => {
      return {
        name: compendium.metadata.name,
        label: compendium.metadata.label,
        isSelected: selectedCompendiumName === compendium.metadata.name,
      };
    });
  }

  async genItemCompendiumOptions(): Promise<DropdownOption[]> {
    const itemCompendia = await foundryItemCompendia.getAllItemCompendia();
    // Compendium options
    const selectedCompendiumName = (game as any).settings.get('llm-text-content-importer', 'itemCompendiumImportDestination');
    return itemCompendia.map((compendium) => {
      return {
        name: compendium.metadata.name,
        label: compendium.metadata.label,
        isSelected: selectedCompendiumName === compendium.metadata.name,
      };
    });
  }

  async genModelOptions(): Promise<DropdownOption[]> {
    const gptModels = await fetchGPTModels();
    const selectedModelId = (game as any).settings.get('llm-text-content-importer', 'openaiModel');
    return gptModels.map((model) => {
      return {
        name: model.id,
        label: model.id,
        isSelected: selectedModelId === model.id,
      };
    });
  }

  static async formHandler(event, form, formData) {
    // Handle form submission for ApplicationV2
    return 1;
  }

  async _prepareContext(options) {
    // This replaces getData() in FormApplication
    const context = await super._prepareContext(options);
    
    const validators: Promise<any>[] = [];
    if (!this.hasValidatedAPIKey) {
      validators.push(this.checkAPIKey());
      this.hasValidatedAPIKey = true;
    }
    if (!this.hasEnsuredDefaultMonsterCompendiumExists) {
      validators.push(foundryMonsterCompendia.ensureDefaultCompendiumExists());
      this.hasEnsuredDefaultMonsterCompendiumExists = true;
    }
    if (!this.hasEnsuredDefaultItemCompendiumExists) {
      validators.push(foundryItemCompendia.ensureDefaultItemCompendiumExists());
      this.hasEnsuredDefaultItemCompendiumExists = true;
    }
    if (!this.hasValidatedSelectedMonsterCompendium) {
      validators.push(foundryMonsterCompendia.validateAndMaybeResetSelectedCompendium());
      this.hasValidatedSelectedMonsterCompendium = true;
    }
    if (!this.hasValidatedSelectedItemCompendium) {
      validators.push(foundryItemCompendia.validateAndMaybeResetSelectedItemCompendium());
      this.hasValidatedSelectedItemCompendium = true;
    }

    await Promise.all(validators);
    
    return {
      ...context,
      title: (game as any).i18n.localize('LLMTCI.ImporterFormTitle') || 'AI Text Importer',
      apiKeyIsInvalid: this.apiKeyValidationStatus === 'INVALID_KEY',
      apiKeyHasNoModelAccess: this.apiKeyValidationStatus === 'NO_MODEL_ACCESS',
      isLoading: this.isLoading,
      showProgressView: this.showProgressView,
      activeTab: this.activeTab,
      actorCompendiumOptions: await this.genActorCompendiumOptions(),
      itemCompendiumOptions: await this.genItemCompendiumOptions(),
      showModelSelector: featureFlags.modelSelector,
      modelOptions: featureFlags.modelSelector ? await this.genModelOptions() : [],
      tasks: TaskTracker.tasks,
    };
  }
}

export default MonsterImporterForm;
