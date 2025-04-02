export interface Task {
    id?: number;
    threadId: string;
    title: string;
    description: string;
    dueDate?: string;
    priority: 'High' | 'Medium' | 'Low';
    assignee?: string;
    createdAt?: Date;
}
