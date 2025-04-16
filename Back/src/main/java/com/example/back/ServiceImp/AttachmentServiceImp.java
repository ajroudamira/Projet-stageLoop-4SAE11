package com.example.back.ServiceImp;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.back.Entities.Attachment;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.Repositories.AttachmentRepository;
import com.example.back.Services.AttachmentService;

@Service
public class AttachmentServiceImp implements AttachmentService {
    private final AttachmentRepository attachmentRepository;
    private static final String UPLOAD_DIR = "uploads/attachments/";
    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    private static final List<String> ALLOWED_FILE_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/msword",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain"
    );
    
    // Explicit constructor to resolve initialization issue
    public AttachmentServiceImp(AttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
    }

    @Override
    @Transactional
    public Attachment createAttachment(Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    @Override
    public Attachment getAttachmentById(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found with id: " + id));
    }

    @Override
    @Transactional
    public void deleteAttachment(Long id) {
        Attachment attachment = getAttachmentById(id);
        try {
            Files.deleteIfExists(Paths.get(attachment.getFileUrl()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
        attachmentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Attachment uploadFile(MultipartFile file, Ticket ticket, User user) {
        if (!isValidFileType(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type");
        }
        if (!isValidFileSize(file.getSize())) {
            throw new IllegalArgumentException("File size exceeds limit");
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }

        Attachment attachment = new Attachment();
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setFileUrl(uploadPath.resolve(fileName).toString());
        attachment.setFileSize(file.getSize());
        attachment.setTicket(ticket);
        attachment.setUploadedBy(user);

        return attachmentRepository.save(attachment);
    }

    @Override
    public byte[] downloadFile(Long attachmentId) {
        Attachment attachment = getAttachmentById(attachmentId);
        try {
            return Files.readAllBytes(Paths.get(attachment.getFileUrl()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage());
        }
    }

    @Override
    public List<Attachment> getAttachmentsByTicket(Ticket ticket) {
        return attachmentRepository.findByTicket(ticket);
    }

    @Override
    public List<Attachment> getAttachmentsByUser(User user) {
        return attachmentRepository.findByUploadedBy(user);
    }

    @Override
    public boolean isValidFileType(String fileType) {
        return ALLOWED_FILE_TYPES.contains(fileType);
    }

    @Override
    public boolean isValidFileSize(long fileSize) {
        return fileSize <= MAX_FILE_SIZE;
    }
}
