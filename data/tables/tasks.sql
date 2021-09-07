CREATE TABLE tasks (
      id VARCHAR(36) UNIQUE
    , taskNumber TEXT
    , name TEXT
    , description TEXT
    , createdBy TEXT
    , assignedTo TEXT
    , createdAt DATETIME
    , parentTask TEXT
    , status INT
    , archived BIT
    , projectId TEXT
)
