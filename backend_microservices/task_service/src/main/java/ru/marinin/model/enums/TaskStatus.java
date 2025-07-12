package ru.marinin.model.enums;

public enum TaskStatus {
    RECEIVED("RECEIVED"),    // заявка получена
    REGISTERED("REGISTERED"),  // заявка зарегестрирована
    DECISION_DONE("DECISION_DONE"),  // написано решение по заявке
    DOCUMENTS_WAITING("DOCUMENTS_WAITING"),  // ожидание документов
    REJECTION("REJECTION"),  // отказ в проведение работ
    CANCELLED("CANCELLED"),  // аннулирована
    PROJECT("PROJECT"),  // переведено в проект
    SIGNED("SIGNED"),  // подписано
    FOR_REVISION("FOR_REVISION"), // возвращено на доработку
    COMPLETED("COMPLETED");  // заявка выполнена


    TaskStatus(String done) {

    }
}
