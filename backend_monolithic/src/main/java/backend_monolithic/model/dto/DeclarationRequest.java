package backend_monolithic.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class DeclarationRequest {
    private String applicantName;
    private String manufacturerName;
    private String representativeName;
    private List<String> categories;
    private String mark;
    private String typeName;
    private String modifications;
    private String commercialNames;
    private String standardSection;
    private Long assignedUserId;
}
