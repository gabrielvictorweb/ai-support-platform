package com.gabrielvictorweb.users.infra.factory;

import com.gabrielvictorweb.users.infra.controller.FindUserByIdController;
import org.springframework.stereotype.Component;

@Component
public class FindUserByIdControllerFactory {

    private final FindUserByIdController findUserByIdController;

    public FindUserByIdControllerFactory(FindUserByIdController findUserByIdController) {
        this.findUserByIdController = findUserByIdController;
    }

    public FindUserByIdController create() {
        return findUserByIdController;
    }
}
