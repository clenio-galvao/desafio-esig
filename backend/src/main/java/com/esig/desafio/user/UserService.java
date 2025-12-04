package com.esig.desafio.user;

import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Cria um novo usuário com senha criptografada.
     */
    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("E-mail já está em uso.");
        }

        String rawPassword = user.getPassword();
        user.setPassword(passwordEncoder.encode(rawPassword));

         if (user.getRoles() == null || user.getRoles().isBlank()) {
             user.setRoles("ROLE_USER");
         }

        return userRepository.save(user);
    }

    public User getByIdOrThrow(Long id) {
        return userRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com id: " + id));
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getByEmailOrThrow(String email) {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com e-mail: " + email));
    }

    public List<User> search(String query) {
        if (query == null || query.isBlank()) {
            return userRepository.findAll();
        }
        String term = query.trim();
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(term, term);
    }
}


