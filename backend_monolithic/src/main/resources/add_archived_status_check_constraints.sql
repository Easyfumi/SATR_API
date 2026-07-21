-- Выполнить один раз для существующей MySQL-базы.
-- Hibernate ddl-auto=update не обновляет CHECK-ограничения для enum-статусов,
-- поэтому после добавления ARCHIVED старые constraints блокируют сохранение.

DELIMITER //

DROP PROCEDURE IF EXISTS recreate_status_check//

CREATE PROCEDURE recreate_status_check(
    IN table_name_param VARCHAR(64),
    IN allowed_values_param TEXT
)
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE constraint_name_var VARCHAR(64);
    DECLARE drop_sql TEXT;
    DECLARE add_sql TEXT;

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

        SET drop_sql = CONCAT(
            'ALTER TABLE `', table_name_param, '` DROP CHECK `', constraint_name_var, '`'
        );
        SET @drop_sql = drop_sql;
        PREPARE drop_statement FROM @drop_sql;
        EXECUTE drop_statement;
        DEALLOCATE PREPARE drop_statement;
    END LOOP;
    CLOSE constraint_cursor;

    SET add_sql = CONCAT(
        'ALTER TABLE `', table_name_param,
        '` ADD CONSTRAINT `', table_name_param, '_status_chk` CHECK (`status` IN (',
        allowed_values_param, '))'
    );
    SET @add_sql = add_sql;
    PREPARE add_statement FROM @add_sql;
    EXECUTE add_statement;
    DEALLOCATE PREPARE add_statement;
END//

CALL recreate_status_check(
    'tasks',
    '''RECEIVED'',''REGISTERED'',''DECISION_DONE'',''PREPARING_LAYOUT'',''DOCUMENT_VERIFICATION'',''DOCUMENTS_WAITING'',''REJECTION'',''CANCELLED'',''PROJECT'',''SIGNED'',''FOR_REVISION'',''COMPLETED'',''ARCHIVED'''
)//

CALL recreate_status_check(
    'declarations',
    '''RECEIVED'',''JOURNAL_REGISTERED'',''FGIS_ENTERED'',''DECLARATION_REGISTERED'',''ARCHIVED'''
)//

CALL recreate_status_check(
    'certificates',
    '''RECEIVED'',''JOURNAL_REGISTERED'',''FGIS_ENTERED'',''CERTIFICATE_REGISTERED'',''ARCHIVED'''
)//

DROP PROCEDURE recreate_status_check//

DELIMITER ;
