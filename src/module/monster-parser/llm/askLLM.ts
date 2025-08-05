import { PromptTemplate } from '@langchain/core/prompts';
import OpenAILLM from './openaillm';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ZodSchema } from 'zod';

async function askLLM<TInput, TOutput>(
  promptText: string,
  outputSchema: ZodSchema,
  inputOptions: TInput,
  outputOptions: {
    overrides?: Record<string, any>;
    deletions?: string[];
  } = {},
): Promise<TOutput> {
  const llm = OpenAILLM();

  // TODO - concatenate the prompt with the basicItem and exampleItem
  const prompt = PromptTemplate.fromTemplate(`
  ${promptText}

  SCHEMA AND FORMAT INSTRUCTIONS:
  {formatInstructions}
  `);

  const outputParser: any = StructuredOutputParser.fromZodSchema(outputSchema as any);

  // Use modern LCEL syntax instead of deprecated LLMChain
  const chain = prompt.pipe(llm).pipe(outputParser);
  
  let output = await chain.invoke({
    formatInstructions: outputParser.getFormatInstructions(),
    ...inputOptions,
  }) as any;

  // This does not support nested overrides, will need to implement when necessary
  // Apply field overrides before casting
  if (outputOptions.overrides) {
    for (const [field, override] of Object.entries(outputOptions.overrides)) {
      output[field] = override;
    }
  }

  // Delete fields that cause issues
  if (outputOptions.deletions) {
    for (const field of outputOptions.deletions) {
      delete output[field];
    }
  }

  return output as TOutput;
}

export default askLLM;
