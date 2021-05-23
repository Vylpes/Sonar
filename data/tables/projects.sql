CREATE TABLE projects (
      id TEXT UNIQUE
    , name TEXT
    , description TEXT
    , createdBy TEXT
    , createdAt DATETIME
    , archived BIT
)