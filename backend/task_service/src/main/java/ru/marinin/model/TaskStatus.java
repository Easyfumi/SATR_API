package ru.marinin.model;

public enum TaskStatus {
    RECEIVED("RECEIVED"),    // заявка получена - 1 статус при создании
    REGISTERED("REGISTERED"),  // заявка зарегестрирована, ей должен быть присвоен номер
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
