/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Foundry5eItem } from '../schemas/foundry/item/Foundry5eItem';

const findItemWithName = async (name: string): Promise<Foundry5eItem | undefined> => {
  // TODO - foundry-vtt-types has "type" as called "entity", see if this is fixable with global types or version change
  // @ts-ignore (Type for Metadata is incorrect in foundry-vtt-types)
  const itemPacks = (game as any).packs.filter((p) => p.metadata.type === 'Item');
  for (const pack of itemPacks) {
    const index = await pack.getIndex();
    for (const entry of index) {
      // @ts-ignore (Type for entry is incorrect in foundry-vtt-types - Pick)
      if (entry?.name?.toLowerCase() === name.toLowerCase()) {
        // @ts-ignore (Type for entry is incorrect in foundry-vtt-types - Pick)
        const item = (await pack.getDocument(entry?._id)) as Item;
        // @ts-ignore (hard casting here)
        return item as Foundry5eItem;
      }
    }
  }
  return undefined;
};

const findAllItemsWithName = async (name: string): Promise<Foundry5eItem[]> => {
  // TODO - foundry-vtt-types has "type" as called "entity", see if this is fixable with global types or version change
  // @ts-ignore (Type for Metadata is incorrect in foundry-vtt-types)
  const itemPacks = (game as any).packs.filter((p) => p.metadata.type === 'Item');
  const items = [];
  for (const pack of itemPacks) {
    const index = await pack.getIndex();
    for (const entry of index) {
      // @ts-ignore (Type for entry is incorrect in foundry-vtt-types - Pick)
      if (entry?.name === name) {
        // @ts-ignore (Type for entry is incorrect in foundry-vtt-types - Pick)
        const item = (await pack.getDocument(entry?._id)) as Item;
        // @ts-ignore (hard casting here)
        items.push(item as Foundry5eItem);
      }
    }
  }
  return items;
};

const getAllItemCompendia = async (): Promise<CompendiumCollection<any>[]> => {
  // @ts-ignore (Type for Metadata is incorrect in foundry-vtt-types)
  return (game as any).packs.filter((p) => p.metadata.type === 'Item');
};

const DEFAULT_ITEM_COMPENDIUM_NAME = 'ai-importer-items';

const ensureDefaultItemCompendiumExists = async (): Promise<void> => {
  const existingCompendium = (game as any).packs.find((pack) => pack.metadata.name === DEFAULT_ITEM_COMPENDIUM_NAME);
  if (!existingCompendium) {
    console.log('Creating default item compendium');
    await CompendiumCollection.createCompendium({
      name: DEFAULT_ITEM_COMPENDIUM_NAME,
      label: (game as any).i18n.localize('LLMTCI.DefaultItemCompendiumLabel') || 'AI Importer Items',
      type: 'Item',
      system: 'dnd5e'
    });
  }
};

const validateAndMaybeResetSelectedItemCompendium = async (): Promise<void> => {
  const selectedCompendiumName = (game as any).settings.get('llm-text-content-importer', 'itemCompendiumImportDestination');
  const itemCompendia = await getAllItemCompendia();
  const selectedCompendiumExists = itemCompendia.some((compendium) => compendium.metadata.name === selectedCompendiumName);
  
  if (!selectedCompendiumExists) {
    console.log(`Selected item compendium ${selectedCompendiumName} does not exist, resetting to default`);
    await (game as any).settings.set('llm-text-content-importer', 'itemCompendiumImportDestination', DEFAULT_ITEM_COMPENDIUM_NAME);
  }
};

const saveAIImportedItemToCompendium = async (item: Item): Promise<void> => {
  const selectedCompendiumName = (game as any).settings.get('llm-text-content-importer', 'itemCompendiumImportDestination');
  const compendium = (game as any).packs.find((pack) => pack.metadata.name === selectedCompendiumName);
  
  if (!compendium) {
    console.error(`Could not find compendium ${selectedCompendiumName} to save item to`);
    return;
  }
  
  console.log(`Saving AI imported item ${item.name} to compendium ${selectedCompendiumName}`);
  await compendium.importDocument(item);
};

export default { 
  findItemWithName, 
  findAllItemsWithName,
  getAllItemCompendia,
  ensureDefaultItemCompendiumExists,
  validateAndMaybeResetSelectedItemCompendium,
  saveAIImportedItemToCompendium
};

export { DEFAULT_ITEM_COMPENDIUM_NAME };
