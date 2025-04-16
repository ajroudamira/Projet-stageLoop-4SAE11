package com.example.back.ServiceImp;

import com.example.back.Entities.User;
import com.example.back.Repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class UserLoginTrackingService {

    private static final Logger log = LoggerFactory.getLogger(UserLoginTrackingService.class);
    
    private final UserRepository userRepository;
    private final Map<String, Set<String>> userDeviceMap = new HashMap<>(); // Store user devices

    /**
     * ✅ Track and log user login details (IP + Device Info)
     */
    /**
     * ✅ Store login history for frontend display
     */
    private final Map<String, List<Map<String, String>>> loginHistory = new HashMap<>();
    
    // Explicit constructor to resolve initialization issue
    public UserLoginTrackingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void trackUserLogin(String username, HttpServletRequest request) {
        String ipAddress = getClientIP(request);
        String deviceDetails = getDeviceDetails(request);
        String timestamp = new Date().toString();

        String deviceSignature = ipAddress + " - " + deviceDetails;

        loginHistory.putIfAbsent(username, new ArrayList<>());
        loginHistory.get(username).add(Map.of("device", deviceDetails, "ip", ipAddress, "timestamp", timestamp));

        log.info("✅ User {} logged in from: {}", username, deviceSignature);
    }

    public List<Map<String, String>> getLoginHistory(String username) {
        return loginHistory.getOrDefault(username, List.of());
    }


    /**
     * ✅ Get Client IP Address
     */
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        return (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) ? request.getRemoteAddr() : ip;
    }

    /**
     * ✅ Extract Device Details (User-Agent)
     */
    private String getDeviceDetails(HttpServletRequest request) {
        return request.getHeader("User-Agent"); // Browser & OS details
    }
}
