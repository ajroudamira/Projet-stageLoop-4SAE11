package com.example.back.Controllers;

import com.example.back.Entities.StudentRequest;
import com.example.back.Entities.User;
import com.example.back.Services.StudentRequestService;
import com.example.back.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student-requests")
public class StudentRequestController {

    @Autowired
    private StudentRequestService studentRequestService;
    @Autowired
    private UserService userService;

    // Submit a new student request
    @PostMapping
    public ResponseEntity<StudentRequest> submitRequest(@RequestBody StudentRequest request, Principal principal) {
        User user = userService.GetUserByUserName(principal.getName());
        request.setUser(user);
        StudentRequest created = studentRequestService.createRequest(request);
        return ResponseEntity.ok(created);
    }

    // Approve a student request
    @PostMapping("/{id}/approve")
    public ResponseEntity<StudentRequest> approveRequest(@PathVariable Long id) {
        StudentRequest approved = studentRequestService.approveRequest(id);
        return ResponseEntity.ok(approved);
    }

    // Reject a student request
    @PostMapping("/{id}/reject")
    public ResponseEntity<StudentRequest> rejectRequest(@PathVariable Long id, @RequestParam String reason) {
        StudentRequest rejected = studentRequestService.rejectRequest(id, reason);
        return ResponseEntity.ok(rejected);
    }

    // Get all pending student requests (for admin)
    @GetMapping("/pending")
    public ResponseEntity<List<StudentRequest>> getPendingRequests() {
        return ResponseEntity.ok(studentRequestService.getPendingRequests());
    }

    // Get all requests for the current user
    @GetMapping("/my")
    public ResponseEntity<List<StudentRequest>> getMyRequests(Principal principal) {
        User user = userService.GetUserByUserName(principal.getName());
        return ResponseEntity.ok(studentRequestService.getUserRequests(user));
    }

    // Get a specific request by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(studentRequestService.getRequestById(id));
    }
} 