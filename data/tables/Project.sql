CREATE TABLE Project (
      Id VARCHAR(36) UNIQUE
    , Name TEXT
    , Description TEXT
    , TaskPrefix TEXT
    , CreatedBy TEXT
    , CreatedAt DATETIME
    , Archived BIT
    , PRIMARY KEY (Id)
    , FOREIGN KEY (CreatedBy) REFERENCES User(Id)
)
