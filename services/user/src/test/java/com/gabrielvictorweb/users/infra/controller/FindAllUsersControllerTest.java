package com.gabrielvictorweb.users.infra.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.controller.FindAllUsersController;
import com.gabrielvictorweb.users.infra.controller.dto.UserResponse;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FindAllUsersControllerTest {

    @Mock
    private UserUseCase userUseCase;

    @InjectMocks
    private FindAllUsersController controller;

    @Test
    void shouldReturnAllMappedUsers() {
        User u1 = new User(UUID.randomUUID(), "A", "a@example.com", "111");
        User u2 = new User(UUID.randomUUID(), "B", "b@example.com", "222");
        when(userUseCase.findAll()).thenReturn(List.of(u1, u2));

        List<UserResponse> result = controller.execute();

        assertEquals(2, result.size());
        assertEquals(u1.id(), result.get(0).id());
        assertEquals(u2.id(), result.get(1).id());
    }
}
