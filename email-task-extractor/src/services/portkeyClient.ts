import { Portkey } from 'portkey-ai';
import { anthropicLlmSettings } from '../config/llmSettings';

export const callLLM = async (prompt: string): Promise<string> => {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
        try {

            const portkey = new Portkey({
                virtualKey: anthropicLlmSettings.virtualKey,
                apiKey: anthropicLlmSettings.apiKey,
            });

            const response = await portkey.chat.completions.create({
                model: anthropicLlmSettings.model,
                temperature: anthropicLlmSettings.temperature,
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }],
            });

            if (
                !response.choices ||
                response.choices.length === 0 ||
                !response.choices[0].message?.content
            ) {
                throw new Error('No valid response content received from LLM');
            }

            const content = response.choices[0].message.content;
            return Array.isArray(content) ? content.join('') : content;
        } catch (error) {
            attempt++;
            console.error(`LLM call attempt ${attempt} failed:`, error);
            if (attempt >= maxAttempts) {
                throw new Error(`LLM call failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`);
            }
            // Wait for 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    throw new Error('LLM call failed unexpectedly');
};
