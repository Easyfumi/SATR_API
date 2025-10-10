package backend_monolithic.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class PageResponse<T> {
    private List<T> content;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
}
