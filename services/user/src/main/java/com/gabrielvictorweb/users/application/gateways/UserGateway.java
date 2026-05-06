package com.gabrielvictorweb.users.application.gateways;

import com.gabrielvictorweb.users.domain.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserGateway {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    List<User> findAll();

    void deleteById(UUID id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);
}
