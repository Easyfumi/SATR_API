package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeclarationResponse {
    private Long id;
    private String number;
    private LocalDate applicationDate;

    private String applicant;
    private String manufacturer;
    private String representative;

    private List<String> categories;
    private String mark;
    private String typeName;
    private String modifications;
    private String commercialNames;
    private String standardSection;

    private String status;
    private Long assignedUserId;
    private UserInfo assignedUser;

    private String declarationNumber;
    private LocalDate declarationRegisteredAt;

    private LocalDateTime createdAt;
    private String createdBy;
}
