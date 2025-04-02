// services/langgraphInstance.ts
import { LangGraph } from './langgraph';
import { summarizeNode } from '../nodes/summarizeNode';
import { extractTaskNode } from '../nodes/extractTaskNode';

// Create and configure a LangGraph instance with the required nodes
const graph = new LangGraph();
graph.addNode(summarizeNode);
graph.addNode(extractTaskNode);

export { graph };
