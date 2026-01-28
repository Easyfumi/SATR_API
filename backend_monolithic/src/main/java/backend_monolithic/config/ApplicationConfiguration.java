package backend_monolithic.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import backend_monolithic.config.JwtTokenValidator;

import java.util.Arrays;
import java.util.List;

@Configuration
public class ApplicationConfiguration {

    @Value("${app.cors.allowed-origin-patterns:http://localhost:3000}")
    private String allowedOriginPatterns;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.sessionManagement(
                        managment -> managment.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize
                        // Публичные эндпоинты (авторизация)
                        .requestMatchers("/auth/**").permitAll()
                        
                        // Стартовый эндпоинт - доступен всем авторизованным (включая EMPTY)
                        .requestMatchers("/").authenticated()
                        
                        // Просмотр профиля - доступен всем авторизованным (включая EMPTY)
                        .requestMatchers("/api/users/profile").authenticated()
                        
                        // Просмотр всех пользователей и изменение ролей - только DIRECTOR
                        .requestMatchers("/api/users/all", "/api/users/{id}/roles").hasAuthority("DIRECTOR")
                        
                        // Просмотр конкретного пользователя - все авторизованные кроме EMPTY
                        .requestMatchers("/api/users/{id}").hasAnyAuthority("EXPERT", "ACCOUNTANT", "DIRECTOR", "REGISTRAR")
                        
                        // Получение списка экспертов - вспомогательный эндпоинт для EXPERT, ACCOUNTANT, DIRECTOR
                        .requestMatchers("/api/users/experts").hasAnyAuthority("EXPERT", "ACCOUNTANT", "DIRECTOR")
                        
                        // Просмотр заявок (tasks) - все авторизованные кроме EMPTY
                        .requestMatchers(HttpMethod.GET, "/api/tasks", "/api/tasks/{id}", "/api/tasks/search", "/api/tasks/my")
                                .hasAnyAuthority("EXPERT", "ACCOUNTANT", "DIRECTOR", "REGISTRAR")
                        
                        // Создание и изменение заявок - только EXPERT и DIRECTOR
                        .requestMatchers(HttpMethod.POST, "/api/tasks", "/api/tasks/create", "/api/tasks/check-duplicates").hasAnyAuthority("EXPERT", "DIRECTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/tasks/{id}", "/api/tasks/{id}/number", "/api/tasks/{id}/decision-date", 
                                "/api/tasks/{id}/status", "/api/tasks/{id}/expert").hasAnyAuthority("EXPERT", "DIRECTOR")
                        
                        // Привязка заявки к договору - только ACCOUNTANT
                        .requestMatchers(HttpMethod.PUT, "/api/tasks/{id}/contract").hasAuthority("ACCOUNTANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/tasks/{id}/contract").hasAuthority("ACCOUNTANT")
                        
                        // Просмотр договоров - все авторизованные кроме EMPTY
                        .requestMatchers(HttpMethod.GET, "/api/contracts", "/api/contracts/{id}", "/api/contracts/{id}/tasks")
                                .hasAnyAuthority("EXPERT", "ACCOUNTANT", "DIRECTOR", "REGISTRAR")
                        
                        // Создание, изменение и удаление договоров - только ACCOUNTANT
                        .requestMatchers(HttpMethod.POST, "/api/contracts").hasAuthority("ACCOUNTANT")
                        .requestMatchers(HttpMethod.PUT, "/api/contracts/{id}").hasAuthority("ACCOUNTANT")
                        .requestMatchers(HttpMethod.PATCH, "/api/contracts/{id}/comments", "/api/contracts/{id}/payment-status").hasAuthority("ACCOUNTANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/contracts/{id}").hasAuthority("ACCOUNTANT")
                        
                        // Вспомогательные эндпоинты (поиск) - для EXPERT, ACCOUNTANT, DIRECTOR
                        .requestMatchers("/api/applicants/search", "/api/manufacturers/search", "/api/representatives/search")
                                .hasAnyAuthority("EXPERT", "ACCOUNTANT", "DIRECTOR")
                        
                        // Все остальные API эндпоинты - блокируем EMPTY (требуют роли отличной от EMPTY)
                        .requestMatchers("/api/**").hasAnyAuthority("EXPERT", "ACCOUNTANT", "DIRECTOR", "REGISTRAR")
                        
                        // Все остальные запросы разрешены
                        .anyRequest().permitAll()
                )
                .addFilterBefore(new JwtTokenValidator(), BasicAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(CorsConfigurationSource()))
                .httpBasic(Customizer.withDefaults())
                .formLogin(Customizer.withDefaults());

        return httpSecurity.build();
    }

    private CorsConfigurationSource CorsConfigurationSource() {
        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                CorsConfiguration cfg = new CorsConfiguration();

                List<String> patterns = Arrays.stream(allowedOriginPatterns.split(","))
                        .map(String::trim)
                        .filter(value -> !value.isEmpty())
                        .toList();
                cfg.setAllowedOriginPatterns(patterns);

                cfg.setAllowedMethods(List.of(
                        "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
                ));

                cfg.setAllowCredentials(true);
                cfg.setAllowedHeaders(List.of("*"));
                cfg.setExposedHeaders(List.of(
                        "Authorization",
                        "Content-Type",
                        "Content-Disposition"
                ));
                cfg.setMaxAge(3600L);

                return cfg;
            }
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
