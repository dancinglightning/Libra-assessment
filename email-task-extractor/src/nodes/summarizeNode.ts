import { GraphNode } from '../services/langgraph';
import { callLLM } from '../services/portkeyClient';

export const summarizeNode: GraphNode = {
    id: 'summarize',
    execute: async (input: string): Promise<string> => {
        const prompt = `Summarize the following email thread:\n${input}`;
        const summary = await callLLM(prompt);
        return summary;
    },
    nextNodes: ['extractTask']
};
