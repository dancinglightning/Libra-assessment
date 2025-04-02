import { GraphNode } from '../services/langgraph';
import { callLLM } from '../services/portkeyClient';

export const extractTaskNode: GraphNode = {
    id: 'extractTask',
    execute: async (summary: string): Promise<any> => {
        const prompt = `Based on the following summary, identify actionable tasks with details (title, description, due date, priority, and assignee):\n${summary}`;
        const taskResponse = await callLLM(prompt);

        // If the response is a JSON string, try parsing it.
        try {
            return JSON.parse(taskResponse);
        } catch (error) {
            // Fallback: wrap the plain text response into a basic task object.
            return {
                title: taskResponse,
                description: taskResponse,
                dueDate: null,
                priority: 'Medium',
                assignee: null
            };
        }
    },
    nextNodes: []
};
