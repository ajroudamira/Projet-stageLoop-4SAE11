package tn.esprit.examen.plateformestage.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import tn.esprit.examen.plateformestage.services.IServices;

@Controller
@RequiredArgsConstructor
public class NotificationController {

    private final IServices service;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * This test endpoint listens to messages sent to /app/testEtudiant,
     * and broadcasts a test message to the /topic/etudiantNotifications destination.
     */
    @MessageMapping("/testEtudiant")
    @SendTo("/topic/etudiantNotifications")
    public String sendTestMessage() throws Exception {
        String testMessage = "Test message from backend for etudiant";
        System.out.println("Sending test message: " + testMessage);
        return testMessage;
    }

    /**
     * Example method to send a notification when a new Etudiant is created.
     * This method can be called from your EtudiantController after successful creation.
     *
     * @param etudiant The newly created etudiant
     */
    public void sendEtudiantNotification(Object etudiant) {
        System.out.println("Sending etudiant notification: " + etudiant);
        messagingTemplate.convertAndSend("/topic/etudiantNotifications", etudiant);
    }
}
