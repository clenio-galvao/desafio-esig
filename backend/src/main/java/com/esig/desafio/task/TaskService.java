package com.esig.desafio.task;

import com.esig.desafio.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public Task create(Task task, User actor) {
        // Na criação, qualquer usuário autenticado pode criar tarefas.
        return taskRepository.save(task);
    }

    public Task update(Long id, Task updatedData, User actor) {
        Task existing = getByIdOrThrow(id);

        // Fluxo especial: tarefa sem responsável e usuário está apenas se vinculando a si mesmo.
        if (existing.getUser() == null
                && updatedData.getUser() != null
                && updatedData.getUser().getId() != null
                && updatedData.getUser().getId().equals(actor.getId())
                && updatedData.getTitle() == null
                && updatedData.getDescription() == null
                && updatedData.getPriority() == null
                && updatedData.getDeadline() == null
                && updatedData.getStatus() == null) {
            existing.setUser(actor);
            existing.setResponsible(actor.getName());
            return taskRepository.save(existing);
        }

        ensureCanModify(existing, actor);

        if (updatedData.getTitle() != null) {
            existing.setTitle(updatedData.getTitle());
        }

        if (updatedData.getDescription() != null) {
            existing.setDescription(updatedData.getDescription());
        }

        if (updatedData.getPriority() != null) {
            existing.setPriority(updatedData.getPriority());
        }

        if (updatedData.getDeadline() != null) {
            existing.setDeadline(updatedData.getDeadline());
        }

        if (updatedData.getStatus() != null) {
            existing.setStatus(updatedData.getStatus());
        }

        // Atualização do responsável (somente se informado)
        if (updatedData.getUser() != null) {
            existing.setUser(updatedData.getUser());
            existing.setResponsible(updatedData.getUser().getName());
        }

        return taskRepository.save(existing);
    }

    public void delete(Long id, User actor) {
        Task existing = getByIdOrThrow(id);
        ensureCanModify(existing, actor);
        taskRepository.delete(existing);
    }

    public Task complete(Long id, User actor) {
        Task existing = getByIdOrThrow(id);
        ensureCanModify(existing, actor);
        existing.setStatus(TaskStatus.CONCLUIDA);
        return taskRepository.save(existing);
    }

    /**
     * Vincula o usuário autenticado como responsável por uma tarefa que ainda não possui responsável.
     * Aplicável principalmente para ROLE_USER.
     */
    public Task linkToSelf(Long id, User actor) {
        Task existing = getByIdOrThrow(id);

        boolean isAdmin = actor.getRoles() != null && actor.getRoles().contains("ROLE_ADMIN");
        if (isAdmin) {
            // Admin normalmente utilizará o fluxo de edição completo; ainda assim,
            // se usar este endpoint, permitimos vinculá-lo a si mesmo.
        }

        if (existing.getStatus() == TaskStatus.CONCLUIDA) {
            throw new AccessDeniedException("Não é possível vincular responsável em tarefas concluídas.");
        }

        if (existing.getUser() != null && !existing.getUser().getId().equals(actor.getId())) {
            throw new AccessDeniedException("Tarefa já possui responsável.");
        }

        existing.setUser(actor);
        existing.setResponsible(actor.getName());

        return taskRepository.save(existing);
    }

    public Task getByIdOrThrow(Long id) {
        return taskRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com id: " + id));
    }

    private void ensureCanModify(Task task, User actor) {
        boolean isAdmin = actor.getRoles() != null && actor.getRoles().contains("ROLE_ADMIN");
        if (isAdmin) {
            return;
        }

        // Usuários não admin não podem alterar/remover tarefas concluídas
        if (task.getStatus() == TaskStatus.CONCLUIDA) {
            throw new AccessDeniedException("Usuários padrão não podem alterar ou remover tarefas concluídas.");
        }

        if (task.getUser() == null || !task.getUser().getId().equals(actor.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar esta tarefa.");
        }
    }

    /**
     * Lista tarefas aplicando filtros opcionais.
     * Caso status seja nulo, o comportamento padrão (T19) poderá ser decidido posteriormente
     * na camada de controlador (por exemplo, padrão EM_ANDAMENTO).
     *
     * O parâmetro {@code onlyNotConcluded}, quando true, força o filtro para status diferente de CONCLUIDA.
     */
    public List<Task> search(
            String title,
            String responsible,
            TaskPriority priority,
            LocalDate deadlineFrom,
            LocalDate deadlineTo,
            Long ownerId,
            Boolean onlyNotConcluded
    ) {
        Specification<Task> spec = Specification.where(null);

        if (StringUtils.hasText(title)) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
        }

        if (StringUtils.hasText(responsible)) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("responsible")), "%" + responsible.toLowerCase() + "%"));
        }

        if (priority != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("priority"), priority));
        }

        if (Boolean.TRUE.equals(onlyNotConcluded)) {
            spec = spec.and((root, query, cb) ->
                    cb.notEqual(root.get("status"), TaskStatus.CONCLUIDA));
        }

        if (deadlineFrom != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("deadline"), deadlineFrom));
        }

        if (deadlineTo != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("deadline"), deadlineTo));
        }

        if (ownerId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.equal(root.get("user").get("id"), ownerId),
                            cb.isNull(root.get("user"))
                    ));
        }

        List<Task> tasks = taskRepository.findAll(spec);

        // Ordenação: primeiro pelo prazo mais próximo (deadline asc),
        // depois pela maior prioridade (ALTA > MEDIA > BAIXA) e,
        // por fim, por id para ter ordenação estável.
        tasks.sort(
                Comparator
                        .comparing(Task::getDeadline)
                        .thenComparing(task -> priorityOrder(task.getPriority()))
                        .thenComparing(Task::getId)
        );

        return tasks;
    }

    private int priorityOrder(TaskPriority priority) {
        if (priority == null) {
            return Integer.MAX_VALUE;
        }
        return switch (priority) {
            case ALTA -> 1;
            case MEDIA -> 2;
            case BAIXA -> 3;
        };
    }
}


