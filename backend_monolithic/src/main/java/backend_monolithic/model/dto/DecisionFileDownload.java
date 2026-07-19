package backend_monolithic.model.dto;

import org.springframework.core.io.Resource;

public record DecisionFileDownload(
        Resource resource,
        String originalFileName,
        String contentType
) {
}
