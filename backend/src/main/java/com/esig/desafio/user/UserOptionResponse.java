package com.esig.desafio.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class UserOptionResponse {

    private final Long value;
    private final String label;

    public static UserOptionResponse fromEntity(User user) {
        return UserOptionResponse.builder()
                .value(user.getId())
                .label(user.getName() + " (" + user.getEmail() + ")")
                .build();
    }
}


