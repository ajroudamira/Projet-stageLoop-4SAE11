package com.example.back.Controllers;

import com.example.back.Entities.Candidature;
import com.example.back.Entities.User;
import com.example.back.Services.CandidatureService;
import com.example.back.Services.UserService;
import com.example.back.ExceptionHandling.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/service/candidature")
public class CandidatureController {

    @Autowired
    private CandidatureService candidatureService;

    @Autowired
    private UserService userService;

    // Student endpoints
    @PreAuthorize("hasAuthority('student')")
    @PostMapping
    public ResponseEntity<ApiResponse> addCandidature(@RequestBody Candidature candidature, Authentication authentication) {
        User student = userService.GetUserByUserName(authentication.getName());
        Candidature saved = candidatureService.addCandidature(candidature, student);
        ApiResponse response = new ApiResponse(true, "Candidature added");
        response.setData(saved);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('student') or hasAuthority('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCandidature(@PathVariable Long id, @RequestBody Candidature candidature, Authentication authentication) {
        User student = userService.GetUserByUserName(authentication.getName());
        Candidature updated = candidatureService.updateCandidature(id, candidature, student);
        ApiResponse response = new ApiResponse(true, "Candidature updated");
        response.setData(updated);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('student')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCandidature(@PathVariable Long id, Authentication authentication) {
        User student = userService.GetUserByUserName(authentication.getName());
        candidatureService.deleteCandidature(id, student);
        return ResponseEntity.ok(new ApiResponse(true, "Candidature deleted"));
    }

    @PreAuthorize("hasAuthority('student')")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse> getMyCandidatures(Authentication authentication) {
        User student = userService.GetUserByUserName(authentication.getName());
        List<Candidature> list = candidatureService.getCandidaturesByStudent(student);
        ApiResponse response = new ApiResponse(true, "Candidatures retrieved");
        response.setData(list);
        return ResponseEntity.ok(response);
    }

    // Admin endpoints
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping
    public ResponseEntity<ApiResponse> getAllCandidatures() {
        List<Candidature> list = candidatureService.getAllCandidatures();
        ApiResponse response = new ApiResponse(true, "All candidatures retrieved");
        response.setData(list);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/admin/{id}")
    public ResponseEntity<ApiResponse> adminUpdateCandidature(@PathVariable Long id, @RequestBody Candidature candidature) {
        Candidature updated = candidatureService.adminUpdateCandidature(id, candidature);
        ApiResponse response = new ApiResponse(true, "Candidature updated by admin");
        response.setData(updated);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse> adminDeleteCandidature(@PathVariable Long id) {
        candidatureService.adminDeleteCandidature(id);
        return ResponseEntity.ok(new ApiResponse(true, "Candidature deleted by admin"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchCandidatures(@RequestParam String keyword) {
        List<Candidature> result = candidatureService.searchCandidatures(keyword);
        ApiResponse response = new ApiResponse(true, "Search results");
        response.setData(result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cv/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        Resource resource = candidatureService.getFile(filename);
        if (resource == null) {
            return ResponseEntity.notFound().build();
        }
        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(resource.getFile().toPath());
        } catch (Exception ignored) {}
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType(contentType))
            .body(resource);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = candidatureService.uploadFile(file);
        Map<String, String> response = new HashMap<>();
        if (fileUrl != null) {
            response.put("fileUrl", fileUrl);
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "File upload failed");
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/check-expired")
    public ResponseEntity<Map<String, String>> checkExpiredCandidatures() {
        candidatureService.checkAndUpdateExpiredCandidatures();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Expired candidatures checked and updated");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-old")
    public ResponseEntity<Map<String, String>> deleteOldCandidatures() {
        candidatureService.deleteOldCandidatures();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Old candidatures deleted");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expired")
    public ResponseEntity<ApiResponse> getExpiredCandidatures() {
        List<Candidature> expired = candidatureService.getExpiredCandidatures();
        ApiResponse response = new ApiResponse(true, "Expired candidatures");
        response.setData(expired);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('partner')")
    @GetMapping("/partner/my-candidatures")
    public ResponseEntity<ApiResponse> getCandidaturesForPartner(Authentication authentication) {
        User partner = userService.GetUserByUserName(authentication.getName());
        List<Candidature> list = candidatureService.getCandidaturesByPartner(partner);
        ApiResponse response = new ApiResponse(true, "Partner candidatures retrieved");
        response.setData(list);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('partner')")
    @PutMapping("/partner/candidature/{id}")
    public ResponseEntity<ApiResponse> updateCandidatureStatusByPartner(@PathVariable Long id, @RequestBody Candidature candidature, Authentication authentication) {
        User partner = userService.GetUserByUserName(authentication.getName());
        Candidature updated = candidatureService.updateCandidatureStatusByPartner(id, candidature, partner);
        ApiResponse response = new ApiResponse(true, "Candidature status updated by partner");
        response.setData(updated);
        return ResponseEntity.ok(response);
    }
} 