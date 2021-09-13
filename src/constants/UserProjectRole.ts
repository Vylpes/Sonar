export enum UserProjectRole {
    Member,
    Admin,
}

export enum UserProjectPermissions {
    None = 0,
    View = 1,
    Update = 2,
    Assign = 4,
    Promote = 8,
}