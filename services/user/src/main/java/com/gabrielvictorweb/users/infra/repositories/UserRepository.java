package com.gabrielvictorweb.users.infra.repositories;

import com.gabrielvictorweb.users.application.gateways.UserGateway;
import com.gabrielvictorweb.users.domain.User;
import com.gabrielvictorweb.users.infra.database.UserEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class UserRepository implements UserGateway {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public User save(User user) {
        UserEntity entity = toEntity(user);

        if (entity.getId() == null) {
            entityManager.persist(entity);
            return toDomain(entity);
        }

        UserEntity mergedEntity = entityManager.merge(entity);
        return toDomain(mergedEntity);
    }

    @Override
    public Optional<User> findById(UUID id) {
        UserEntity entity = entityManager.find(UserEntity.class, id);
        return Optional.ofNullable(entity).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        List<UserEntity> users = entityManager
                .createQuery("select u from UserEntity u where u.email = :email", UserEntity.class)
                .setParameter("email", email)
                .setMaxResults(1)
                .getResultList();

        if (users.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(toDomain(users.getFirst()));
    }

    @Override
    public List<User> findAll() {
        return entityManager
                .createQuery("select u from UserEntity u", UserEntity.class)
                .getResultList()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        UserEntity entity = entityManager.find(UserEntity.class, id);
        if (entity != null) {
            entityManager.remove(entity);
        }
    }

    @Override
    public boolean existsByEmail(String email) {
        Long count = entityManager
                .createQuery("select count(u) from UserEntity u where u.email = :email", Long.class)
                .setParameter("email", email)
                .getSingleResult();
        return count > 0;
    }

    @Override
    public boolean existsByEmailAndIdNot(String email, UUID id) {
        Long count = entityManager
                .createQuery("select count(u) from UserEntity u where u.email = :email and u.id <> :id", Long.class)
                .setParameter("email", email)
                .setParameter("id", id)
                .getSingleResult();
        return count > 0;
    }

    private UserEntity toEntity(User user) {
        UserEntity entity = new UserEntity();
        entity.setId(user.id());
        entity.setName(user.name());
        entity.setEmail(user.email());
        entity.setPhone(user.phone());
        return entity;
    }

    private User toDomain(UserEntity entity) {
        return new User(entity.getId(), entity.getName(), entity.getEmail(), entity.getPhone());
    }
}
