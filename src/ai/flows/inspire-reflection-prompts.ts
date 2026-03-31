'use server';
/**
 * @fileOverview This file implements a Genkit flow to provide gentle, personalized writing prompts
 * for BT Journal's reflection sections.
 *
 * - inspireReflectionPrompts - A function that handles generating reflection prompts.
 * - InspireReflectionPromptsInput - The input type for the inspireReflectionPrompts function.
 * - InspireReflectionPromptsOutput - The return type for the inspireReflectionPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InspireReflectionPromptsInputSchema = z.object({
  sectionType: z
    .enum(['Positive', 'Growth', 'Free Writing'])
    .describe("The type of reflection section for which a prompt is needed ('Positive', 'Growth', or 'Free Writing')."),
});
export type InspireReflectionPromptsInput = z.infer<typeof InspireReflectionPromptsInputSchema>;

const InspireReflectionPromptsOutputSchema = z.object({
  prompt: z
    .string()
    .describe('A gentle, personalized writing prompt or nudge to inspire journaling.'),
});
export type InspireReflectionPromptsOutput = z.infer<typeof InspireReflectionPromptsOutputSchema>;

export async function inspireReflectionPrompts(
  input: InspireReflectionPromptsInput
): Promise<InspireReflectionPromptsOutput> {
  return inspireReflectionPromptsFlow(input);
}

const inspireReflectionPromptTemplate = ai.definePrompt({
  name: 'inspireReflectionPromptTemplate',
  input: {schema: InspireReflectionPromptsInputSchema},
  output: {schema: InspireReflectionPromptsOutputSchema},
  prompt: `You are a gentle and encouraging journaling assistant. Your goal is to provide a single, inspiring, and non-intrusive writing prompt or nudge for a user's daily reflection.

The user needs a prompt for the '{{{sectionType}}}' section of their journal.

- If the section is 'Positive', suggest something related to gratitude, learning, or small joys.
- If the section is 'Growth', suggest something related to challenges, energy levels, or areas for self-improvement.
- If the section is 'Free Writing', provide an open-ended, calming prompt that encourages introspection or simple observation.

Focus on being empathetic and supportive. Do not ask follow-up questions or offer multiple options. Just provide one concise prompt.

Example for Positive: What small moment brought you joy today?
Example for Growth: What's one thing you can do tomorrow to feel more energized?
Example for Free Writing: What thoughts are currently swirling in your mind, gentle as a breeze?

Now, provide a prompt for the '{{{sectionType}}}' section:`,
});

const inspireReflectionPromptsFlow = ai.defineFlow(
  {
    name: 'inspireReflectionPromptsFlow',
    inputSchema: InspireReflectionPromptsInputSchema,
    outputSchema: InspireReflectionPromptsOutputSchema,
  },
  async input => {
    const {output} = await inspireReflectionPromptTemplate(input);
    if (!output) {
      throw new Error('Failed to generate reflection prompt.');
    }
    return output;
  }
);
