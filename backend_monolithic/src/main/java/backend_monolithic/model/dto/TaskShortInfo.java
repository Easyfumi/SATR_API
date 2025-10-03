package backend_monolithic.model.dto;

import backend_monolithic.model.Applicant;
import backend_monolithic.model.Manufacturer;
import backend_monolithic.model.Representative;
import backend_monolithic.model.Task;
import lombok.Data;

import java.util.List;
import java.util.Objects;

@Data
public class TaskShortInfo {
    private Long id;
    private String docType;
    private Applicant applicant;
    private Manufacturer manufacturer;
    private List<String> categories;
    private String mark;
    private String typeName;
    private String processType;
    private String previousNumber;
    private String previousProcessType;
    private Representative representative;

    public TaskShortInfo(Task task) {
        this.id = task.getId();
        this.docType = task.getDocType();
        this.applicant = task.getApplicant();
        this.manufacturer = task.getManufacturer();
        this.categories = task.getCategories();
        this.mark = task.getMark();
        this.typeName = task.getTypeName();
        this.processType = task.getProcessType();
        this.previousNumber = task.getPreviousNumber();
        this.previousProcessType = task.getPreviousProcessType();
        this.representative = task.getRepresentative();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TaskShortInfo that = (TaskShortInfo) o;
        return Objects.equals(docType, that.docType)
                && Objects.equals(id, that.id)
                && Objects.equals(applicant, that.applicant)
                && Objects.equals(manufacturer, that.manufacturer)
                && Objects.equals(categories, that.categories)
                && Objects.equals(mark, that.mark)
                && Objects.equals(typeName, that.typeName)
                && Objects.equals(processType, that.processType)
                && Objects.equals(previousNumber, that.previousNumber)
                && Objects.equals(previousProcessType, that.previousProcessType)
                && Objects.equals(representative, that.representative);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, docType, applicant, manufacturer, categories, mark, typeName, processType, previousNumber,
                previousProcessType, representative);
    }
}
