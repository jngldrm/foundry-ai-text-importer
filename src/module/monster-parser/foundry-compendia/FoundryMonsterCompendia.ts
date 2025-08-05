// const saveMonsterToCompendium = async (monster, compendiumName, compendiumLabel) => { };
export const DEFAULT_MONSTER_COMPENDIUM_LABEL = 'AI Importer Monsters';
export const DEFAULT_MONSTER_COMPENDIUM_NAME = 'ai-importer-monsters';

const getCompendiumByName = async (compendiumName: string, packageType = 'world') => {
  return await game.packs.get(`${packageType}.${compendiumName}`);
};

const ensureDefaultCompendiumExists = async () => {
  const defaultCompendium = await getCompendiumByName(DEFAULT_MONSTER_COMPENDIUM_NAME);
  if (!defaultCompendium) {
    return await getCompendiumOrCreateIfNotExists(DEFAULT_MONSTER_COMPENDIUM_NAME, DEFAULT_MONSTER_COMPENDIUM_LABEL);
  }
  return defaultCompendium;
};

const validateAndMaybeResetSelectedCompendium = async () => {
  // handle a compendium having been deleted.
  const selectedCompendiumName = game.settings.get(
    'llm-text-content-importer',
    'compendiumImportDestination',
  ) as string;
  const compendium = await getCompendiumByName(selectedCompendiumName);
  if (!compendium || compendium.metadata.type !== 'Actor') {
    console.error('Selected compendium is not valid, resetting to default');
    // Ensure default compendium exists
    const defaultCompendium = await ensureDefaultCompendiumExists();
    game.settings.set('llm-text-content-importer', 'compendiumImportDestination', defaultCompendium.metadata.name);
  }
};

const saveAIImportedMonsterToCompendium = async (
  monster: Actor,
  compendiumNameInput: string | undefined = undefined,
  compendiumLabelInput: string | undefined = undefined,
): Promise<void> => {
  // If not specified, read the setting for the compendium name
  let compendiumName, compendiumLabel;
  if (compendiumNameInput === undefined) {
    await validateAndMaybeResetSelectedCompendium();
    compendiumName = game.settings.get('llm-text-content-importer', 'compendiumImportDestination');
  } else {
    compendiumName = compendiumNameInput;
    compendiumLabel = compendiumLabelInput;
  }
  // TODO - when you come back, add settings and use them to supply compendiumName and compendiumLabel, defaulting the name and label to undefined in the signature
  const compendium = await getCompendiumOrCreateIfNotExists(compendiumName, compendiumLabel);
  await compendium?.importDocument(monster);
  console.log('Monster saved to compendium', monster, compendium);
};

const getAllActorCompendia = async () => {
  return game.packs.filter((pack) => pack.metadata.type === 'Actor');
};

const getCompendiumOrCreateIfNotExists = async (compendiumName, compendiumLabel) => {
  // Not sure if this is right
  let compendium = await getCompendiumByName(compendiumName);
  if (!compendium) {
    compendium = await CompendiumCollection.createCompendium(
      {
        type: 'Actor',
        label: compendiumLabel,
        name: compendiumName,
        package: 'world',
        path: `world.${compendiumName}`,
        ownership: {
          default: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
          [game.user.id]: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
        },
        system: 'dnd5e',
      },
      {},
    );
    console.log('created new Compendium: ', compendium);
  }
  return compendium;
};

export default {
  getCompendiumByName,
  getCompendiumOrCreateIfNotExists,
  saveAIImportedMonsterToCompendium,
  getAllActorCompendia,
  validateAndMaybeResetSelectedCompendium,
  ensureDefaultCompendiumExists,
};
