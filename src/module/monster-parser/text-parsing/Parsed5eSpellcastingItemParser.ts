import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';
import { Parsed5eMonsterBasicItem } from '../schemas/parsed-input-data/monster/Parsed5eMonsterBasicItem';
import { LLMChain } from 'langchain/chains';
import OpenAILLM from '../llm/openaillm';
import {
  Parsed5eSpellcastingItem,
  Parsed5eSpellcastingItemSchema,
} from '../schemas/parsed-input-data/spellcasting/Parsed5eSpellcastingItem';
import askLLM from '../llm/askLLM';

export default class Parsed5eSpellcastingItemParser {
  static fromText = async (text: string): Promise<Parsed5eSpellcastingItem> => {
    return askLLM<{ spellcastingText: string }, Parsed5eSpellcastingItem>(
      `From the provided text, parse the indicated information about the spells listed

      TEXT TO PARSE:
      {spellcastingText}
      `,
      Parsed5eSpellcastingItemSchema,
      {
        spellcastingText: text,
      },
    );
  };
}
