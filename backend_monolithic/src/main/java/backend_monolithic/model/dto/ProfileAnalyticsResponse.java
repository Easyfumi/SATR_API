package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileAnalyticsResponse {
    private LocalDate periodStart;
    private LocalDate periodEnd;

    private long activeTasks;
    private long activeDeclarations;
    private long activeCertificates;

    private long completedTasks;
    private long completedDeclarations;
    private long completedCertificates;
}
