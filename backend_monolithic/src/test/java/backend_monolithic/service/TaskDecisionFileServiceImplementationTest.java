package backend_monolithic.service;

import backend_monolithic.error.DecisionFileException;
import backend_monolithic.model.Task;
import backend_monolithic.model.dto.DecisionFileInfo;
import backend_monolithic.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskDecisionFileServiceImplementationTest {
    private static final long TASK_ID = 1L;

    @Mock
    private TaskRepository taskRepository;

    @TempDir
    Path tempDirectory;

    private TaskDecisionFileServiceImplementation service;
    private Task task;

    @BeforeEach
    void setUp() {
        service = new TaskDecisionFileServiceImplementation(taskRepository);
        ReflectionTestUtils.setField(service, "configuredBasePath", tempDirectory.toString());

        task = new Task();
        task.setId(TASK_ID);
        task.setNumber("123Е");
        task.setApplicationDate(LocalDate.of(2026, 7, 19));
        task.setDecisionAt(LocalDate.of(2026, 7, 20));
        when(taskRepository.findById(TASK_ID)).thenReturn(Optional.of(task));
    }

    @Test
    void uploadPdfCreatesExpectedFolderAndMetadata() {
        MockMultipartFile file = pdfFile("decision.pdf", 128);

        DecisionFileInfo info = service.upload(TASK_ID, file);

        Path storedFile = tempDirectory.resolve("123Е-2026").resolve("decision.pdf");
        assertTrue(Files.isRegularFile(storedFile));
        assertEquals("decision.pdf", info.getOriginalFileName());
        assertEquals("application/pdf", info.getContentType());
        assertEquals(file.getSize(), info.getSize());
        assertTrue(info.isPreviewAvailable());
        assertNotNull(info.getUploadedAt());
    }

    @Test
    void rejectUploadBeforeDecisionDate() {
        task.setDecisionAt(null);

        DecisionFileException exception = assertThrows(
                DecisionFileException.class,
                () -> service.upload(TASK_ID, pdfFile("decision.pdf", 64))
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void rejectFileLargerThanFiveMegabytes() {
        byte[] content = new byte[5 * 1024 * 1024 + 1];
        System.arraycopy("%PDF-".getBytes(), 0, content, 0, 5);
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.pdf", "application/pdf", content);

        DecisionFileException exception = assertThrows(
                DecisionFileException.class,
                () -> service.upload(TASK_ID, file)
        );

        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, exception.getStatus());
    }

    @Test
    void deleteRemovesFileAndMetadata() {
        service.upload(TASK_ID, pdfFile("scan.pdf", 64));

        service.delete(TASK_ID);

        assertFalse(Files.exists(tempDirectory.resolve("123Е-2026").resolve("decision.pdf")));
        assertEquals(null, task.getDecisionFileStoredName());
        assertEquals(null, task.getDecisionFileOriginalName());
    }

    private MockMultipartFile pdfFile(String name, int size) {
        byte[] content = new byte[Math.max(size, 5)];
        System.arraycopy("%PDF-".getBytes(), 0, content, 0, 5);
        return new MockMultipartFile("file", name, "application/pdf", content);
    }
}
