package com.esig.desafio.task;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * DTO para atualização parcial de tarefas.
 * Todos os campos são opcionais; apenas os não nulos serão aplicados.
 */
@Getter
@Setter
public class TaskUpdateRequest {

    private String title;

    private String description;

    private TaskPriority priority;

    private LocalDate deadline;

    private TaskStatus status;

    /**
     * Identificador do usuário responsável pela tarefa.
     * Se informado, atualiza o responsável.
     * Se omitido, mantém o responsável atual.
     */
    private Long responsibleUserId;
}


