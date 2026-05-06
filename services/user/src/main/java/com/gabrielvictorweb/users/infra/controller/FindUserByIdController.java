package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class FindUserByIdController {

    private final UserUseCase userUseCase;

    public FindUserByIdController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    public UserResponse execute(UUID id) {
        return UserMapper.toResponse(userUseCase.findById(id));
    }
}
