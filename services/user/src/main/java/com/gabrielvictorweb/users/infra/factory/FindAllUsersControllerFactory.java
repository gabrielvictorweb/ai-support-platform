package com.gabrielvictorweb.users.infra.factory;

import com.gabrielvictorweb.users.infra.controller.FindAllUsersController;
import org.springframework.stereotype.Component;

@Component
public class FindAllUsersControllerFactory {

    private final FindAllUsersController findAllUsersController;

    public FindAllUsersControllerFactory(FindAllUsersController findAllUsersController) {
        this.findAllUsersController = findAllUsersController;
    }

    public FindAllUsersController create() {
        return findAllUsersController;
    }
}
