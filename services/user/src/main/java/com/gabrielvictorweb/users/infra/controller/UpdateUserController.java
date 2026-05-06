package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.dto.UserInput;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class UpdateUserController {

    private final UserUseCase userUseCase;

    public UpdateUserController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    public UserResponse execute(UUID id, UserInput input) {
        User updatedUser = userUseCase.update(id, UserMapper.toDomain(input));
        return UserMapper.toResponse(updatedUser);
    }
}
