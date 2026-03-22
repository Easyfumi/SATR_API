package backend_monolithic.service;

import backend_monolithic.model.dto.ProfileAnalyticsResponse;

import java.time.LocalDate;

public interface ProfileAnalyticsService {
    ProfileAnalyticsResponse getMyAnalytics(String jwt, LocalDate startDate, LocalDate endDate);
}
