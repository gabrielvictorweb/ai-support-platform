package com.gabrielvictorweb.users.infra.controller.dto;

public record UserInput(String name, String email, String phone, String externalId) {
}
