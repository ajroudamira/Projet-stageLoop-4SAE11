package com.example.back.Controllers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.Entities.Comment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.ExceptionHandling.ApiResponse;
import com.example.back.Services.CommentService;
import com.example.back.Services.TicketService;
import com.example.back.Services.UserService;

@RestController
@RequestMapping("/api/service/comment")
public class CommentController {

    private final CommentService commentService;
    private final TicketService ticketService;
    private final UserService userService;
    
    // Explicit constructor to resolve initialization issue
    public CommentController(CommentService commentService, TicketService ticketService, UserService userService) {
        this.commentService = commentService;
        this.ticketService = ticketService;
        this.userService = userService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> createComment(@RequestBody Comment comment) {
        try {
            Comment createdComment = commentService.createComment(comment);
            ApiResponse response = new ApiResponse(true, "Comment created successfully");
            response.setData(createdComment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/AddComment")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> addComment(@RequestBody Comment comment) {
        try {
            System.out.println("AddComment called with comment:");
            System.out.println("Content: " + (comment.getContent() != null ? comment.getContent() : "null"));
            System.out.println("Internal: " + comment.isInternal());
            System.out.println("Ticket: " + (comment.getTicket() != null ? comment.getTicket().getId() : "null"));
            System.out.println("User: " + (comment.getUser() != null ? comment.getUser().getId_User() : "null"));
            
            if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
                ApiResponse response = new ApiResponse(false, "Comment content cannot be empty");
                response.setData(null);
                return ResponseEntity.badRequest().body(response);
            }
            
            if (comment.getTicket() == null || comment.getUser() == null) {
                ApiResponse response = new ApiResponse(false, "Ticket and user must be provided");
                response.setData(null);
                return ResponseEntity.badRequest().body(response);
            }
            
            Comment createdComment = commentService.createComment(comment);
            ApiResponse response = new ApiResponse(true, "Comment added successfully");
            response.setData(createdComment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        try {
            comment.setId(id);
            Comment updatedComment = commentService.updateComment(comment);
            ApiResponse response = new ApiResponse(true, "Comment updated successfully");
            response.setData(updatedComment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> getComment(@PathVariable Long id) {
        try {
            Comment comment = commentService.getCommentById(id);
            ApiResponse response = new ApiResponse(true, "Comment retrieved successfully");
            response.setData(comment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            ApiResponse response = new ApiResponse(true, "Comment deleted successfully");
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
    public ResponseEntity<ApiResponse> getCommentsByTicket(@PathVariable Long ticketId, Pageable pageable) {
        try {
            Ticket ticket = ticketService.getTicketById(ticketId);
            Page<Comment> comments = commentService.getCommentsByTicket(ticket, pageable);
            ApiResponse response = new ApiResponse(true, "Comments retrieved successfully");
            response.setData(comments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> getCommentsByUser(@PathVariable String username, Pageable pageable) {
        try {
            User user = userService.GetUserByUserName(username);
            Page<Comment> comments = commentService.getCommentsByUser(user, pageable);
            ApiResponse response = new ApiResponse(true, "Comments retrieved successfully");
            response.setData(comments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/ticket/{ticketId}/public")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> getPublicCommentsByTicket(@PathVariable Long ticketId, Pageable pageable) {
        try {
            Ticket ticket = ticketService.getTicketById(ticketId);
            Page<Comment> comments = commentService.getPublicCommentsByTicket(ticket, pageable);
            ApiResponse response = new ApiResponse(true, "Public comments retrieved successfully");
            response.setData(comments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/internal/create")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> createInternalComment(@RequestBody Comment comment) {
        try {
            Comment createdComment = commentService.createInternalComment(comment);
            ApiResponse response = new ApiResponse(true, "Internal comment created successfully");
            response.setData(createdComment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }
}
