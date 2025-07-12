package ru.marinin;

//import org.springframework.core.convert.converter.Converter;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
//import org.springframework.security.authentication.AbstractAuthenticationToken;
//import org.springframework.stereotype.Component;
//import reactor.core.publisher.Mono;
//import java.util.Collection;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Component
//public class JwtAuthConverter implements Converter<Jwt, Mono<AbstractAuthenticationToken>> {
//
//    @Override
//    public Mono<AbstractAuthenticationToken> convert(Jwt jwt) {
//        // Извлечение authorities из JWT
//        Collection<String> authorities = jwt.getClaimAsStringList("authorities");
//        List<GrantedAuthority> grantedAuthorities = authorities.stream()
//                .map(SimpleGrantedAuthority::new)
//                .collect(Collectors.toList());
//
//        return Mono.just(new JwtAuthenticationToken(jwt, grantedAuthorities));
//    }
//}