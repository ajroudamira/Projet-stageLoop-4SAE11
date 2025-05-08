package com.example.back.Models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminRecommendation {
    @JsonProperty("admin_id")
    private String adminId;
    @JsonProperty("confidence")
    private double confidence;
    @JsonProperty("exists")
    private boolean exists = true;

    public AdminRecommendation(String adminId, double confidence, boolean exists) {
        this.adminId = adminId;
        this.confidence = confidence;
        this.exists = exists;
    }
} 