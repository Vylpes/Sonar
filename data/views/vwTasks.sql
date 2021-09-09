CREATE VIEW vwTasks
AS
SELECT
      t.id
    , t.taskNumber
    , t.name
    , t.description
    , t.createdBy
    , t.assignedTo
    , t.createdAt
    , t.parentTask
    , t.status
    , t.archived
    , t.projectId
    , uC.username AS CreatedByUsername
    , uA.username AS AssignedToUsername
    , p.name AS ProjectName
    , tP.name AS ParentTaskName
FROM Task t
LEFT JOIN User uA
    ON t.assignedTo = uA.id
LEFT JOIN User uC
    oN t.createdBy = uC.id
LEFT JOIN Project p
    ON t.projectId = p.id
LEFT JOIN Task tP
    ON t.parentTask = tP.id
