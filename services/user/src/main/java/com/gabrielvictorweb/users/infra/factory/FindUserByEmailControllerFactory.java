package com.gabrielvictorweb.users.infra.factory;

import com.gabrielvictorweb.users.infra.controller.FindUserByEmailController;
import org.springframework.stereotype.Component;

@Component
public class FindUserByEmailControllerFactory {

    private final FindUserByEmailController findUserByEmailController;

    public FindUserByEmailControllerFactory(FindUserByEmailController findUserByEmailController) {
        this.findUserByEmailController = findUserByEmailController;
    }

    public FindUserByEmailController create() {
        return findUserByEmailController;
    }
}
