export interface GraphNode {
    id: string;
    execute: (input: any) => Promise<any>;
    nextNodes?: string[];
}

export class LangGraph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: Map<string, string[]> = new Map();

    addNode(node: GraphNode) {
        this.nodes.set(node.id, node);
        this.edges.set(node.id, node.nextNodes || []);
    }

    async run(input: any, startNodeId: string): Promise<any> {
        let currentInput = input;
        let currentNodeId: string | undefined = startNodeId;
        while (currentNodeId) {
            const node = this.nodes.get(currentNodeId);
            if (!node) break;
            currentInput = await node.execute(currentInput);
            const nextNodes = this.edges.get(currentNodeId);
            currentNodeId = nextNodes && nextNodes.length ? nextNodes[0] : undefined;
        }
        return currentInput;
    }
}

