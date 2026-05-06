package com.gabrielvictorweb.users.infra.controller;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.infra.controller.DeleteUserController;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DeleteUserControllerTest {

    @Mock
    private UserUseCase userUseCase;

    @InjectMocks
    private DeleteUserController controller;

    @Test
    void shouldDeleteUserAndReturnTrue() {
        UUID id = UUID.randomUUID();

        Boolean result = controller.execute(id);

        assertTrue(result);
        verify(userUseCase).delete(id);
    }
}
