package backend_monolithic.service;

import backend_monolithic.model.Task;
import backend_monolithic.model.dto.DecisionFileDownload;
import backend_monolithic.model.dto.DecisionFileInfo;
import org.springframework.web.multipart.MultipartFile;

public interface TaskDecisionFileService {
    DecisionFileInfo upload(Long taskId, MultipartFile file);
    DecisionFileDownload load(Long taskId, boolean preview);
    void delete(Long taskId);
    void deleteTaskDirectory(Task task);
}
