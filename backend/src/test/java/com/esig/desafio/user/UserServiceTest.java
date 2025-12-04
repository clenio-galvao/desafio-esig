package com.esig.desafio.user;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("create deve criptografar senha, definir ROLE_USER por padrão e salvar usuário")
    void create_ShouldEncodePasswordAndSetDefaultRole() {
        User toCreate = User.builder()
                .name("Teste")
                .email("teste@exemplo.com")
                .password("senha123")
                .build();

        when(userRepository.existsByEmail("teste@exemplo.com")).thenReturn(false);
        when(passwordEncoder.encode("senha123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User saved = userService.create(toCreate);

        assertEquals("encoded", saved.getPassword());
        assertEquals("ROLE_USER", saved.getRoles());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("create deve lançar IllegalArgumentException quando e-mail já existir")
    void create_ShouldThrowWhenEmailAlreadyExists() {
        User toCreate = User.builder()
                .name("Teste")
                .email("teste@exemplo.com")
                .password("senha123")
                .build();

        when(userRepository.existsByEmail("teste@exemplo.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.create(toCreate));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("getByEmailOrThrow deve lançar UsernameNotFoundException quando usuário não existir")
    void getByEmailOrThrow_ShouldThrowWhenNotFound() {
        when(userRepository.findByEmail("naoexiste@exemplo.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userService.getByEmailOrThrow("naoexiste@exemplo.com"));
    }

    @Test
    @DisplayName("getByIdOrThrow deve retornar usuário existente")
    void getByIdOrThrow_ShouldReturnUser() {
        User user = User.builder().id(1L).email("teste@exemplo.com").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.getByIdOrThrow(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("getByIdOrThrow deve lançar EntityNotFoundException quando usuário não existir")
    void getByIdOrThrow_ShouldThrowWhenNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> userService.getByIdOrThrow(1L));
    }
}


