CREATE TABLE projects (
      id VARCHAR(36) UNIQUE
    , name TEXT
    , description TEXT
    , createdBy TEXT
    , createdAt DATETIME
    , archived BIT
)