CREATE TABLE ProjectUser (
      Id VARCHAR(36) UNIQUE
    , ProjectId TEXT
    , UserId TEXT
    , Role INT
    , PRIMARY KEY (Id)
    , FOREIGN KEY (ProjectId) REFERENCES Project(Id)
    , FOREIGN KEY (UserId) REFERENCES User(Id)
)