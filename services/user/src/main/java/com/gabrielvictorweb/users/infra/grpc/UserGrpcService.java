package com.gabrielvictorweb.users.infra.grpc;

import com.gabrielvictorweb.users.infra.factory.CreateUserControllerFactory;
import com.gabrielvictorweb.users.infra.factory.DeleteUserControllerFactory;
import com.gabrielvictorweb.users.infra.factory.FindAllUsersControllerFactory;
import com.gabrielvictorweb.users.infra.factory.FindUserByEmailControllerFactory;
import com.gabrielvictorweb.users.infra.factory.FindUserByExternalIdControllerFactory;
import com.gabrielvictorweb.users.infra.factory.FindUserByIdControllerFactory;
import com.gabrielvictorweb.users.infra.factory.UpdateUserControllerFactory;
import com.gabrielvictorweb.users.infra.grpc.generated.CreateUserRequest;
import com.gabrielvictorweb.users.infra.grpc.generated.DeleteUserRequest;
import com.gabrielvictorweb.users.infra.grpc.generated.DeleteUserResponse;
import com.gabrielvictorweb.users.infra.grpc.generated.Empty;
import com.gabrielvictorweb.users.infra.grpc.generated.FindAllUsersResponse;
import com.gabrielvictorweb.users.infra.grpc.generated.FindUserByEmailRequest;
import com.gabrielvictorweb.users.infra.grpc.generated.FindUserByExternalIdRequest;
import com.gabrielvictorweb.users.infra.grpc.generated.FindUserByIdRequest;
import com.gabrielvictorweb.users.infra.grpc.generated.UpdateUserRequest;
import com.gabrielvictorweb.users.infra.grpc.generated.UserServiceGrpc;
import io.grpc.stub.StreamObserver;
import java.util.UUID;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {

    private final CreateUserControllerFactory createUserControllerFactory;
    private final DeleteUserControllerFactory deleteUserControllerFactory;
    private final FindAllUsersControllerFactory findAllUsersControllerFactory;
    private final FindUserByEmailControllerFactory findUserByEmailControllerFactory;
    private final FindUserByExternalIdControllerFactory findUserByExternalIdControllerFactory;
    private final FindUserByIdControllerFactory findUserByIdControllerFactory;
    private final UpdateUserControllerFactory updateUserControllerFactory;

    public UserGrpcService(
            CreateUserControllerFactory createUserControllerFactory,
            DeleteUserControllerFactory deleteUserControllerFactory,
            FindAllUsersControllerFactory findAllUsersControllerFactory,
            FindUserByEmailControllerFactory findUserByEmailControllerFactory,
            FindUserByExternalIdControllerFactory findUserByExternalIdControllerFactory,
            FindUserByIdControllerFactory findUserByIdControllerFactory,
            UpdateUserControllerFactory updateUserControllerFactory
    ) {
        this.createUserControllerFactory = createUserControllerFactory;
        this.deleteUserControllerFactory = deleteUserControllerFactory;
        this.findAllUsersControllerFactory = findAllUsersControllerFactory;
        this.findUserByEmailControllerFactory = findUserByEmailControllerFactory;
        this.findUserByExternalIdControllerFactory = findUserByExternalIdControllerFactory;
        this.findUserByIdControllerFactory = findUserByIdControllerFactory;
        this.updateUserControllerFactory = updateUserControllerFactory;
    }

    @Override
    public void findAllUsers(Empty request, StreamObserver<FindAllUsersResponse> responseObserver) {
        FindAllUsersResponse response = FindAllUsersResponse.newBuilder()
                .addAllUsers(findAllUsersControllerFactory.create().execute().stream().map(UserGrpcMapper::toMessage).toList())
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void findUserById(FindUserByIdRequest request, StreamObserver<com.gabrielvictorweb.users.infra.grpc.generated.UserMessage> responseObserver) {
        var response = UserGrpcMapper.toMessage(findUserByIdControllerFactory.create().execute(parseUuid(request.getId())));
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void findUserByEmail(FindUserByEmailRequest request, StreamObserver<com.gabrielvictorweb.users.infra.grpc.generated.UserMessage> responseObserver) {
        var response = UserGrpcMapper.toMessage(findUserByEmailControllerFactory.create().execute(request.getEmail()));
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void findUserByExternalId(FindUserByExternalIdRequest request, StreamObserver<com.gabrielvictorweb.users.infra.grpc.generated.UserMessage> responseObserver) {
        var response = UserGrpcMapper.toMessage(findUserByExternalIdControllerFactory.create().execute(request.getExternalId()));
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void createUser(CreateUserRequest request, StreamObserver<com.gabrielvictorweb.users.infra.grpc.generated.UserMessage> responseObserver) {
        var response = UserGrpcMapper.toMessage(createUserControllerFactory.create().execute(UserGrpcMapper.toInput(request.getInput())));
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateUser(UpdateUserRequest request, StreamObserver<com.gabrielvictorweb.users.infra.grpc.generated.UserMessage> responseObserver) {
        var response = UserGrpcMapper.toMessage(
                updateUserControllerFactory.create().execute(parseUuid(request.getId()), UserGrpcMapper.toInput(request.getInput()))
        );
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void deleteUser(DeleteUserRequest request, StreamObserver<DeleteUserResponse> responseObserver) {
        boolean deleted = deleteUserControllerFactory.create().execute(parseUuid(request.getId()));
        DeleteUserResponse response = DeleteUserResponse.newBuilder().setDeleted(deleted).build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    private UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("id is required");
        }
        return UUID.fromString(value);
    }
}
