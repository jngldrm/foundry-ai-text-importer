import TaskTracker from '../../performanceUtils/TaskTracker';
import FoundryItemCompendia from '../foundry-compendia/FoundryItemCompendia';
import askLLM from '../llm/askLLM';
import { Parsed5eItem, Parsed5eItemSchema } from '../schemas/parsed-input-data/item/Parsed5eItem';
import { Parsed5eItemChunks } from '../schemas/parsed-input-data/item/Parsed5eItemChunks';
import {
  Parsed5eMonsterBasicItem,
  Parsed5eMonsterBasicItemArray,
} from '../schemas/parsed-input-data/monster/Parsed5eMonsterBasicItem';
import { notUndefined } from '../utils';

export default class Parsed5eItemParser {
  static fromBasicItem = async (
    basicItem: Parsed5eMonsterBasicItem,
    inChunks: boolean,
  ): Promise<Parsed5eItem | undefined> => {
    // TODO - the type of the example item should be abstracted out of this method once other example sources are supported
    const exampleFoundryItem = await FoundryItemCompendia.findItemWithName(basicItem.name);
    if (exampleFoundryItem) {
      console.log(`Example Item Provided for ${basicItem.name}: !`, exampleFoundryItem);
    }
    // convert the foundry example to a parsed5eItem (with just formatting)
    // TODO - example items support in this new paradigm (look at Foundry5eItemParser, do that but convert to Parsed5eItem)
    // Option 2 - gen full new item from scratch
    try {
      return await Parsed5eItemParser.fromScratch(basicItem, inChunks, exampleFoundryItem?.img);
    } catch (e) {
      console.error(`Failed to parse basic item ${basicItem} from scratch `);
      return undefined;
    }
  };

  static fromBasicItemList = async (
    basicItems: Parsed5eMonsterBasicItemArray,
    inChunks: boolean,
  ): Promise<Parsed5eItem[]> => {
    return Promise.all(
      basicItems
        // 'about' can come through as an item, filter it out. It is caught by the stats call for now.
        .filter((item) => item.name !== 'about')
        .map(async (basicItem) => {
          const itemPromise = Parsed5eItemParser.fromBasicItem(basicItem, inChunks);
          TaskTracker.startNewTask(`${basicItem.name} (parse item data)`, ` - ${basicItem.text}`, itemPromise);
          return itemPromise;
        }),
    ).then((items) => {
      return items.filter(notUndefined);
    });
  };

  static fromScratch = async (
    basicItem: Parsed5eMonsterBasicItem,
    useChunks = false,
    img: string | undefined = undefined,
  ): Promise<Parsed5eItem> => {
    // Using "chunks" strategy to generate the item from scratch
    let parsed5eItem;
    // "Chunks" strategy
    if (useChunks) {
      parsed5eItem = await Parsed5eItemParser.parseBasicItemInChunks(basicItem, img);
    } else {
      parsed5eItem = await Parsed5eItemParser.parseBasicItemInOneCall(basicItem, img);
    }
    console.log('Parsed Custom Item Data: ', parsed5eItem);
    return parsed5eItem;
  };

  private static parseBasicItemInOneCall = async (
    basicItem: Parsed5eMonsterBasicItem,
    img: string | undefined = undefined,
  ): Promise<Parsed5eItem> => {
    return askLLM<{ itemName: string; itemText: string }, Parsed5eItem>(
      `Parse the provided item text into the json schema specified below.
  
      TEXT TO PARSE:
      {itemName}
      {itemText}
  
      SCHEMA AND FORMAT INSTRUCTIONS:
      {formatInstructions}
    `,
      Parsed5eItemSchema,
      {
        itemName: basicItem.name,
        itemText: basicItem.text,
      },
      {
        overrides: {
          img: img,
          effects: [],
        },
        deletions: ['_id'],
      },
    );
  };

  private static parseBasicItemInChunks = async (
    basicItem: Parsed5eMonsterBasicItem,
    img: string | undefined = undefined,
  ): Promise<Parsed5eItem> => {
    // TODO - when you come back, allow non-chunk option

    const chunkResults = await Promise.all(
      Parsed5eItemChunks.map(async (chunk) => {
        try {
          return await askLLM<{ itemName: string; itemText: string }, typeof chunk>(
            `Parse the provided item text into the json schema specified below.
            This is only asking for a subset of the fields in the full item schema, so only fill in the fields that are relevant to the item text provided.
  
            TEXT TO PARSE:
            {itemName}
            {itemText}`,
            chunk,
            {
              itemName: basicItem.name,
              itemText: basicItem.text,
            },
            {
              overrides: {
                effects: [],
              },
              deletions: ['_id'],
            },
          );
        } catch (e) {
          console.error('Error validating chunk: ', e);
          return {};
        }
      }),
    );

    const item: Parsed5eItem = chunkResults.reduce((acc, chunk) => {
      return { ...acc, ...chunk };
    }, {}) as Parsed5eItem;
    item.img = img;
    return item;
  };

  static fromExample = async (
    basicItem: Parsed5eMonsterBasicItem,
    exampleItem: Parsed5eItem,
  ): Promise<Parsed5eItem> => {
    return askLLM<{ itemName: string; itemText: string; exampleItem: Parsed5eItem }, Parsed5eItem>(
      `Parse the provided item text into the json schema specified below. The outputted fields should have the same values as the base item provided unless the text suggests a clear difference.
      
      TEXT TO PARSE:
      {itemName}
      {itemText}
      `,
      Parsed5eItemSchema,
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
