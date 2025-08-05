import {
  Parsed5eLLMMonster,
  Parsed5eLLMMonsterSchema,
  Parsed5eMonsterBasicInfo,
  Parsed5eMonsterBasicInfoSchema,
} from '../schemas/parsed-input-data/monster/Parsed5eMonster';
import askLLM from '../llm/askLLM';
import {
  Parsed5eMonsterBasicItemArray,
  Parsed5eMonsterBasicItemArraySchema,
} from '../schemas/parsed-input-data/monster/Parsed5eMonsterBasicItem';

export default class MonsterTextBlock5eParser {
  static toBasicMonster = async (monsterText: string): Promise<Parsed5eLLMMonster> => {
    return askLLM<{ monsterText: string }, Parsed5eLLMMonster>(
      `Parse the provided monster text into a json schema as specified below.
  
      TEXT TO PARSE:
      {monsterText}
    `,
      Parsed5eLLMMonsterSchema,
      { monsterText },
    );
  };

  static toBasicInfo = async (monsterText: string): Promise<Parsed5eMonsterBasicInfo> => {
    return askLLM<{ monsterText: string }, Parsed5eMonsterBasicInfo>(
      `Parse the specified parts of the provided monster text into a json schema as specified below.
  
      TEXT TO PARSE:
      {monsterText}
    `,
      Parsed5eMonsterBasicInfoSchema,
      { monsterText },
    );
  };

  static toBasicItems = async (monsterText: string): Promise<Parsed5eMonsterBasicItemArray> => {
    return askLLM<{ monsterText: string }, Parsed5eMonsterBasicItemArray>(
      `Parse the provided monster text into an array of the monster's "basic items" as described below
      Be sure to skip all the normal monster stats and just parse the "basic items" (like actions, reactions, etc.). 
      Basic Items come in the later part of the text block.
  
      TEXT TO PARSE:
      {monsterText}
    `,
      Parsed5eMonsterBasicItemArraySchema,
      { monsterText },
    );
  };
}
