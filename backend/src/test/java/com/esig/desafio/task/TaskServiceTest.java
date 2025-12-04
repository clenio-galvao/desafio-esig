package com.esig.desafio.task;

import com.esig.desafio.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private User userWithRole(String roles, Long id) {
        return User.builder()
                .id(id)
                .name("User " + id)
                .email("user" + id + "@exemplo.com")
                .password("x")
                .roles(roles)
                .build();
    }

    @Test
    @DisplayName("update deve aplicar apenas campos não nulos")
    void update_ShouldApplyOnlyNonNullFields() {
        User owner = userWithRole("ROLE_USER", 1L);

        Task existing = Task.builder()
                .id(10L)
                .title("Antigo")
                .description("Desc antiga")
                .priority(TaskPriority.BAIXA)
                .deadline(LocalDate.of(2025, 1, 1))
                .status(TaskStatus.EM_ANDAMENTO)
                .user(owner)
                .responsible(owner.getName())
                .build();

        Task updatedData = Task.builder()
                .title("Novo titulo")
                .priority(TaskPriority.ALTA)
                .build(); // demais campos ficam nulos

        when(taskRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.update(10L, updatedData, owner);

        assertEquals("Novo titulo", result.getTitle());
        assertEquals(TaskPriority.ALTA, result.getPriority());
        // Campos não enviados permanecem
        assertEquals("Desc antiga", result.getDescription());
        assertEquals(LocalDate.of(2025, 1, 1), result.getDeadline());
        assertEquals(TaskStatus.EM_ANDAMENTO, result.getStatus());
    }

    @Test
    @DisplayName("update deve lançar AccessDeniedException quando usuário não for responsável nem admin")
    void update_ShouldThrowAccessDeniedForNonOwnerNonAdmin() {
        User owner = userWithRole("ROLE_USER", 1L);
        User other = userWithRole("ROLE_USER", 2L);

        Task existing = Task.builder()
                .id(10L)
                .title("Antigo")
                .user(owner)
                .build();

        when(taskRepository.findById(10L)).thenReturn(Optional.of(existing));

        assertThrows(AccessDeniedException.class,
                () -> taskService.update(10L, new Task(), other));
    }

    @Test
    @DisplayName("update deve permitir admin alterar qualquer tarefa")
    void update_ShouldAllowAdmin() {
        User admin = userWithRole("ROLE_ADMIN", 99L);

        Task existing = Task.builder()
                .id(10L)
                .title("Antigo")
                .user(userWithRole("ROLE_USER", 1L))
                .build();

        Task updatedData = Task.builder()
                .title("Alterado pelo admin")
                .build();

        when(taskRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.update(10L, updatedData, admin);
        assertEquals("Alterado pelo admin", result.getTitle());
    }

    @Test
    @DisplayName("update deve bloquear usuário comum quando tarefa estiver concluída")
    void update_ShouldBlockUserWhenTaskConcluded() {
        User owner = userWithRole("ROLE_USER", 1L);

        Task existing = Task.builder()
                .id(10L)
                .title("Concluída")
                .status(TaskStatus.CONCLUIDA)
                .user(owner)
                .build();

        when(taskRepository.findById(10L)).thenReturn(Optional.of(existing));

        assertThrows(AccessDeniedException.class,
                () -> taskService.update(10L, new Task(), owner));
    }

    @Test
    @DisplayName("getByIdOrThrow deve lançar EntityNotFoundException quando tarefa não existir")
    void getByIdOrThrow_ShouldThrowWhenNotFound() {
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> taskService.getByIdOrThrow(1L));
    }
}


