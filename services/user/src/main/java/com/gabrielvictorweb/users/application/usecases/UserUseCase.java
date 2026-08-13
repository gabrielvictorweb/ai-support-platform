package com.gabrielvictorweb.users.application.usecases;

import com.gabrielvictorweb.users.application.exceptions.DuplicateEmailException;
import com.gabrielvictorweb.users.application.exceptions.ResourceNotFoundException;
import com.gabrielvictorweb.users.application.gateways.UserGateway;
import com.gabrielvictorweb.users.domain.User;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserUseCase {

    private final UserGateway userGateway;

    public UserUseCase(UserGateway userGateway) {
        this.userGateway = userGateway;
    }

    public User create(User user) {
        if (userGateway.existsByEmail(user.email())) {
            throw new DuplicateEmailException("Email already in use: " + user.email());
        }

        String role = (user.role() == null || user.role().isBlank()) ? "USER" : user.role();
        User userToSave = new User(null, user.name(), user.email(), user.phone(), user.externalId(), role);
        return userGateway.save(userToSave);
    }

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userGateway.findAll();
    }

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userGateway.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User update(UUID id, User user) {
        User existingUser = findById(id);

        if (userGateway.existsByEmailAndIdNot(user.email(), id)) {
            throw new DuplicateEmailException("Email already in use: " + user.email());
        }

        // role em branco no update = preserva o atual (não rebaixa por engano).
        String role = (user.role() == null || user.role().isBlank()) ? existingUser.role() : user.role();
        User updatedUser = new User(existingUser.id(), user.name(), user.email(), user.phone(), existingUser.externalId(), role);
        return userGateway.save(updatedUser);
    }

    public void delete(UUID id) {
        findById(id);
        userGateway.deleteById(id);
    }
}
