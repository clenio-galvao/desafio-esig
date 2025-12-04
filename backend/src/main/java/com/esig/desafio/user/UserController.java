package com.esig.desafio.user;

import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserOptionResponse>> searchOptions(
            @RequestParam(name = "q", required = false) @Size(min = 2, message = "O termo de busca deve ter ao menos 2 caracteres.") String query
    ) {
        List<User> users = userService.search(query);
        List<UserOptionResponse> response = users.stream()
                .map(UserOptionResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }
}


