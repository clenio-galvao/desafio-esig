package com.esig.desafio.auth;

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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtTokenService jwtTokenService;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /auth/login deve retornar token JWT quando credenciais forem válidas")
    void login_ShouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("teste@exemplo.com");
        request.setPassword("Senha123");

        Authentication auth = Mockito.mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);

        org.springframework.security.core.userdetails.User springUser =
                new org.springframework.security.core.userdetails.User(
                        "teste@exemplo.com", "x", java.util.List.of());
        when(auth.getPrincipal()).thenReturn(springUser);

        User user = User.builder()
                .id(1L)
                .name("Usuário Teste")
                .email("teste@exemplo.com")
                .roles("ROLE_USER")
                .build();
        when(userService.getByEmailOrThrow("teste@exemplo.com")).thenReturn(user);
        when(jwtTokenService.generateToken(user)).thenReturn("JWT_TOKEN");

        String json = """
                {
                  "email": "teste@exemplo.com",
                  "password": "Senha123"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("JWT_TOKEN"))
                .andExpect(jsonPath("$.email").value("teste@exemplo.com"));
    }
}


