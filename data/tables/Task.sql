CREATE TABLE Task (
      Id VARCHAR(36) UNIQUE
    , TaskNumber TEXT
    , Name TEXT
    , Description TEXT
    , CreatedBy TEXT
    , AssignedTo TEXT
    , CreatedAt DATETIME
    , ParentTask TEXT
    , Status INT
    , Archived BIT
    , ProjectId TEXT
    , PRIMARY KEY (Id)
    , FOREIGN KEY (CreatedBy) REFERENCES User(Id)
    , FOREIGN KEY (AssignedTo) REFERENCES User(Id)
    , FOREIGN KEY (ParentTask) REFERENCES Task(Id)
    , FOREIGN KEY (ProjectId) REFERENCES Project(Id)
)
