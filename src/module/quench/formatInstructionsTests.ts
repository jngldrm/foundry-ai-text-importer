import { StructuredOutputParser } from 'langchain/output_parsers';
import { Parsed5eLLMMonsterSchema } from '../monster-parser/schemas/parsed-input-data/monster/Parsed5eMonster';

/* eslint-disable jest/no-export, jest/expect-expect  */
const registerFormatInstructionsTests = (context) => {
  const { describe, it, assert } = context;
  describe('Testing the format instructions', function () {
    it('Generates an output parser for the initial call and prints the format instructions for examination', async function () {
      const outputParser = StructuredOutputParser.fromZodSchema(Parsed5eLLMMonsterSchema);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore this parameter exists
      const formatInstructions = outputParser.getFormatInstructions();
      console.log('monster formatInstructions: ', formatInstructions);
      console.log('formatInstructions length: ', formatInstructions.length);
      assert.ok(formatInstructions);
    });
  });
};

export default registerFormatInstructionsTests;
