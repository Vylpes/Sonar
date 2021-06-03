CREATE TABLE projectUsers (
      id VARCHAR(36) UNIQUE
    , projectId TEXT
    , userId TEXT
    , role INT
)