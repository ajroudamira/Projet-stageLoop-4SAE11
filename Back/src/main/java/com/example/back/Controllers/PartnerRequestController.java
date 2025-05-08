package com.example.back.Controllers;

import com.example.back.Entities.PartnerRequest;
import com.example.back.Entities.User;
import com.example.back.Services.PartnerRequestService;
import com.example.back.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/partner-requests")
public class PartnerRequestController {

    @Autowired
    private PartnerRequestService partnerRequestService;
    @Autowired
    private UserService userService;

    // Submit a new partner request
    @PostMapping
    public ResponseEntity<PartnerRequest> submitRequest(@RequestBody PartnerRequest request, Principal principal) {
        User user = userService.GetUserByUserName(principal.getName());
        request.setUser(user);
        PartnerRequest created = partnerRequestService.createRequest(request);
        return ResponseEntity.ok(created);
    }

    // Approve a partner request
    @PostMapping("/{id}/approve")
    public ResponseEntity<PartnerRequest> approveRequest(@PathVariable Long id) {
        PartnerRequest approved = partnerRequestService.approveRequest(id);
        return ResponseEntity.ok(approved);
    }

    // Reject a partner request
    @PostMapping("/{id}/reject")
    public ResponseEntity<PartnerRequest> rejectRequest(@PathVariable Long id, @RequestParam String reason) {
        PartnerRequest rejected = partnerRequestService.rejectRequest(id, reason);
        return ResponseEntity.ok(rejected);
    }

    // Get all pending partner requests (for admin)
    @GetMapping("/pending")
    public ResponseEntity<List<PartnerRequest>> getPendingRequests() {
        return ResponseEntity.ok(partnerRequestService.getPendingRequests());
    }

    // Get all requests for the current user
    @GetMapping("/my")
    public ResponseEntity<List<PartnerRequest>> getMyRequests(Principal principal) {
        User user = userService.GetUserByUserName(principal.getName());
        return ResponseEntity.ok(partnerRequestService.getUserRequests(user));
    }

    // Get a specific request by ID
    @GetMapping("/{id}")
    public ResponseEntity<PartnerRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(partnerRequestService.getRequestById(id));
    }
}