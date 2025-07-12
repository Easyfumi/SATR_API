package backend_monolithic.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import java.util.List;

@Configuration
public class ApplicationConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.sessionManagement(
                        managment -> managment.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/api/users/profile",
                                "/api/users/{id}").authenticated()
                        .requestMatchers(
                                "/api/users/{id}/roles",
                                "/api/users/all").hasAuthority("DIRECTOR")
                        .requestMatchers("/api/**").authenticated()
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

                // Заменяем setAllowedOrigins на setAllowedOriginPatterns
                cfg.setAllowedOriginPatterns(List.of(
                        "http://localhost:3000", // Для локальной разработки
                        "https://your-production-domain.com" // Ваш продакшен домен
                ));

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
