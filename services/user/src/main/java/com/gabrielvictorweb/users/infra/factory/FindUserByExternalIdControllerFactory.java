package com.gabrielvictorweb.users.infra.factory;

import com.gabrielvictorweb.users.infra.controller.FindUserByExternalIdController;
import org.springframework.stereotype.Component;

@Component
public class FindUserByExternalIdControllerFactory {

    private final FindUserByExternalIdController findUserByExternalIdController;

    public FindUserByExternalIdControllerFactory(FindUserByExternalIdController findUserByExternalIdController) {
        this.findUserByExternalIdController = findUserByExternalIdController;
    }

    public FindUserByExternalIdController create() {
        return findUserByExternalIdController;
    }
}
