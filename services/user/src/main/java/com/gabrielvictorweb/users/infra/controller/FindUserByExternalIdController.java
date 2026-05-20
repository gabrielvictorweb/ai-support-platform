package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.application.exceptions.ResourceNotFoundException;
import com.gabrielvictorweb.users.application.usecases.GetUserByExternalIdUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class FindUserByExternalIdController {

    private final GetUserByExternalIdUseCase getUserByExternalIdUseCase;

    public FindUserByExternalIdController(GetUserByExternalIdUseCase getUserByExternalIdUseCase) {
        this.getUserByExternalIdUseCase = getUserByExternalIdUseCase;
    }

    public UserResponse execute(String externalId) {
        User user = getUserByExternalIdUseCase.execute(externalId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with external_id: " + externalId));
        return UserMapper.toResponse(user);
    }
}
