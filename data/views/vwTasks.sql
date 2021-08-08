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
FROM tasks t
LEFT JOIN users uA
    ON t.assignedTo = uA.id
LEFT JOIN users uC
    oN t.createdBy = uC.id
LEFT JOIN projects p
    ON t.projectId = p.id
LEFT JOIN tasks tP
    ON t.parentTask = tP.id
