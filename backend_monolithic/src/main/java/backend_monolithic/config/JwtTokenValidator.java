package backend_monolithic.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import backend_monolithic.config.JwtConstant;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class JwtTokenValidator extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String jwtHeader = request.getHeader(JwtConstant.JWT_HEADER);

        if (jwtHeader != null && jwtHeader.startsWith("Bearer ")) {
            try {
                // Убираем префикс "Bearer "
                String jwt = jwtHeader.substring(7);

                SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());

                // Парсим токен с актуальным API JJWT
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(jwt)
                        .getPayload();

                // Извлекаем email
                String email = (String) claims.get("email");

                // Получаем authorities как список строк
                List<String> authorities = (List<String>) claims.get("authorities");

                // Преобразуем в GrantedAuthority
                List<GrantedAuthority> grantedAuthorities = authorities.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                // Создаем аутентификацию
                Authentication authentication =
                        new UsernamePasswordAuthenticationToken(email, null, grantedAuthorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // Лучше логировать ошибку
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return; // Прерываем цепочку фильтров при ошибке
            }
        }

        filterChain.doFilter(request, response);
    }
}
