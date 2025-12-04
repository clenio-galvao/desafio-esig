package com.esig.desafio.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    /**
     * Roles opcionais no cadastro. Se não vier, podemos definir ROLE_USER por padrão
     * na camada de serviço/controlador.
     */
    @Size(max = 255)
    private String roles;
}


