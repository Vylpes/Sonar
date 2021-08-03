CREATE VIEW vwProjects
AS
SELECT
    p.id AS projectId
  , p.name
  , p.description
  , p.taskPrefix
  , p.createdBy
  , u.username AS createdByName
  , p.createdAt
  , p.archived
FROM projects p
LEFT JOIN users u
  ON p.createdBy = u.id
