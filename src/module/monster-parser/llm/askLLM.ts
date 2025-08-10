import { PromptTemplate } from '@langchain/core/prompts';
import OpenAILLM from './openaillm';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ZodSchema } from 'zod';
import rateLimiter from './rateLimiter';
import retryHandler from './retryHandler';
import APIErrorHandler from './errorHandler';

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
  
  // Wrap the API call with rate limiting and retry logic
  let output: any;
  try {
    output = await retryHandler.executeWithRetry(
      () => rateLimiter.execute(() => chain.invoke({
        formatInstructions: outputParser.getFormatInstructions(),
        ...inputOptions,
      })),
      `OpenAI API call for ${promptText.slice(0, 50)}...`
    ) as any;
  } catch (error) {
    // Enhanced error handling with user-friendly messages
    const errorInfo = APIErrorHandler.analyzeError(error);
    const context = `LLM parsing: ${promptText.slice(0, 100)}...`;
    
    // Display user-friendly error
    APIErrorHandler.displayError(errorInfo, context);
    
    // Log rate limiter status for debugging
    APIErrorHandler.logRateLimiterStatus(rateLimiter);
    
    // Re-throw for upstream error handling
    throw error;
  }

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
