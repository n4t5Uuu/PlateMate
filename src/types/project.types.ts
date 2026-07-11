export interface Project {
    id: string;
    title: string;       // maps to DB `name`
    description?: string;
    client?: string;     // maps to DB `client_name`
    workspaceId: string; // maps to DB `workspace_id`
    owner: string;       // maps to DB `owner_id`
    progress: number;
    dueDate?: string;    // maps to DB `due_date`
    status: "active" | "review" | "completed" | "delayed";
    priority: "low" | "medium" | "high";
    isArchived?: boolean;
    
    createdAt: string;
    updatedAt: string;
}
