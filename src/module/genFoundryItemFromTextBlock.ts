import { Foundry5eItem } from './monster-parser/schemas/foundry/item/Foundry5eItem';
import { Parsed5eItem } from './monster-parser/schemas/parsed-input-data/item/Parsed5eItem';
import { Parsed5eMonsterBasicItem } from './monster-parser/schemas/parsed-input-data/monster/Parsed5eMonsterBasicItem';
import Parsed5eItemParser from './monster-parser/text-parsing/Parsed5eItemParser';
import Foundry5eItemFormatter from './monster-parser/foundry-parsing/Foundry5eItemFormatter';
import TaskTracker from './performanceUtils/TaskTracker';
import askLLM from './monster-parser/llm/askLLM';
import foundryItemCompendia from './monster-parser/foundry-compendia/FoundryItemCompendia';
import { createItemInAIFolder } from './folderManager';

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
    `Parse the provided D&D 5e item text into the comprehensive JSON schema specified below. Extract ALL relevant information including physical properties, weapon/equipment specifics, and game mechanics.

    ITEM TEXT TO PARSE:
    {text}

    INSTRUCTIONS FOR PARSING:
    1. **Item Type Classification**: Determine if this is a weapon, equipment (armor/clothing/wondrous item), consumable, tool, loot, etc.
    2. **Physical Properties**: Extract weight, price, and rarity if mentioned
    3. **Weapon Properties**: For weapons, identify:
       - Weapon category (Simple/Martial, Melee/Ranged)
       - Base weapon type (longsword, dagger, etc.) - extract the core weapon name without magical modifiers
       - Properties (versatile, finesse, light, heavy, reach, thrown, two-handed, ammunition, loading, special)
       - Damage dice and type for the base weapon
       - Range (for ranged weapons)
    4. **Equipment Properties**: For armor/equipment, identify:
       - Armor class and type (light/medium/heavy armor, shield, clothing)
       - Strength requirements
       - Stealth disadvantage
    5. **Magic Item Properties**: 
       - Attunement requirements
       - **Magical bonuses**: Look for phrases like "+1 bonus to attack and damage rolls", "gains a +2 bonus", "provides a +3 bonus" and extract the numerical value as magicalBonus
       - **Magical AC bonuses**: For armor, extract bonuses like "+1 AC" as armorClass.magicalBonus
       - **Special abilities and usage limitations**: Extract any special actions, activated abilities, or unique mechanics
    6. **Combat Mechanics**: Extract activation costs, duration, targets, saves, etc.
    7. **Special Abilities**: Look for additional effects beyond basic weapon/armor function:
       - Poison effects, elemental damage, conditions
       - Saving throws (DC and ability)
       - Usage limitations (per day, recharge, etc.)
       - Secondary actions or utility effects

    EXAMPLES:
    - "Longsword" → itemType: "weapon", weaponType: "martialM", baseItem: "longsword", properties: ["versatile"]
    - "Dagger +1" with "+1 bonus to attack and damage rolls" → itemType: "weapon", weaponType: "simpleM", baseItem: "dagger", magicalBonus: 1, rarity: "uncommon"
    - "Dagger of Venom" with poison ability → itemType: "weapon", weaponType: "simpleM", baseItem: "dagger", magicalBonus: 1, save: {{ability: "con", dc: 15}}, damage: {{parts: [["1d4 + @mod", "piercing"], ["2d10", "poison"]]}}, uses: {{value: 1, per: "day"}}
    - "Studded Leather Armor" → itemType: "equipment", equipmentType: "light", armorClass: {{value: 12, dex: 2}}
    - "Potion of Healing" → itemType: "consumable", rarity: "common"

    **CRITICAL**: For items with special abilities like poison effects, elemental damage, or save-based effects:
    1. Parse the save information (ability and DC) into the save field
    2. Extract ALL damage types and formulas into damage.parts array
    3. Identify usage limitations and put them in the uses field
    4. Set actionType appropriately (e.g., "meleeWeaponAttack" for weapon attacks, "savingThrow" for save effects)

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
  
  // Create the item in Foundry using the AI folder system
  const createdItem = await createItemInAIFolder(item);
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