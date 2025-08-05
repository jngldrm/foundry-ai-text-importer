import { Foundry5eItem, Foundry5eItemSchema } from '../schemas/foundry/item/Foundry5eItem';
import {
  Parsed5eMonsterBasicItem,
  Parsed5eMonsterBasicItemArray,
} from '../schemas/parsed-input-data/monster/Parsed5eMonsterBasicItem';
import FoundryItemCompendia from '../foundry-compendia/FoundryItemCompendia';
import { notUndefined } from '../utils';
import askLLM from '../llm/askLLM';
import { Parsed5eSpellcastingItem } from '../schemas/parsed-input-data/spellcasting/Parsed5eSpellcastingItem';
import Parsed5eSpellcastingItemParser from '../text-parsing/Parsed5eSpellcastingItemParser';
import Foundry5eItemFormatter from './Foundry5eItemFormatter';
import { Parsed5eItem } from '../schemas/parsed-input-data/item/Parsed5eItem';

export default class Foundry5eItemParser {
  static fromBasicItemList = async (basicItems: Parsed5eMonsterBasicItemArray): Promise<Foundry5eItem[]> => {
    return Promise.all(
      basicItems
        // 'about' can come through as an item, filter it out. It is caught by the stats call for now.
        .filter((item) => item.name !== 'about')
        .map(async (basicItem) => {
          const item = await Foundry5eItemParser.fromBasicItem(basicItem);
          return item;
        }),
    );
  };

  static fromSpellName = async (spellName: string): Promise<Foundry5eItem | undefined> => {
    return await FoundryItemCompendia.findItemWithName(spellName);
  };

  static fromSpellNameList = async (spellNames: string[]): Promise<Foundry5eItem[]> => {
    const spellsAndUndefined = await Promise.all(
      spellNames.map((name) => {
        return Foundry5eItemParser.fromSpellName(name);
      }),
    );
    return spellsAndUndefined.filter(notUndefined);
  };

  static fromBasicSpellcastingItem = async (basicItem: Parsed5eMonsterBasicItem): Promise<Foundry5eItem[]> => {
    const spellcastingItem: Parsed5eSpellcastingItem = await Parsed5eSpellcastingItemParser.fromText(basicItem.text);
    const foundrySpellItems = await Foundry5eItemParser.fromParsedSpellcastingItem(spellcastingItem);
    return foundrySpellItems.filter(notUndefined);
  };

  static fromParsedSpellcastingItem = async (parsedItem: Parsed5eSpellcastingItem): Promise<Foundry5eItem[]> => {
    const foundryItems = await Promise.all(
      parsedItem.spells.map(async (basicSpellItem) => {
        return await Foundry5eItemParser.fromSpellName(basicSpellItem.name);
      }),
    );
    return foundryItems.filter(notUndefined);
  };

  static fromParsed5eItem = (parsedItem: Parsed5eItem): Foundry5eItem => {
    return Foundry5eItemFormatter.format(parsedItem);
  };

  /**
   * Strategy-specific methods not used for prevailing strategy
   *
   * TODO - consider removing altogether
   */

  static fromBasicItem = async (basicItem: Parsed5eMonsterBasicItem): Promise<Foundry5eItem> => {
    const itemWithSameName = await FoundryItemCompendia.findItemWithName(basicItem.name);
    if (itemWithSameName != null) {
      // Option 1 - try to find an example and use it as inspiration
      return Foundry5eItemParser.fromExample(basicItem, itemWithSameName);
    } else {
      // Option 2 - gen full new item from scratch
      return Foundry5eItemParser.fromScratch(basicItem);
    }
  };

  static fromScratch = async (basicItem: Parsed5eMonsterBasicItem): Promise<Foundry5eItem> => {
    // TODO - stub method not being used, fill out or remove
    // Returns a dummy item for now
    const fullItemSchema = Foundry5eItemSchema;
    return Foundry5eItemSchema.parse({});
  };

  static fromExample = async (
    basicItem: Parsed5eMonsterBasicItem,
    exampleItem: Foundry5eItem,
  ): Promise<Foundry5eItem> => {
    return askLLM<{ itemName: string; itemText: string; exampleItem: Foundry5eItem }, Foundry5eItem>(
      `Parse the provided item text into the json schema specified below. The outputted fields should have the same values as the base item provided unless the itemText suggests a clear difference.
  
      TEXT TO PARSE:
      {itemName}
      {itemText}
  
      BASE ITEM:
      {exampleItem}
  
      SCHEMA AND FORMAT INSTRUCTIONS:
      {formatInstructions}
      `,
      Foundry5eItemSchema,
      {
        itemName: basicItem.name,
        itemText: basicItem.text,
        exampleItem: exampleItem,
      },
      {
        overrides: {
          img: exampleItem.img,
          flags: exampleItem.flags,
          effects: [],
        },
        deletions: ['_id'],
      },
    );
  };
}
