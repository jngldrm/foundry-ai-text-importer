import registerDummyTest from './dummyTest';
import registerExampleItemTests from './exampleItemTests';
import registerFormatInstructionsTests from './formatInstructionsTests';
import registerSpellcastingBasicItemTest from './llm-parsing-tests/llmParsingTests';
import registerMonsterCompendiaTests from './monsterCompendiaTests';
import registerImportParsed5eSpellcastingItemTest from './foundry/importBasicSpellcastingItemTest';

const registerQuenchTests = (quench): void => {
  quench.registerBatch('quench.llm-text-content-importer.dummy-test', registerDummyTest, {
    displayName: 'Testing Quench integration',
  });
  quench.registerBatch('quench.llm-text-content-importer.example-item-tests', registerExampleItemTests, {
    displayName: 'Searching Compendia for example items',
  });
  quench.registerBatch('quench.llm-text-content-importer.monster-compendia-tests', registerMonsterCompendiaTests, {
    displayName: 'Testing Monster Compendia Import/Export',
  });
  quench.registerBatch('quench.llm-text-content-importer.format-instructions-tests', registerFormatInstructionsTests, {
    displayName: 'Testing format instructions',
  });
  quench.registerBatch(
    'quench.llm-text-content-importer.spellcasting-item-llm-tests',
    registerSpellcastingBasicItemTest,
    {
      displayName: 'Testing LLM Parsing',
      preSelected: false,
    },
  );
  quench.registerBatch(
    'quench.llm-text-content-importer.spellcasting-foundry-import-tests',
    registerImportParsed5eSpellcastingItemTest,
    {
      displayName: 'Testing LLM Parsing Spellcasting Basic Item',
      preSelected: false,
    },
  );
};

export default registerQuenchTests;
