package com.esig.desafio.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class TaskResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final String responsible;
    private final TaskPriority priority;
    private final LocalDate deadline;
    private final TaskStatus status;
    private final Long responsibleId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .responsible(task.getResponsible())
                .priority(task.getPriority())
                .deadline(task.getDeadline())
                .status(task.getStatus())
                .responsibleId(task.getUser() != null ? task.getUser().getId() : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}


