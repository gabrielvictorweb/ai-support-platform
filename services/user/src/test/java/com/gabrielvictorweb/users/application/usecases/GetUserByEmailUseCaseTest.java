package com.gabrielvictorweb.users.application.usecases;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gabrielvictorweb.users.application.gateways.UserGateway;
import com.gabrielvictorweb.users.application.usecases.GetUserByEmailUseCase;
import com.gabrielvictorweb.users.domain.User;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GetUserByEmailUseCaseTest {

    @Mock
    private UserGateway userGateway;

    @InjectMocks
    private GetUserByEmailUseCase getUserByEmailUseCase;

    @Test
    void shouldReturnUserWhenEmailExists() {
        String email = "john@example.com";
        User expected = new User(UUID.randomUUID(), "John", email, "11999999999");
        when(userGateway.findByEmail(email)).thenReturn(Optional.of(expected));

        Optional<User> result = getUserByEmailUseCase.execute(email);

        assertEquals(Optional.of(expected), result);
        verify(userGateway).findByEmail(email);
    }
}
