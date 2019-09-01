SELECT *, (
	SELECT id AS "LowerId"
	FROM images
	ORDER BY id ASC
	LIMIT 1
) as "lowestId" FROM images
WHERE id < $1
ORDER BY id DESC
LIMIT 20;
