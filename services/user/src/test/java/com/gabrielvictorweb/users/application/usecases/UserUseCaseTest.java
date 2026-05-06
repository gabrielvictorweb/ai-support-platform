package com.gabrielvictorweb.users.application.usecases;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gabrielvictorweb.users.application.exceptions.DuplicateEmailException;
import com.gabrielvictorweb.users.application.exceptions.ResourceNotFoundException;
import com.gabrielvictorweb.users.application.gateways.UserGateway;
import com.gabrielvictorweb.users.application.usecases.UserUseCase;
import com.gabrielvictorweb.users.domain.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserUseCaseTest {

    @Mock
    private UserGateway userGateway;

    @InjectMocks
    private UserUseCase userUseCase;

    @Test
    void shouldCreateUserWhenEmailIsAvailable() {
        User input = new User(UUID.randomUUID(), "John", "john@example.com", "11999999999");
        User saved = new User(UUID.randomUUID(), "John", "john@example.com", "11999999999");

        when(userGateway.existsByEmail(input.email())).thenReturn(false);
        when(userGateway.save(any(User.class))).thenReturn(saved);

        User result = userUseCase.create(input);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userGateway).save(captor.capture());
        assertEquals(saved, result);
        assertEquals(null, captor.getValue().id());
        assertEquals(input.name(), captor.getValue().name());
        assertEquals(input.email(), captor.getValue().email());
        assertEquals(input.phone(), captor.getValue().phone());
    }

    @Test
    void shouldThrowWhenCreatingWithDuplicateEmail() {
        User input = new User(null, "John", "john@example.com", "11999999999");
        when(userGateway.existsByEmail(input.email())).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> userUseCase.create(input));

        verify(userGateway, never()).save(any(User.class));
    }

    @Test
    void shouldReturnAllUsers() {
        List<User> expected = List.of(
                new User(UUID.randomUUID(), "A", "a@example.com", "111"),
                new User(UUID.randomUUID(), "B", "b@example.com", "222")
        );
        when(userGateway.findAll()).thenReturn(expected);

        List<User> result = userUseCase.findAll();

        assertEquals(expected, result);
        verify(userGateway).findAll();
    }

    @Test
    void shouldReturnUserByIdWhenFound() {
        UUID id = UUID.randomUUID();
        User expected = new User(id, "John", "john@example.com", "11999999999");
        when(userGateway.findById(id)).thenReturn(Optional.of(expected));

        User result = userUseCase.findById(id);

        assertEquals(expected, result);
    }

    @Test
    void shouldThrowWhenUserNotFoundById() {
        UUID id = UUID.randomUUID();
        when(userGateway.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> userUseCase.findById(id));

        assertTrue(ex.getMessage().contains(id.toString()));
    }

    @Test
    void shouldUpdateUserWhenEmailIsAvailable() {
        UUID id = UUID.randomUUID();
        User existing = new User(id, "Old", "old@example.com", "111");
        User updateData = new User(null, "New", "new@example.com", "222");
        User expectedSaved = new User(id, "New", "new@example.com", "222");

        when(userGateway.findById(id)).thenReturn(Optional.of(existing));
        when(userGateway.existsByEmailAndIdNot(updateData.email(), id)).thenReturn(false);
        when(userGateway.save(any(User.class))).thenReturn(expectedSaved);

        User result = userUseCase.update(id, updateData);

        assertEquals(expectedSaved, result);
        verify(userGateway).save(expectedSaved);
    }

    @Test
    void shouldThrowWhenUpdatingWithDuplicateEmail() {
        UUID id = UUID.randomUUID();
        User existing = new User(id, "Old", "old@example.com", "111");
        User updateData = new User(null, "New", "dup@example.com", "222");

        when(userGateway.findById(id)).thenReturn(Optional.of(existing));
        when(userGateway.existsByEmailAndIdNot(updateData.email(), id)).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> userUseCase.update(id, updateData));

        verify(userGateway, never()).save(any(User.class));
    }

    @Test
    void shouldDeleteUserWhenExists() {
        UUID id = UUID.randomUUID();
        User existing = new User(id, "John", "john@example.com", "11999999999");

        when(userGateway.findById(id)).thenReturn(Optional.of(existing));

        userUseCase.delete(id);

        verify(userGateway).deleteById(id);
    }

    @Test
    void shouldThrowWhenDeletingMissingUser() {
        UUID id = UUID.randomUUID();
        when(userGateway.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userUseCase.delete(id));

        verify(userGateway, never()).deleteById(id);
    }
}
