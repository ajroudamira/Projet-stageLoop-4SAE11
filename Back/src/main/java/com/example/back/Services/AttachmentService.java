package com.example.back.Services;

import com.example.back.Entities.Attachment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {
    Attachment createAttachment(Attachment attachment);
    Attachment getAttachmentById(Long id);
    void deleteAttachment(Long id);

    // File handling methods
    Attachment uploadFile(MultipartFile file, Ticket ticket, User user);
    byte[] downloadFile(Long attachmentId);

    // Filtering methods
    List<Attachment> getAttachmentsByTicket(Ticket ticket);
    List<Attachment> getAttachmentsByUser(User user);

    // Validation methods
    boolean isValidFileType(String fileType);
    boolean isValidFileSize(long fileSize);
}
