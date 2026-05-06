package com.gabrielvictorweb.users.application.usecases;

import com.gabrielvictorweb.users.application.gateways.UserGateway;
import com.gabrielvictorweb.users.domain.User;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class GetUserByEmailUseCase {

    private final UserGateway userGateway;

    public GetUserByEmailUseCase(UserGateway userGateway) {
        this.userGateway = userGateway;
    }

    public Optional<User> execute(String email) {
        return userGateway.findByEmail(email);
    }
}
