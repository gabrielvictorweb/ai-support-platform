package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.application.exceptions.ResourceNotFoundException;
import com.gabrielvictorweb.users.application.usecases.GetUserByEmailUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class FindUserByEmailController {

    private final GetUserByEmailUseCase getUserByEmailUseCase;

    public FindUserByEmailController(GetUserByEmailUseCase getUserByEmailUseCase) {
        this.getUserByEmailUseCase = getUserByEmailUseCase;
    }

    public UserResponse execute(String email) {
        User user = getUserByEmailUseCase.execute(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserMapper.toResponse(user);
    }
}
