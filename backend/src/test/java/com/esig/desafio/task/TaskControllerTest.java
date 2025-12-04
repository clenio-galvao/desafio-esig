package com.esig.desafio.task;

import com.esig.desafio.user.User;
import com.esig.desafio.user.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = TaskController.class)
@AutoConfigureMockMvc(addFilters = false)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @MockBean
    private UserService userService;

    @MockBean
    private com.esig.desafio.auth.JwtAuthenticationFilter jwtAuthenticationFilter;

    private User authenticatedUser() {
        return User.builder()
                .id(1L)
                .name("Usuário Teste")
                .email("teste@exemplo.com")
                .roles("ROLE_USER")
                .build();
    }

    private void mockAuthentication(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(user.getEmail(), "x");
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(userService.getByEmailOrThrow(user.getEmail())).thenReturn(user);
    }

    @Test
    @DisplayName("POST /tasks deve criar tarefa e retornar 201")
    void createTask_ShouldReturnCreated() throws Exception {
        User user = authenticatedUser();
        mockAuthentication(user);

        Task created = Task.builder()
                .id(10L)
                .title("Nova tarefa")
                .description("Descrição")
                .priority(TaskPriority.ALTA)
                .deadline(LocalDate.of(2025, 12, 31))
                .status(TaskStatus.EM_ANDAMENTO)
                .user(user)
                .responsible(user.getName())
                .build();

        when(taskService.create(any(Task.class), any(User.class))).thenReturn(created);

        String json = """
                {
                  "title": "Nova tarefa",
                  "description": "Descrição",
                  "priority": "ALTA",
                  "deadline": "2025-12-31"
                }
                """;

        mockMvc.perform(post("/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.title").value("Nova tarefa"))
                .andExpect(jsonPath("$.priority").value("ALTA"));
    }

    @Test
    @DisplayName("GET /tasks deve listar tarefas do usuário autenticado")
    void listTasks_ShouldReturnOk() throws Exception {
        User user = authenticatedUser();
        mockAuthentication(user);

        Task task = Task.builder()
                .id(10L)
                .title("Tarefa listada")
                .priority(TaskPriority.MEDIA)
                .deadline(LocalDate.of(2025, 11, 30))
                .status(TaskStatus.EM_ANDAMENTO)
                .user(user)
                .responsible(user.getName())
                .build();

        when(taskService.search(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(task));

        mockMvc.perform(get("/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Tarefa listada"));
    }
}


