package com.esig.desafio.task;

import com.esig.desafio.user.User;
import com.esig.desafio.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        User actor = getAuthenticatedUser();

        Long responsibleId = request.getResponsibleUserId();
        User responsibleUser = responsibleId != null
                ? userService.getByIdOrThrow(responsibleId)
                : null;

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .responsible(responsibleUser != null ? responsibleUser.getName() : "")
                .priority(request.getPriority())
                .deadline(request.getDeadline())
                .status(request.getStatus())
                .user(responsibleUser)
                .build();

        Task created = taskService.create(task, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(TaskResponse.fromEntity(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @PathVariable Long id,
            @RequestBody TaskUpdateRequest request
    ) {
        User actor = getAuthenticatedUser();

        User responsibleUser = null;
        if (request.getResponsibleUserId() != null) {
            responsibleUser = userService.getByIdOrThrow(request.getResponsibleUserId());
        }

        Task toUpdate = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .deadline(request.getDeadline())
                .status(request.getStatus())
                .user(responsibleUser)
                .build();

        Task updated = taskService.update(id, toUpdate, actor);
        return ResponseEntity.ok(TaskResponse.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        User actor = getAuthenticatedUser();
        taskService.delete(id, actor);
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<TaskResponse> complete(@PathVariable Long id) {
        User actor = getAuthenticatedUser();
        Task completed = taskService.complete(id, actor);
        return ResponseEntity.ok(TaskResponse.fromEntity(completed));
    }

    /**
     * Vincula o usuário autenticado como responsável pela tarefa.
     * - ROLE_ADMIN normalmente utilizará o fluxo de edição para escolher qualquer usuário.
     * - ROLE_USER usa este endpoint para se vincular a tarefas sem responsável.
     */
    @PatchMapping("/{id}/responsavel")
    public ResponseEntity<TaskResponse> linkToSelf(@PathVariable Long id) {
        User actor = getAuthenticatedUser();
        Task linked = taskService.linkToSelf(id, actor);
        return ResponseEntity.ok(TaskResponse.fromEntity(linked));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getById(@PathVariable Long id) {
        Task task = taskService.getByIdOrThrow(id);
        return ResponseEntity.ok(TaskResponse.fromEntity(task));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String responsible,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadlineFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadlineTo,
            @RequestParam(required = false, defaultValue = "true") Boolean onlyNotConcluded
    ) {
        User actor = getAuthenticatedUser();

        boolean isAdmin = actor.getRoles() != null && actor.getRoles().contains("ROLE_ADMIN");
        Long ownerIdFilter = isAdmin ? null : actor.getId();

        List<Task> tasks = taskService.search(
                title,
                responsible,
                priority,
                deadlineFrom,
                deadlineTo,
                ownerIdFilter,
                onlyNotConcluded
        );

        List<TaskResponse> response = tasks.stream()
                .map(TaskResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.getByEmailOrThrow(email);
    }
}


