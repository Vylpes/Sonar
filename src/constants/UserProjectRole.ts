export enum UserProjectRole {
    Member,
    Admin,
}

export enum UserProjectPermissions {
    None = 0,
    View = 1 << 1,
    Update = 1 << 2,
    Assign = 1 << 3,
    Promote = 1 << 4,
    TaskView = 1 << 5,
    TaskCreate = 1 << 6,
    TaskUpdate = 1 << 7,
    TaskDelete = 1 << 8,
}