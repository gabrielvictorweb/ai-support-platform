package com.gabrielvictorweb.users.infra.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gabrielvictorweb.users.application.exceptions.DuplicateEmailException;
import com.gabrielvictorweb.users.application.usecases.GetUserByEmailUseCase;
import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.dto.UserInput;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreateUserControllerTest {

    @Mock
    private GetUserByEmailUseCase getUserByEmailUseCase;

    @Mock
    private UserUseCase userUseCase;

    @InjectMocks
    private CreateUserController controller;

    @Test
    void shouldCreateUserWhenEmailIsFree() {
        UserInput input = new UserInput("John", "john@example.com", "11999999999");
        User created = new User(UUID.randomUUID(), input.name(), input.email(), input.phone());

        when(getUserByEmailUseCase.execute(input.email())).thenReturn(Optional.empty());
        when(userUseCase.create(any(User.class))).thenReturn(created);

        UserResponse result = controller.execute(input);

        assertEquals(created.id(), result.id());
        assertEquals(input.name(), result.name());
        assertEquals(input.email(), result.email());
        assertEquals(input.phone(), result.phone());
    }

    @Test
    void shouldThrowWhenEmailAlreadyExists() {
        UserInput input = new UserInput("John", "john@example.com", "11999999999");
        when(getUserByEmailUseCase.execute(input.email()))
                .thenReturn(Optional.of(new User(UUID.randomUUID(), "Any", input.email(), "000")));

        assertThrows(DuplicateEmailException.class, () -> controller.execute(input));

        verify(userUseCase, never()).create(any(User.class));
    }
}
