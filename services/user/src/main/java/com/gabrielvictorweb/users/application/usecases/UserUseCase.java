package com.gabrielvictorweb.users.application.usecases;

import com.gabrielvictorweb.users.application.exceptions.DuplicateEmailException;
import com.gabrielvictorweb.users.application.exceptions.ResourceNotFoundException;
import com.gabrielvictorweb.users.application.gateways.UserGateway;
import com.gabrielvictorweb.users.domain.User;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

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

        User userToSave = new User(null, user.name(), user.email(), user.phone());
        return userGateway.save(userToSave);
    }

    public List<User> findAll() {
        return userGateway.findAll();
    }

    public User findById(UUID id) {
        return userGateway.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User update(UUID id, User user) {
        User existingUser = findById(id);

        if (userGateway.existsByEmailAndIdNot(user.email(), id)) {
            throw new DuplicateEmailException("Email already in use: " + user.email());
        }

        User updatedUser = new User(existingUser.id(), user.name(), user.email(), user.phone());
        return userGateway.save(updatedUser);
    }

    public void delete(UUID id) {
        findById(id);
        userGateway.deleteById(id);
    }
}
