'use server';

/**
 * @fileOverview Provides AI-powered suggestions for complex calculations and simplifications.
 *
 * - suggestCalculation - A function that suggests calculation steps.
 * - SuggestCalculationInput - The input type for the suggestCalculation function.
 * - SuggestCalculationOutput - The return type for the suggestCalculation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCalculationInputSchema = z.object({
  equation: z.string().describe('The equation to be simplified or solved.'),
});
export type SuggestCalculationInput = z.infer<typeof SuggestCalculationInputSchema>;

const SuggestCalculationOutputSchema = z.object({
  suggestion: z.string().describe('An AI-powered suggestion for simplifying or solving the equation.'),
});
export type SuggestCalculationOutput = z.infer<typeof SuggestCalculationOutputSchema>;

export async function suggestCalculation(input: SuggestCalculationInput): Promise<SuggestCalculationOutput> {
  return suggestCalculationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCalculationPrompt',
  input: {schema: SuggestCalculationInputSchema},
  output: {schema: SuggestCalculationOutputSchema},
  prompt: `You are an AI assistant that provides suggestions for simplifying or solving complex equations.

  Equation: {{{equation}}}

  Suggestion:`, // The prompt should instruct the LLM to provide the next step, or simplify, but not to solve unless it's very simple.
});

const suggestCalculationFlow = ai.defineFlow(
  {
    name: 'suggestCalculationFlow',
    inputSchema: SuggestCalculationInputSchema,
    outputSchema: SuggestCalculationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
