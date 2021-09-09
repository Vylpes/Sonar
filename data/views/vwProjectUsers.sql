CREATE VIEW vwProjectUsers
AS
SELECT
    pU.id AS projectUserId
  , pU.projectId
  , pU.userId
  , u.username AS userName
  , pU.role
FROM ProjectUser pU
LEFT JOIN User u
  ON pU.userId = u.id