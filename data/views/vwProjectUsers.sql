CREATE VIEW vwProjectUsers
AS
SELECT
    pU.id AS projectUserId
  , pU.projectId
  , pU.userId
  , u.username AS userName
  , pU.role
FROM projectUsers pU
LEFT JOIN users u
  ON pU.userId = u.id