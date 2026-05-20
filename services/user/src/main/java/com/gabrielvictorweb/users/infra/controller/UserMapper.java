package com.gabrielvictorweb.users.infra.controller;

import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.dto.UserInput;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;

public final class UserMapper {

    private UserMapper() {
    }

    public static User toDomain(UserInput input) {
        return new User(null, input.name(), input.email(), input.phone(), input.externalId());
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(user.id(), user.name(), user.email(), user.phone(), user.externalId());
    }
}