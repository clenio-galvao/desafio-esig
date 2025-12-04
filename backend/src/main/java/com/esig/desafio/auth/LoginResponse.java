package com.esig.desafio.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private final String token;
    private final String tokenType;
    private final Long userId;
    private final String name;
    private final String email;
    private final String roles;
}


