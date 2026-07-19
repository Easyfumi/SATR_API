-- Выполнить один раз для существующей MySQL-базы.
-- Скрипт заменяет глобальную уникальность номера заявки на уникальность в пределах года.

DELIMITER //

DROP PROCEDURE IF EXISTS migrate_application_number_index//

CREATE PROCEDURE migrate_application_number_index(
    IN table_name_param VARCHAR(64),
    IN yearly_index_name_param VARCHAR(64)
)
BEGIN
    DECLARE old_index_name VARCHAR(64) DEFAULT NULL;
    DECLARE application_year_exists INT DEFAULT 0;
    DECLARE yearly_index_exists INT DEFAULT 0;

    SELECT index_name
    INTO old_index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = table_name_param
      AND non_unique = 0
      AND index_name <> 'PRIMARY'
    GROUP BY index_name
    HAVING COUNT(*) = 1
       AND MAX(column_name = 'number') = 1
    LIMIT 1;

    IF old_index_name IS NOT NULL THEN
        SET @drop_index_sql = CONCAT(
            'ALTER TABLE `', table_name_param, '` DROP INDEX `', old_index_name, '`'
        );
        PREPARE drop_index_statement FROM @drop_index_sql;
        EXECUTE drop_index_statement;
        DEALLOCATE PREPARE drop_index_statement;
    END IF;

    SELECT COUNT(*)
    INTO application_year_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = table_name_param
      AND column_name = 'application_year';

    IF application_year_exists = 0 THEN
        SET @add_year_sql = CONCAT(
            'ALTER TABLE `', table_name_param,
            '` ADD COLUMN `application_year` INT ',
            'GENERATED ALWAYS AS (YEAR(`application_date`)) STORED'
        );
        PREPARE add_year_statement FROM @add_year_sql;
        EXECUTE add_year_statement;
        DEALLOCATE PREPARE add_year_statement;
    END IF;

    SELECT COUNT(*)
    INTO yearly_index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = table_name_param
      AND index_name = yearly_index_name_param;

    IF yearly_index_exists = 0 THEN
        SET @add_index_sql = CONCAT(
            'ALTER TABLE `', table_name_param, '` ADD UNIQUE INDEX `',
            yearly_index_name_param, '` (`number`, `application_year`)'
        );
        PREPARE add_index_statement FROM @add_index_sql;
        EXECUTE add_index_statement;
        DEALLOCATE PREPARE add_index_statement;
    END IF;
END//

CALL migrate_application_number_index('tasks', 'uk_tasks_number_year')//
CALL migrate_application_number_index('certificates', 'uk_certificates_number_year')//
CALL migrate_application_number_index('declarations', 'uk_declarations_number_year')//

DROP PROCEDURE migrate_application_number_index//

DELIMITER ;
