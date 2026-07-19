package backend_monolithic.controller;

import backend_monolithic.model.dto.DecisionFileDownload;
import backend_monolithic.model.dto.DecisionFileInfo;
import backend_monolithic.service.TaskDecisionFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/tasks/{taskId}/decision-file")
@RequiredArgsConstructor
public class TaskDecisionFileController {
    private final TaskDecisionFileService taskDecisionFileService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DecisionFileInfo> upload(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(taskDecisionFileService.upload(taskId, file));
    }

    @GetMapping
    public ResponseEntity<Resource> download(@PathVariable Long taskId) {
        return buildFileResponse(taskDecisionFileService.load(taskId, false), false);
    }

    @GetMapping("/preview")
    public ResponseEntity<Resource> preview(@PathVariable Long taskId) {
        return buildFileResponse(taskDecisionFileService.load(taskId, true), true);
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@PathVariable Long taskId) {
        taskDecisionFileService.delete(taskId);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<Resource> buildFileResponse(DecisionFileDownload file, boolean inline) {
        ContentDisposition disposition = (inline
                ? ContentDisposition.inline()
                : ContentDisposition.attachment())
                .filename(file.originalFileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(file.resource());
    }
}
