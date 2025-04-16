package com.example.back.Repositories;

import com.example.back.Entities.Comment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByTicket(Ticket ticket, Pageable pageable);
    Page<Comment> findByUser(User user, Pageable pageable);
    Page<Comment> findByTicketAndIsInternalFalse(Ticket ticket, Pageable pageable);
}
