package com.gabrielvictorweb.users.infra.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.FindUserByIdController;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FindUserByIdControllerTest {

    @Mock
    private UserUseCase userUseCase;

    @InjectMocks
    private FindUserByIdController controller;

    @Test
    void shouldReturnMappedUserById() {
        UUID id = UUID.randomUUID();
        User user = new User(id, "John", "john@example.com", "11999999999");
        when(userUseCase.findById(id)).thenReturn(user);

        UserResponse result = controller.execute(id);

        assertEquals(user.id(), result.id());
        assertEquals(user.name(), result.name());
        assertEquals(user.email(), result.email());
        assertEquals(user.phone(), result.phone());
    }
}
