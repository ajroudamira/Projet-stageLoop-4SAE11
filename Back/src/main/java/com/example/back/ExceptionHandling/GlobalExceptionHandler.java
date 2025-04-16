package com.example.back.ExceptionHandling;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

//@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> HandelException(Exception exception)
    {
       ApiResponse apiResponse = new ApiResponse(false, exception.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        // This will send a plain text response
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("The comment is inappropriate"); // Set a custom message
    }
}