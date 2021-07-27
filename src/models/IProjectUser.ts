export interface IProjectUser {
    projectUserId: string;
    projectId: string;
    userId: string;
    userName: string;
    role: number;

    isAdmin: boolean;
}