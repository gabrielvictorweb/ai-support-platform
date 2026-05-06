package com.gabrielvictorweb.users.infra.factory;

import com.gabrielvictorweb.users.infra.controller.DeleteUserController;
import org.springframework.stereotype.Component;

@Component
public class DeleteUserControllerFactory {

    private final DeleteUserController deleteUserController;

    public DeleteUserControllerFactory(DeleteUserController deleteUserController) {
        this.deleteUserController = deleteUserController;
    }

    public DeleteUserController create() {
        return deleteUserController;
    }
}
