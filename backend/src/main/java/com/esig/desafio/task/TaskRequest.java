package com.esig.desafio.task;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TaskRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    /**
     * Identificador do usuário responsável pela tarefa.
     * - Na criação: opcional; se não informado, a tarefa ficará SEM responsável.
     * - Na atualização: pode ser nulo para remover o responsável (regra controlada no serviço).
     */
    private Long responsibleUserId;

    @NotNull
    private TaskPriority priority;

    @NotNull
    @FutureOrPresent
    private LocalDate deadline;

    /**
     * Opcional: se não vier, o backend assumirá EM_ANDAMENTO.
     */
    private TaskStatus status;
}


