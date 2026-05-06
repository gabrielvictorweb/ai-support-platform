package com.gabrielvictorweb.users.infra.factory;

import com.gabrielvictorweb.users.infra.controller.CreateUserController;
import org.springframework.stereotype.Component;

@Component
public class CreateUserControllerFactory {

    private final CreateUserController createUserController;

    public CreateUserControllerFactory(CreateUserController createUserController) {
        this.createUserController = createUserController;
    }

    public CreateUserController create() {
        return createUserController;
    }
}
