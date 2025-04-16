package com.example.back.Controllers;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.back.Entities.Attachment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.ExceptionHandling.ApiResponse;
import com.example.back.Services.AttachmentService;
import com.example.back.Services.NotificationService;
import com.example.back.Services.TicketService;
import com.example.back.Services.UserService;

@RestController
@RequestMapping("/api/service/attachment")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final TicketService ticketService;
    private final UserService userService;
    private final NotificationService notificationService;
    
    // Explicit constructor to resolve initialization issue
    public AttachmentController(
            AttachmentService attachmentService, 
            TicketService ticketService, 
            UserService userService,
            NotificationService notificationService) {
        this.attachmentService = attachmentService;
        this.ticketService = ticketService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @PostMapping("/upload/{ticketId}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> uploadFile(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            @RequestParam String username) {
        try {
            Ticket ticket = ticketService.getTicketById(ticketId);
            User user = userService.GetUserByUserName(username);
            Attachment attachment = attachmentService.uploadFile(file, ticket, user);
            
            // Create notification for ticket owner if uploader is not the owner
            createAttachmentNotification(ticket, user, attachment);
            
            ApiResponse response = new ApiResponse(true, "File uploaded successfully");
            response.setData(attachment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/UploadAttachment")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> uploadAttachment(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "ticketId", required = false) String ticketIdStr,
            @RequestParam(value = "userId", required = false) String userIdStr) {
        try {
            System.out.println("UploadAttachment called with parameters:");
            System.out.println("File: " + (file != null ? file.getOriginalFilename() + " (size: " + file.getSize() + " bytes)" : "null"));
            System.out.println("TicketId: " + ticketIdStr);
            System.out.println("UserId: " + userIdStr);
            
            if (file == null) {
                ApiResponse response = new ApiResponse(false, "No file provided");
                response.setData(null);
                return ResponseEntity.badRequest().body(response);
            }
            
            if (ticketIdStr == null || userIdStr == null) {
                ApiResponse response = new ApiResponse(false, "Missing ticketId or userId");
                response.setData(null);
                return ResponseEntity.badRequest().body(response);
            }
            
            Long ticketId = Long.parseLong(ticketIdStr);
            Long userId = Long.parseLong(userIdStr);
            
            Ticket ticket = ticketService.getTicketById(ticketId);
            User user = userService.findById(userId);
            
            if (user == null) {
                ApiResponse response = new ApiResponse(false, "User not found");
                response.setData(null);
                return ResponseEntity.badRequest().body(response);
            }
            
            Attachment attachment = attachmentService.uploadFile(file, ticket, user);
            
            // Create notification for ticket owner if uploader is not the owner
            createAttachmentNotification(ticket, user, attachment);
            
            ApiResponse response = new ApiResponse(true, "File uploaded successfully");
            response.setData(attachment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Helper method to create attachment notifications
    private void createAttachmentNotification(Ticket ticket, User uploader, Attachment attachment) {
        try {
            // Only notify if notification service is available
            if (notificationService == null) {
                System.out.println("Could not create notification - notificationService is null");
                return;
            }
            
            // Notify the ticket owner if they exist and are not the uploader
            User ticketOwner = ticket.getSubmitter();
            if (ticketOwner != null && !ticketOwner.getId_User().equals(uploader.getId_User())) {
                String message = String.format("%s %s added an attachment '%s' to your ticket: %s", 
                    uploader.getFirstName(), uploader.getLastName(), 
                    attachment.getFileName(), ticket.getTitle());
                
                notificationService.createNotification(
                    message,
                    ticketOwner,
                    "ATTACHMENT",
                    ticket
                );
                
                System.out.println("Created notification for ticket owner " + ticketOwner.getLogin() + " about new attachment");
            } else {
                System.out.println("No notification sent - uploader is the ticket owner or ticket has no owner");
            }
            
            // If uploader is not an admin and the ticket has an assigned admin, notify the admin too
            if (!uploader.getRole().equals("admin")) {
                User assignedAdmin = ticket.getAssignedAdmin();
                if (assignedAdmin != null && !assignedAdmin.getId_User().equals(uploader.getId_User())) {
                    String message = String.format("%s %s added an attachment '%s' to ticket #%d: %s", 
                        uploader.getFirstName(), uploader.getLastName(), 
                        attachment.getFileName(), ticket.getId(), ticket.getTitle());
                    
                    notificationService.createNotification(
                        message,
                        assignedAdmin,
                        "ATTACHMENT",
                        ticket
                    );
                    
                    System.out.println("Created notification for assigned admin " + assignedAdmin.getLogin() + " about new attachment");
                }
            }
        } catch (Exception e) {
            // Log the error but don't prevent the upload from completing
            System.err.println("Error creating notification for attachment: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        try {
            Attachment attachment = attachmentService.getAttachmentById(id);
            byte[] fileContent = attachmentService.downloadFile(id);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(attachment.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .body(fileContent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> deleteAttachment(@PathVariable Long id) {
        try {
            attachmentService.deleteAttachment(id);
            ApiResponse response = new ApiResponse(true, "File deleted successfully");
            response.setData(null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> getAttachmentsByTicket(@PathVariable Long ticketId) {
        try {
            Ticket ticket = ticketService.getTicketById(ticketId);
            List<Attachment> attachments = attachmentService.getAttachmentsByTicket(ticket);
            ApiResponse response = new ApiResponse(true, "Attachments retrieved successfully");
            response.setData(attachments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> getAttachmentsByUser(@PathVariable String username) {
        try {
            User user = userService.GetUserByUserName(username);
            List<Attachment> attachments = attachmentService.getAttachmentsByUser(user);
            ApiResponse response = new ApiResponse(true, "Attachments retrieved successfully");
            response.setData(attachments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }
}
