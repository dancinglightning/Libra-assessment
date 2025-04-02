import { GraphNode } from '../services/langgraph';
import { callLLM } from '../services/portkeyClient';

export const extractTaskNode: GraphNode = {
    id: 'extractTask',
    execute: async (summary: string): Promise<any> => {
        const prompt = `Based on the following summary, determine if there is an actionable task. If no actionable task exists, return {"actionable": false}. If there is one, return a JSON object with {"actionable": true, "title": string, "description": string, "dueDate": string or null, "priority": "High" | "Medium" | "Low", "assignee": string or null}.\nSummary:\n${summary}`;
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
                assignee: null,
                actionable: false
            };
        }
    },
    nextNodes: []
};
