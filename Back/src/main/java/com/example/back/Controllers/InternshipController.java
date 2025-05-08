package com.example.back.Controllers;

import com.example.back.Entities.Internship;
import com.example.back.Entities.User;
import com.example.back.Entities.InternshipStatus;
import com.example.back.Services.InternshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/service/api/internships")
@CrossOrigin(origins = "*")
public class InternshipController {

    @Autowired
    private InternshipService internshipService;

    @PostMapping
    public ResponseEntity<Internship> createInternship(@RequestBody Internship internship) {
        return ResponseEntity.ok(internshipService.createInternship(internship));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Internship> updateInternship(@PathVariable Long id, @RequestBody Internship internship) {
        internship.setIdInternship(id);
        return ResponseEntity.ok(internshipService.updateInternship(internship));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternship(@PathVariable Long id) {
        internshipService.deleteInternship(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Internship> getInternshipById(@PathVariable Long id) {
        Internship internship = internshipService.getInternshipById(id);
        return internship != null ? ResponseEntity.ok(internship) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Internship>> getAllInternships() {
        return ResponseEntity.ok(internshipService.getAllInternships());
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<Internship>> getInternshipsByPartner(@PathVariable Long partnerId) {
        User partner = new User();
        partner.setId_User(partnerId);
        return ResponseEntity.ok(internshipService.getInternshipsByPartner(partner));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Internship>> getInternshipsByStudent(@PathVariable Long studentId) {
        User student = new User();
        student.setId_User(studentId);
        return ResponseEntity.ok(internshipService.getInternshipsByStudent(student));
    }

    @PostMapping("/{id}/assign-student/{studentId}")
    public ResponseEntity<Internship> assignStudentToInternship(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        User student = new User();
        student.setId_User(studentId);
        Internship internship = internshipService.assignStudentToInternship(id, student);
        return internship != null ? ResponseEntity.ok(internship) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Internship> updateInternshipStatus(
            @PathVariable Long id,
            @RequestBody InternshipStatus status) {
        Internship internship = internshipService.updateInternshipStatus(id, status);
        return internship != null ? ResponseEntity.ok(internship) : ResponseEntity.notFound().build();
    }
} 