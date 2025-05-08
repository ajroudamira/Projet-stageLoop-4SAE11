package com.example.back.ServiceImp;

import com.example.back.Entities.Internship;
import com.example.back.Entities.User;
import com.example.back.Entities.InternshipStatus;
import com.example.back.Repositories.InternshipRepository;
import com.example.back.Services.InternshipService;
import com.example.back.Services.NotificationService;
import com.example.back.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.temporal.ChronoUnit;
import java.time.ZoneId;

@Service
public class InternshipServiceImp implements InternshipService {

    private static final Logger log = LoggerFactory.getLogger(InternshipServiceImp.class);

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Internship createInternship(Internship internship) {
        Internship saved = internshipRepository.save(internship);
        // Notify admins if duration < 14 days
        if (saved.getStartDate() != null && saved.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(
                saved.getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                saved.getEndDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
            );
            log.info("Checking internship duration for notification: {}", saved.getTitle());
            log.info("Start: {}, End: {}", saved.getStartDate(), saved.getEndDate());
            log.info("Days: {}", days);
            if (days < 14) {
                var admins = userRepository.findByRole("admin");
                log.info("Admins found: {}", admins.size());
                for (User admin : admins) {
                    log.info("Admin: {}, role: {}", admin.getLogin(), admin.getRole());
                }
                String message = "A new internship with a short duration (" + days + " days) was added: " + saved.getTitle();
                for (User admin : admins) {
                    notificationService.createNotification(
                        message,
                        admin,
                        "SHORT_INTERNSHIP",
                        null // or pass the internship if Notification supports it
                    );
                    log.info("Notification created: {} for user: {}", message, admin.getLogin());
                }
            }
        }
        return saved;
    }

    @Override
    public Internship updateInternship(Internship internship) {
        return internshipRepository.save(internship);
    }

    @Override
    public void deleteInternship(Long id) {
        internshipRepository.deleteById(id);
    }

    @Override
    public Internship getInternshipById(Long id) {
        return internshipRepository.findById(id).orElse(null);
    }

    @Override
    public List<Internship> getAllInternships() {
        return internshipRepository.findAll();
    }

    @Override
    public List<Internship> getInternshipsByPartner(User partner) {
        return internshipRepository.findByPartner(partner);
    }

    @Override
    public List<Internship> getInternshipsByStudent(User student) {
        return internshipRepository.findByStudent(student);
    }

    @Override
    public Internship assignStudentToInternship(Long internshipId, User student) {
        Internship internship = getInternshipById(internshipId);
        if (internship != null) {
            internship.setStudent(student);
            return internshipRepository.save(internship);
        }
        return null;
    }

    @Override
    public Internship updateInternshipStatus(Long internshipId, InternshipStatus status) {
        Internship internship = getInternshipById(internshipId);
        if (internship != null) {
            internship.setStatus(status);
            return internshipRepository.save(internship);
        }
        return null;
    }
} 