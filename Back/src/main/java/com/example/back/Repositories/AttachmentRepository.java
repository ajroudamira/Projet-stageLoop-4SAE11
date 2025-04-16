package com.example.back.Repositories;

import com.example.back.Entities.Attachment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicket(Ticket ticket);
    List<Attachment> findByUploadedBy(User user);
}
