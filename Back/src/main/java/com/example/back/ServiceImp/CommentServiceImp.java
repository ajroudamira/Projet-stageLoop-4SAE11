package com.example.back.ServiceImp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back.Entities.Comment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.Repositories.CommentRepository;
import com.example.back.Services.CommentService;
import com.example.back.Services.NotificationService;

@Service
public class CommentServiceImp implements CommentService {
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    
    @Autowired
    public CommentServiceImp(CommentRepository commentRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public Comment createComment(Comment comment) {
        Comment savedComment = commentRepository.save(comment);
        
        // Create notification for the ticket creator
        notificationService.createCommentNotification(
            comment.getUser(),
            comment.getTicket(),
            comment.isInternal() // Not internal
        );
        
        return savedComment;
    }

    @Override
    @Transactional
    public Comment updateComment(Comment comment) {
        return commentRepository.save(comment);
    }

    @Override
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Override
    public Page<Comment> getCommentsByTicket(Ticket ticket, Pageable pageable) {
        return commentRepository.findByTicket(ticket, pageable);
    }

    @Override
    public Page<Comment> getCommentsByUser(User user, Pageable pageable) {
        return commentRepository.findByUser(user, pageable);
    }

    @Override
    public Page<Comment> getPublicCommentsByTicket(Ticket ticket, Pageable pageable) {
        return commentRepository.findByTicketAndIsInternalFalse(ticket, pageable);
    }

    @Override
    @Transactional
    public Comment createInternalComment(Comment comment) {
        comment.setInternal(true);
        Comment savedComment = commentRepository.save(comment);
        
        // Create notification only for admins if needed
        // Here we pass true for isInternal, so our notification service 
        // knows this is an internal comment and should handle it accordingly
        notificationService.createCommentNotification(
            comment.getUser(),
            comment.getTicket(),
            true // Internal
        );
        
        return savedComment;
    }
}
