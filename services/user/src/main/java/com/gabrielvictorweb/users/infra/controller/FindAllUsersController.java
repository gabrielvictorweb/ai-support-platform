package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class FindAllUsersController {

    private final UserUseCase userUseCase;

    public FindAllUsersController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    public List<UserResponse> execute() {
        return userUseCase.findAll().stream().map(UserMapper::toResponse).toList();
    }
}
