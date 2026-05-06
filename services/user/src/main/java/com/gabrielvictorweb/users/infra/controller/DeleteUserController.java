package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class DeleteUserController {

    private final UserUseCase userUseCase;

    public DeleteUserController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    public Boolean execute(UUID id) {
        userUseCase.delete(id);
        return true;
    }
}
