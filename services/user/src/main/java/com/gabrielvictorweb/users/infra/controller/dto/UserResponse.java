package com.gabrielvictorweb.users.infra.controller.dto;

import java.util.UUID;

public record UserResponse(UUID id, String name, String email, String phone) {
}
