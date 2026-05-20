package com.gabrielvictorweb.users.application.usecases;

import com.gabrielvictorweb.users.application.gateways.UserGateway;
import com.gabrielvictorweb.users.domain.User;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GetUserByExternalIdUseCase {

    private final UserGateway userGateway;

    public GetUserByExternalIdUseCase(UserGateway userGateway) {
        this.userGateway = userGateway;
    }

    @Transactional(readOnly = true)
    public Optional<User> execute(String externalId) {
        return userGateway.findByExternalId(externalId);
    }
}
