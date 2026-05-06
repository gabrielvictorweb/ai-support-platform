package com.gabrielvictorweb.users.infra.grpc;

import com.gabrielvictorweb.users.application.exceptions.DuplicateEmailException;
import com.gabrielvictorweb.users.application.exceptions.ResourceNotFoundException;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@GrpcAdvice
public class GrpcGlobalExceptionHandler {

    @GrpcExceptionHandler(DuplicateEmailException.class)
    public StatusRuntimeException handleDuplicateEmail(DuplicateEmailException ex) {
        return Status.ALREADY_EXISTS
                .withDescription(ex.getMessage())
                .asRuntimeException();
    }

    @GrpcExceptionHandler(ResourceNotFoundException.class)
    public StatusRuntimeException handleNotFound(ResourceNotFoundException ex) {
        return Status.NOT_FOUND
                .withDescription(ex.getMessage())
                .asRuntimeException();
    }

    @GrpcExceptionHandler(IllegalArgumentException.class)
    public StatusRuntimeException handleBadRequest(IllegalArgumentException ex) {
        return Status.INVALID_ARGUMENT
                .withDescription(ex.getMessage())
                .asRuntimeException();
    }
}
