package backend_monolithic.model.enums;

public enum TaskStatus {

    // OLD


//    RECEIVED("RECEIVED"),    // заявка получена
//    REGISTERED("REGISTERED"),  // заявка зарегестрирована
//    DECISION_DONE("DECISION_DONE"),  // написано решение по заявке
//    DOCUMENTS_WAITING("DOCUMENTS_WAITING"),  // ожидание документов
//    REJECTION("REJECTION"),  // отказ в проведение работ
//    CANCELLED("CANCELLED"),  // аннулирована
//    PROJECT("PROJECT"),  // переведено в проект
//    SIGNED("SIGNED"),  // подписано
//    FOR_REVISION("FOR_REVISION"), // возвращено на доработку
//    COMPLETED("COMPLETED");  // заявка выполнена
//
//
//    TaskStatus(String done) {
//
//    }



    // NEW

    RECEIVED("Получена"),
    REGISTERED("Зарегистрирована"),
    DECISION_DONE("Решение подготовлено"),
    DOCUMENTS_WAITING("Ожидание документов"),
    REJECTION("Отказ"),
    CANCELLED("Аннулирована"),
    PROJECT("Проект"),
    SIGNED("Подписано"),
    FOR_REVISION("На доработку"),
    COMPLETED("Завершена");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
