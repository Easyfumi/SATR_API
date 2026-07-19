package backend_monolithic.service;

import backend_monolithic.error.DecisionFileException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.model.Task;
import backend_monolithic.model.dto.DecisionFileDownload;
import backend_monolithic.model.dto.DecisionFileInfo;
import backend_monolithic.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class TaskDecisionFileServiceImplementation implements TaskDecisionFileService {
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "pdf", "application/pdf",
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final Set<String> ALLOWED_CLIENT_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final TaskRepository taskRepository;

    @Value("${app.files.base-path:C:/satr_files}")
    private String configuredBasePath;

    @Override
    @Transactional
    public DecisionFileInfo upload(Long taskId, MultipartFile file) {
        Task task = getTask(taskId);
        validateTask(task);
        if (task.getDecisionFileStoredName() != null) {
            throw new DecisionFileException(HttpStatus.CONFLICT,
                    "Файл решения уже загружен. Удалите его перед заменой");
        }

        ValidatedFile validatedFile = validateFile(file);
        Path directory = resolveTaskDirectory(task);
        Path target = resolveInside(directory, "decision." + validatedFile.extension());
        Path temporary = resolveInside(directory, "decision-upload.tmp");
        boolean targetCreated = false;

        try {
            Files.createDirectories(directory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, temporary, StandardCopyOption.REPLACE_EXISTING);
            }
            moveReplacing(temporary, target);
            targetCreated = true;

            task.setDecisionFileOriginalName(validatedFile.originalName());
            task.setDecisionFileStoredName(target.getFileName().toString());
            task.setDecisionFileContentType(validatedFile.contentType());
            task.setDecisionFileSize(file.getSize());
            task.setDecisionFileUploadedAt(LocalDateTime.now());
            taskRepository.saveAndFlush(task);
            return toInfo(task);
        } catch (DecisionFileException e) {
            throw e;
        } catch (Exception e) {
            if (targetCreated) {
                deleteQuietly(target);
            }
            throw new DecisionFileException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Не удалось сохранить файл решения", e);
        } finally {
            deleteQuietly(temporary);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DecisionFileDownload load(Long taskId, boolean preview) {
        Task task = getTask(taskId);
        ensureFileMetadataExists(task);
        if (preview && !"application/pdf".equals(task.getDecisionFileContentType())) {
            throw new DecisionFileException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Предпросмотр доступен только для PDF");
        }

        Path path = resolveInside(resolveTaskDirectory(task), task.getDecisionFileStoredName());
        if (!Files.isRegularFile(path)) {
            throw new DecisionFileException(HttpStatus.NOT_FOUND, "Файл решения не найден на диске");
        }

        return new DecisionFileDownload(
                new FileSystemResource(path),
                task.getDecisionFileOriginalName(),
                task.getDecisionFileContentType()
        );
    }

    @Override
    @Transactional
    public void delete(Long taskId) {
        Task task = getTask(taskId);
        ensureFileMetadataExists(task);
        Path file = resolveInside(resolveTaskDirectory(task), task.getDecisionFileStoredName());

        try {
            Files.deleteIfExists(file);
            deleteDirectoryIfEmpty(file.getParent());
        } catch (IOException e) {
            throw new DecisionFileException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Не удалось удалить файл решения", e);
        }

        clearMetadata(task);
        taskRepository.saveAndFlush(task);
    }

    @Override
    public void deleteTaskDirectory(Task task) {
        if (task.getNumber() == null || task.getApplicationDate() == null) {
            return;
        }
        Path directory = resolveTaskDirectory(task);
        try {
            if (Files.isDirectory(directory)) {
                try (var paths = Files.list(directory)) {
                    paths.forEach(this::deleteQuietly);
                }
                Files.deleteIfExists(directory);
            }
        } catch (IOException e) {
            throw new DecisionFileException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Не удалось удалить файлы заявки", e);
        }
    }

    private Task getTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Задача не найдена"));
    }

    private void validateTask(Task task) {
        if (task.getDecisionAt() == null) {
            throw new DecisionFileException(HttpStatus.CONFLICT,
                    "Файл решения можно загрузить только после указания даты решения");
        }
        if (task.getNumber() == null || task.getNumber().isBlank() || task.getApplicationDate() == null) {
            throw new DecisionFileException(HttpStatus.CONFLICT,
                    "Перед загрузкой файла необходимо присвоить номер и дату заявки");
        }
    }

    private ValidatedFile validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST, "Выберите непустой файл");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new DecisionFileException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "Размер файла не должен превышать 5 МБ");
        }

        String originalName = sanitizeOriginalName(file.getOriginalFilename());
        String extension = getExtension(originalName);
        if (!CONTENT_TYPES.containsKey(extension)) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST,
                    "Разрешены только файлы PDF, DOC и DOCX");
        }

        String clientContentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT).split(";", 2)[0].trim();
        if (!ALLOWED_CLIENT_CONTENT_TYPES.contains(clientContentType)
                || !CONTENT_TYPES.get(extension).equals(clientContentType)) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST,
                    "Тип содержимого файла не соответствует PDF, DOC или DOCX");
        }

        try {
            boolean signatureValid = switch (extension) {
                case "pdf" -> startsWith(file, new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D});
                case "doc" -> startsWith(file, new byte[]{
                        (byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0,
                        (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1
                });
                case "docx" -> isDocx(file);
                default -> false;
            };
            if (!signatureValid) {
                throw new DecisionFileException(HttpStatus.BAD_REQUEST,
                        "Содержимое файла не соответствует его расширению");
            }
        } catch (IOException e) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST,
                    "Не удалось проверить содержимое файла", e);
        }

        return new ValidatedFile(originalName, extension, CONTENT_TYPES.get(extension));
    }

    private boolean startsWith(MultipartFile file, byte[] signature) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] actual = inputStream.readNBytes(signature.length);
            if (actual.length != signature.length) {
                return false;
            }
            for (int i = 0; i < signature.length; i++) {
                if (actual[i] != signature[i]) {
                    return false;
                }
            }
            return true;
        }
    }

    private boolean isDocx(MultipartFile file) throws IOException {
        boolean contentTypesFound = false;
        boolean documentFound = false;
        try (ZipInputStream zip = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            int inspectedEntries = 0;
            while ((entry = zip.getNextEntry()) != null && inspectedEntries++ < 1000) {
                String name = entry.getName();
                contentTypesFound |= "[Content_Types].xml".equals(name);
                documentFound |= "word/document.xml".equals(name);
                if (contentTypesFound && documentFound) {
                    return true;
                }
            }
        }
        return false;
    }

    private String sanitizeOriginalName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST, "Имя файла отсутствует");
        }
        String normalized = originalName.replace('\\', '/');
        String fileName = normalized.substring(normalized.lastIndexOf('/') + 1).trim();
        if (fileName.isBlank() || fileName.length() > 255 || fileName.contains("\r") || fileName.contains("\n")) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST, "Некорректное имя файла");
        }
        return fileName;
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private Path resolveTaskDirectory(Task task) {
        if (task.getNumber() == null || task.getApplicationDate() == null) {
            throw new DecisionFileException(HttpStatus.CONFLICT,
                    "У заявки отсутствуют номер или дата");
        }
        String safeNumber = task.getNumber().replaceAll("[^0-9A-Za-zА-Яа-яЁё_-]", "_");
        if (safeNumber.isBlank()) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST, "Некорректный номер заявки");
        }
        Path base = Paths.get(configuredBasePath).toAbsolutePath().normalize();
        return resolveInside(base, safeNumber + "-" + task.getApplicationDate().getYear());
    }

    private Path resolveInside(Path parent, String child) {
        Path normalizedParent = parent.toAbsolutePath().normalize();
        Path resolved = normalizedParent.resolve(child).normalize();
        if (!resolved.startsWith(normalizedParent)) {
            throw new DecisionFileException(HttpStatus.BAD_REQUEST, "Некорректный путь к файлу");
        }
        return resolved;
    }

    private void moveReplacing(Path source, Path target) throws IOException {
        try {
            Files.move(source, target,
                    StandardCopyOption.REPLACE_EXISTING,
                    StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException e) {
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private void ensureFileMetadataExists(Task task) {
        if (task.getDecisionFileStoredName() == null || task.getDecisionFileStoredName().isBlank()) {
            throw new DecisionFileException(HttpStatus.NOT_FOUND, "Файл решения не загружен");
        }
    }

    private DecisionFileInfo toInfo(Task task) {
        return new DecisionFileInfo(
                task.getDecisionFileOriginalName(),
                task.getDecisionFileContentType(),
                task.getDecisionFileSize(),
                task.getDecisionFileUploadedAt(),
                "application/pdf".equals(task.getDecisionFileContentType())
        );
    }

    private void clearMetadata(Task task) {
        task.setDecisionFileOriginalName(null);
        task.setDecisionFileStoredName(null);
        task.setDecisionFileContentType(null);
        task.setDecisionFileSize(null);
        task.setDecisionFileUploadedAt(null);
    }

    private void deleteDirectoryIfEmpty(Path directory) throws IOException {
        if (directory == null || !Files.isDirectory(directory)) {
            return;
        }
        try (var paths = Files.list(directory)) {
            if (paths.findAny().isEmpty()) {
                Files.deleteIfExists(directory);
            }
        }
    }

    private void deleteQuietly(Path path) {
        if (path == null) {
            return;
        }
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // Best-effort cleanup for temporary/orphan files.
        }
    }

    private record ValidatedFile(String originalName, String extension, String contentType) {
    }
}
