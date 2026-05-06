package com.gabrielvictorweb.users.infra.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.UpdateUserController;
import com.gabrielvictorweb.users.infra.controller.dto.UserInput;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UpdateUserControllerTest {

    @Mock
    private UserUseCase userUseCase;

    @InjectMocks
    private UpdateUserController controller;

    @Test
    void shouldUpdateAndReturnMappedUser() {
        UUID id = UUID.randomUUID();
        UserInput input = new UserInput("John", "john@example.com", "11999999999");
        User updated = new User(id, input.name(), input.email(), input.phone());

        when(userUseCase.update(any(UUID.class), any(User.class))).thenReturn(updated);

        UserResponse result = controller.execute(id, input);

        assertEquals(id, result.id());
        assertEquals(input.name(), result.name());
        assertEquals(input.email(), result.email());
        assertEquals(input.phone(), result.phone());
    }
}
