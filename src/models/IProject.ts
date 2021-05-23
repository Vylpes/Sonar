export interface IProject {
    projectId: string;
    name: string;
    description: string;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    archived: boolean;
}