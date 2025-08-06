import { Foundry5eItem } from './monster-parser/schemas/foundry/item/Foundry5eItem';
import { Parsed5eItem } from './monster-parser/schemas/parsed-input-data/item/Parsed5eItem';
import { Parsed5eMonsterBasicItem } from './monster-parser/schemas/parsed-input-data/monster/Parsed5eMonsterBasicItem';
import Parsed5eItemParser from './monster-parser/text-parsing/Parsed5eItemParser';
import Foundry5eItemFormatter from './monster-parser/foundry-parsing/Foundry5eItemFormatter';
import TaskTracker from './performanceUtils/TaskTracker';
import askLLM from './monster-parser/llm/askLLM';
import foundryItemCompendia from './monster-parser/foundry-compendia/FoundryItemCompendia';

type ItemTextParsingStrategy = 'BASIC_ITEM_EXTRACTION' | 'DIRECT_PARSING';

export const genFoundry5eItemFromTextBlock = async (
  text: string,
  strategy: ItemTextParsingStrategy = 'DIRECT_PARSING',
): Promise<Foundry5eItem> => {
  let foundry5eItem: Foundry5eItem;
  
  switch (strategy) {
    case 'BASIC_ITEM_EXTRACTION':
      foundry5eItem = await basicItemExtractionStrategy(text);
      break;
    case 'DIRECT_PARSING':
      foundry5eItem = await directParsingStrategy(text);
      break;
    default:
      foundry5eItem = await directParsingStrategy(text);
  }
  
  console.log('Foundry Item Generated: ', foundry5eItem);
  return foundry5eItem;
};

const basicItemExtractionStrategy = async (text: string): Promise<Foundry5eItem> => {
  // First extract basic item info (name + description) then parse to structured format
  const basicItemPromise = extractBasicItemFromText(text);
  TaskTracker.startNewTask('Extract Item Info', 'Extract basic item name and description from text', basicItemPromise);
  
  const basicItem = await basicItemPromise;
  
  const parsedItemPromise = Parsed5eItemParser.fromBasicItem(basicItem, false);
  TaskTracker.startNewTask('Parse Item Data', 'Parse item into structured format', parsedItemPromise);
  
  const parsedItem = await parsedItemPromise;
  if (!parsedItem) {
    throw new Error('Failed to parse item from text');
  }
  
  return Foundry5eItemFormatter.format(parsedItem);
};

const directParsingStrategy = async (text: string): Promise<Foundry5eItem> => {
  // Parse the text directly to a Parsed5eItem, then format to Foundry5eItem
  const parsedItemPromise = parseItemDirectlyFromText(text);
  TaskTracker.startNewTask('Parse Item', 'Parse item text directly into structured format', parsedItemPromise);
  
  const parsedItem = await parsedItemPromise;
  return Foundry5eItemFormatter.format(parsedItem);
};

const extractBasicItemFromText = async (text: string): Promise<Parsed5eMonsterBasicItem> => {
  // Extract name and description from freeform text
  return askLLM<{ text: string }, Parsed5eMonsterBasicItem>(
    `Extract the item name and description from the following text. The name should be the primary name of the item, and the text should be the full description.

    ITEM TEXT:
    {text}

    Extract this into a JSON object with 'name' and 'text' fields.
    `,
    {
      type: 'object',
      properties: {
        name: { type: 'string' },
        text: { type: 'string' }
      },
      required: ['name', 'text'],
      additionalProperties: false
    } as any,
    { text },
    {
      deletions: ['_id']
    }
  );
};

const parseItemDirectlyFromText = async (text: string): Promise<Parsed5eItem> => {
  // Parse text directly to Parsed5eItem format
  const itemSchema = await import('./monster-parser/schemas/parsed-input-data/item/Parsed5eItem');
  
  return askLLM<{ text: string }, Parsed5eItem>(
    `Parse the provided item text into the json schema specified below. Extract all relevant game mechanics including damage, range, activation costs, etc.

    ITEM TEXT TO PARSE:
    {text}

    SCHEMA AND FORMAT INSTRUCTIONS:
    {formatInstructions}
    `,
    itemSchema.Parsed5eItemSchema,
    { text },
    {
      overrides: {
        effects: [],
        img: ''
      },
      deletions: ['_id']
    }
  );
};

const genFoundry5eItemActorFromTextBlock = async (textBlock: string): Promise<Item> => {
  // Generate foundry item from text block
  const item = await genFoundry5eItemFromTextBlock(textBlock);
  
  // Create the item in Foundry (similar to how monsters are created)
  const createdItem = await Item.create(item);
  if (!createdItem) {
    throw new Error('Failed to create item in Foundry');
  }
  
  // Import the item to the selected compendium
  await foundryItemCompendia.saveAIImportedItemToCompendium(createdItem);
  
  // Show the item sheet after creating
  createdItem.sheet?.render(true);
  return createdItem;
};

export default genFoundry5eItemActorFromTextBlock;