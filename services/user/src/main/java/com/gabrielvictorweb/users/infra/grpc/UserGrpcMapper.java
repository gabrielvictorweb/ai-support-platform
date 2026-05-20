package com.gabrielvictorweb.users.infra.grpc;

import com.gabrielvictorweb.users.infra.controller.dto.UserInput;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import com.gabrielvictorweb.users.infra.grpc.generated.UserInputMessage;
import com.gabrielvictorweb.users.infra.grpc.generated.UserMessage;

public final class UserGrpcMapper {

    private UserGrpcMapper() {
    }

    public static UserInput toInput(UserInputMessage inputMessage) {
        String externalId = inputMessage.getExternalId();
        return new UserInput(
                inputMessage.getName(),
                inputMessage.getEmail(),
                inputMessage.getPhone(),
                externalId.isBlank() ? null : externalId
        );
    }

    public static UserMessage toMessage(UserResponse response) {
        return UserMessage.newBuilder()
                .setId(response.id() == null ? "" : response.id().toString())
                .setName(response.name())
                .setEmail(response.email())
                .setPhone(response.phone())
                .setExternalId(response.externalId() == null ? "" : response.externalId())
                .build();
    }
}
