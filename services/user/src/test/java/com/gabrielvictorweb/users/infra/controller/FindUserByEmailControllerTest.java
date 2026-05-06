package com.gabrielvictorweb.users.infra.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.gabrielvictorweb.users.application.exceptions.ResourceNotFoundException;
import com.gabrielvictorweb.users.application.usecases.GetUserByEmailUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.FindUserByEmailController;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FindUserByEmailControllerTest {

    @Mock
    private GetUserByEmailUseCase getUserByEmailUseCase;

    @InjectMocks
    private FindUserByEmailController controller;

    @Test
    void shouldReturnMappedUserByEmail() {
        String email = "john@example.com";
        User user = new User(UUID.randomUUID(), "John", email, "11999999999");
        when(getUserByEmailUseCase.execute(email)).thenReturn(Optional.of(user));

        UserResponse result = controller.execute(email);

        assertEquals(user.id(), result.id());
        assertEquals(user.email(), result.email());
    }

    @Test
    void shouldThrowWhenEmailDoesNotExist() {
        String email = "missing@example.com";
        when(getUserByEmailUseCase.execute(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> controller.execute(email));
    }
}
