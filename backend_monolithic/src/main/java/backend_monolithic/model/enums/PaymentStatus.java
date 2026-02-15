package backend_monolithic.model.enums;

public enum PaymentStatus {
    PAIDFOR("оплачен"),
    PARTIALLYPAIDFOR("оплачен частично"),
    NOTPAIDFOR("не оплачен"),
    POSTPAID("постоплата");


    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }
    public String getDisplayName() {
        return displayName;
    }
}
