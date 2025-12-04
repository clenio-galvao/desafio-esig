package com.esig.desafio.auth;

import com.esig.desafio.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtTokenService {

    private final String secret;
    private final long expirationMillis;

    public JwtTokenService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expiration}") long expirationMillis
    ) {
        this.secret = secret;
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("id", user.getId())
                .claim("email", user.getEmail())
                .claim("roles", user.getRoles())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return getAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims getAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        /*
         * Para simplificar o uso em desenvolvimento, tratamos o secret como texto puro
         * e apenas garantimos que o array de bytes tenha pelo menos 32 bytes (256 bits),
         * requisito mínimo do JJWT para HS256.
         */
        byte[] keyBytes = secret.getBytes();
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            for (int i = keyBytes.length; i < 32; i++) {
                padded[i] = (byte) i;
            }
            keyBytes = padded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}


