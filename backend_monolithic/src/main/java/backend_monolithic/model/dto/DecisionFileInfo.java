package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DecisionFileInfo {
    private String originalFileName;
    private String contentType;
    private Long size;
    private LocalDateTime uploadedAt;
    private boolean previewAvailable;
}
