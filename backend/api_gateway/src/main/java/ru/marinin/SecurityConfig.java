package ru.marinin;

//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
//import org.springframework.security.config.web.server.ServerHttpSecurity;
//import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
//import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
//import org.springframework.security.web.server.SecurityWebFilterChain;
//import javax.crypto.SecretKey;
//import io.jsonwebtoken.security.Keys;
//import java.nio.charset.StandardCharsets;
//
//@Configuration
//@EnableWebFluxSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
//        http
//                .csrf(ServerHttpSecurity.CsrfSpec::disable)
//                .authorizeExchange(exchanges -> exchanges
//                        .pathMatchers("/auth/**", "/users/register").permitAll()
//                        .pathMatchers("/api/users/**").hasAuthority("DIRECTOR")
//                        .pathMatchers("/api/tasks/**").hasAnyAuthority("EXPERT", "DIRECTOR")
//                        .anyExchange().authenticated()
//                )
//                .oauth2ResourceServer(oauth2 -> oauth2
//                        .jwt(jwt -> jwt.jwtAuthenticationConverter(new JwtAuthConverter())))
//                        .cors(ServerHttpSecurity.CorsSpec::disable);
//
//        return http.build();
//    }
//
//    @Bean
//    public ReactiveJwtDecoder reactiveJwtDecoder() {
//        try {
//            byte[] keyBytes = JwtConstant.SECRET_KEY.getBytes(StandardCharsets.UTF_8);
//            SecretKey key = Keys.hmacShaKeyFor(keyBytes);
//            return NimbusReactiveJwtDecoder.withSecretKey(key).build();
//        } catch (Exception e) {
//            throw new RuntimeException("Ошибка инициализации JWT-декодера: " + e.getMessage(), e);
//        }
//    }
//}