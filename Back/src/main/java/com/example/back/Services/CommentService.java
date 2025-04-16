package com.example.back.Services;

import com.example.back.Entities.Comment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    Comment createComment(Comment comment);
    Comment updateComment(Comment comment);
    Comment getCommentById(Long id);
    void deleteComment(Long id);

    // Filtering methods
    Page<Comment> getCommentsByTicket(Ticket ticket, Pageable pageable);
    Page<Comment> getCommentsByUser(User user, Pageable pageable);
    Page<Comment> getPublicCommentsByTicket(Ticket ticket, Pageable pageable);

    // Admin specific methods
    Comment createInternalComment(Comment comment);
}
