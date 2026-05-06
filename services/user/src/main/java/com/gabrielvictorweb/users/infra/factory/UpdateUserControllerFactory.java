package com.gabrielvictorweb.users.infra.factory;

import com.gabrielvictorweb.users.infra.controller.UpdateUserController;
import org.springframework.stereotype.Component;

@Component
public class UpdateUserControllerFactory {

    private final UpdateUserController updateUserController;

    public UpdateUserControllerFactory(UpdateUserController updateUserController) {
        this.updateUserController = updateUserController;
    }

    public UpdateUserController create() {
        return updateUserController;
    }
}
