package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.application.exceptions.DuplicateEmailException;
import com.gabrielvictorweb.users.application.usecases.GetUserByEmailUseCase;
import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.dto.UserInput;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class CreateUserController {

    private final GetUserByEmailUseCase getUserByEmailUseCase;
    private final UserUseCase userUseCase;

    public CreateUserController(GetUserByEmailUseCase getUserByEmailUseCase, UserUseCase userUseCase) {
        this.getUserByEmailUseCase = getUserByEmailUseCase;
        this.userUseCase = userUseCase;
    }

    public UserResponse execute(UserInput input) {
        if (getUserByEmailUseCase.execute(input.email()).isPresent()) {
            throw new DuplicateEmailException("Email already in use: " + input.email());
        }

        User createdUser = userUseCase.create(UserMapper.toDomain(input));
        return UserMapper.toResponse(createdUser);
    }
}
