package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Stage;
import tn.esprit.examen.nomPrenomClasseExamen.services.IServices;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequiredArgsConstructor
public class NotificationController {

    private final IServices services;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/stageUpdate")
    @SendTo("/topic/stageNotifications")
    public Set<Stage> sendInitialStageNotification() throws Exception {
        List<Stage> stages = services.getStagesWithApproachingEndDates();
        Set<Stage> uniqueStages = new HashSet<>(stages); // Remove duplicates
        System.out.println("Sending initial stages: " + uniqueStages);
        return uniqueStages;
    }

    // Method to send updates when a new stage is added
    public void sendStageUpdate(Stage stage) {
        // Check if the stage's end date is within 14 days
        if (services.isEndDateApproaching(stage)) {
            System.out.println("Sending stage update: " + stage);
            messagingTemplate.convertAndSend("/topic/stageNotifications", List.of(stage));
        }
    }

    @MessageMapping("/test")
    @SendTo("/topic/stageNotifications")
    public String sendTestMessage() throws Exception {
        String testMessage = "Test message from backend";
        System.out.println("Sending test message: " + testMessage);
        return testMessage;
    }
}