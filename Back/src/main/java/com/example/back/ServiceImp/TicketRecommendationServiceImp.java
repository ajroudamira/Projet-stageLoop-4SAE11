package com.example.back.ServiceImp;

import com.example.back.Services.TicketRecommendationService;
import com.example.back.Models.AdminRecommendation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.back.Services.UserService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TicketRecommendationServiceImp implements TicketRecommendationService {
    
    private static final Logger log = LoggerFactory.getLogger(TicketRecommendationServiceImp.class);
    
    @Value("${ml.service.url:http://localhost:5000}")
    private String mlServiceUrl;
    
    @Value("${ml.service.timeout:5000}")
    private int timeout;
    
    @Value("${ml.service.max-retries:3}")
    private int maxRetries;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final UserService userService;
    
    public TicketRecommendationServiceImp(RestTemplate restTemplate, ObjectMapper objectMapper, UserService userService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.userService = userService;
    }
    
    @Override
    public List<AdminRecommendation> getAdminRecommendations(String description) {
        int retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                // Prepare request headers
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                // Prepare request body
                Map<String, String> requestBody = new HashMap<>();
                requestBody.put("description", description);
                
                // Create request entity
                HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
                
                // Make request to ML service
                String response = restTemplate.postForObject(
                    mlServiceUrl + "/predict",
                    request,
                    String.class
                );
                
                // Parse response
                JsonNode root = objectMapper.readTree(response);
                List<AdminRecommendation> recommendations = new ArrayList<>();
                
                if (root.has("success") && root.get("success").asBoolean()) {
                    JsonNode recommendationsNode = root.get("recommendations");
                    for (JsonNode rec : recommendationsNode) {
                        String adminId = rec.get("admin_id").asText();
                        double confidence = rec.get("confidence").asDouble();
                        boolean exists = userService.existsByLogin(adminId);
                        recommendations.add(new AdminRecommendation(
                            adminId,
                            confidence,
                            exists
                        ));
                    }
                }
                
                return recommendations;
                
            } catch (HttpClientErrorException e) {
                log.error("HTTP error while getting recommendations: {}", e.getMessage());
                retryCount++;
                if (retryCount >= maxRetries) {
                    log.error("Max retries reached for ML service request");
                    break;
                }
            } catch (ResourceAccessException e) {
                log.error("Timeout or connection error while getting recommendations: {}", e.getMessage());
                retryCount++;
                if (retryCount >= maxRetries) {
                    log.error("Max retries reached for ML service request");
                    break;
                }
            } catch (Exception e) {
                log.error("Unexpected error while getting recommendations: {}", e.getMessage());
                break;
            }
        }
        
        // If we get here, return empty list
        return new ArrayList<>();
    }
} 