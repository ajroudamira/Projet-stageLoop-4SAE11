package com.example.back.Services;

import java.util.List;
import com.example.back.Models.AdminRecommendation;

public interface TicketRecommendationService {
    /**
     * Get admin recommendations for a ticket description
     * @param description The ticket description
     * @return List of admin recommendations with confidence scores
     */
    List<AdminRecommendation> getAdminRecommendations(String description);
} 