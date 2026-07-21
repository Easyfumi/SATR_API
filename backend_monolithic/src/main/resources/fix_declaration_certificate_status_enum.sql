-- Выполнить один раз для существующей MySQL-базы.
-- Ошибка "Data truncated for column 'status'" означает, что колонка status
-- имеет тип ENUM без значения ARCHIVED. Скрипт переводит status в VARCHAR(64)
-- и обновляет CHECK-ограничения для declarations и certificates.

USE SATR_API;

-- Declarations
ALTER TABLE declarations
    MODIFY COLUMN status VARCHAR(64) NULL;

-- Certificates
ALTER TABLE certificates
    MODIFY COLUMN status VARCHAR(64) NULL;

-- На случай, если остались старые CHECK без ARCHIVED
DELIMITER //

DROP PROCEDURE IF EXISTS drop_status_checks//

CREATE PROCEDURE drop_status_checks(IN table_name_param VARCHAR(64))
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE constraint_name_var VARCHAR(64);

    DECLARE constraint_cursor CURSOR FOR
        SELECT tc.CONSTRAINT_NAME
        FROM information_schema.TABLE_CONSTRAINTS tc
        JOIN information_schema.CHECK_CONSTRAINTS cc
          ON cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
         AND cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
          AND tc.TABLE_NAME = table_name_param
          AND tc.CONSTRAINT_TYPE = 'CHECK'
          AND cc.CHECK_CLAUSE LIKE '%`status`%';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN constraint_cursor;
    read_loop: LOOP
        FETCH constraint_cursor INTO constraint_name_var;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        SET @drop_sql = CONCAT(
            'ALTER TABLE `', table_name_param, '` DROP CHECK `', constraint_name_var, '`'
        );
        PREPARE drop_statement FROM @drop_sql;
        EXECUTE drop_statement;
        DEALLOCATE PREPARE drop_statement;
    END LOOP;
    CLOSE constraint_cursor;
END//

CALL drop_status_checks('declarations')//
CALL drop_status_checks('certificates')//

DROP PROCEDURE drop_status_checks//

DELIMITER ;

ALTER TABLE declarations
    ADD CONSTRAINT declarations_status_chk
    CHECK (`status` IN (
        'RECEIVED',
        'JOURNAL_REGISTERED',
        'FGIS_ENTERED',
        'DECLARATION_REGISTERED',
        'ARCHIVED'
    ));

ALTER TABLE certificates
    ADD CONSTRAINT certificates_status_chk
    CHECK (`status` IN (
        'RECEIVED',
        'JOURNAL_REGISTERED',
        'FGIS_ENTERED',
        'CERTIFICATE_REGISTERED',
        'ARCHIVED'
    ));
