export interface ITask {
    taskId: string;
    taskNumber: string;
    name: string;
    description: string;
    createdBy: string;
    assignedTo: string;
    createdAt: string;
    parentTask: string;
    status: number;
    archived: boolean;
    createdByUsername: string;
    assignedToUsername: string;
    projectName: string;
    parentTaskName: string;
}
