package com.example.back.SecurityConfig;

import java.io.File;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;

import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Invocation;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class KeycloakConfig {

    private static final Logger log = LoggerFactory.getLogger(KeycloakConfig.class);
    
    public static Keycloak keycloak = null;

    public KeycloakConfig() {
    }

    public static Keycloak getInstance() {
        if (keycloak == null) {
            keycloak = KeycloakBuilder.builder()
                    .serverUrl("http://localhost:8080/")
                    .realm("constructionRealm")
                    .grantType(OAuth2Constants.PASSWORD)
                    .username("eddinesayf127@gmail.com")
                    .password("user")
                    .clientId("backapp")
                    .clientSecret("ogiZOIVmFkm4P2ZMWBcXbsjPbTNng0J9")
                    .build();
        }
        return keycloak;
    }

    public String getUserPhoneNumber(String userId) {
        List<UserRepresentation> users = keycloak.realm("constructionRealm").users().search(userId);
        if (!users.isEmpty() && users.get(0).getAttributes().containsKey("phone_number")) {
            return users.get(0).getAttributes().get("phone_number").get(0);
        }
        return null;
    }

    public static List<UserRepresentation> getAllUsers() {
        return getInstance().realm("constructionRealm").users().list();
    }

    public static List<Map<String, Object>> getUserLoginEvents(String realm, String username) {
        try {
            String accessToken = getAccessToken();
            Client client = ClientBuilder.newClient();
            WebTarget target = client.target("http://localhost:8080/admin/realms/" + realm + "/events");

            Invocation.Builder request = target.request(MediaType.APPLICATION_JSON);
            request.header("Authorization", "Bearer " + accessToken);

            Response response = request.get();
            String rawResponse = response.readEntity(String.class);
            response.close();

            log.info("🔍 Raw Response from Keycloak: {}", rawResponse);

            if (response.getStatus() != 200) {
                log.error("❌ Error fetching events: HTTP {} - {}", response.getStatus(), rawResponse);
                return List.of(Map.of("status", "❌ Failed to fetch events", "error", rawResponse));
            }

            JSONArray events = new JSONArray(rawResponse);
            List<Map<String, Object>> loginEvents = new ArrayList<>();

            for (int i = 0; i < events.length(); i++) {
                JSONObject event = events.getJSONObject(i);

                if ("LOGIN".equals(event.getString("type"))) {
                    Map<String, Object> eventData = new HashMap<>();
                    eventData.put("timestamp", new java.util.Date(event.getLong("time")).toString());
                    eventData.put("username", event.getString("userId"));

                    // Extract IP Address
                    JSONObject details = event.optJSONObject("details");
                    String ip = getRealClientIP(details);
                    eventData.put("ip", ip);

                    // Get location details
                    Map<String, String> locationData = getLocationFromIPMaxMind(ip);

                    // Convert Map to JSON String before returning it
                    eventData.put("location", Map.of(
                            "city", locationData.getOrDefault("city", "Unknown"),
                            "country", locationData.getOrDefault("country", "Unknown")
                    ));

                    loginEvents.add(eventData);
                }
            }

            return loginEvents.isEmpty()
                    ? List.of(Map.of("status", "⚠ No login events found", "username", username))
                    : loginEvents;

        } catch (Exception e) {
            log.error("❌ Error fetching login history from Keycloak: {}", e.getMessage());
            return List.of(Map.of("status", "❌ Failed to fetch events", "error", e.getMessage()));
        }
    }

    private static String getRealClientIP(JSONObject details) {
        if (details != null) {
            // Check for 'X-Forwarded-For' (proxy setups)
            if (details.has("X-Forwarded-For")) {
                String[] forwardedIps = details.getString("X-Forwarded-For").split(",");
                return forwardedIps[0].trim(); // First IP in the list
            }
            // Check for 'ipAddress' field (direct access)
            if (details.has("ipAddress")) {
                return details.getString("ipAddress");
            }
        }

        // Fallback: Get public IP from an external service
        return getPublicIP();
    }
    private static String getPublicIP() {
        try {
            Client client = ClientBuilder.newClient();
            WebTarget target = client.target("https://api64.ipify.org?format=json");
            Response response = target.request().get();
            String jsonResponse = response.readEntity(String.class);
            response.close();

            JSONObject json = new JSONObject(jsonResponse);
            return json.optString("ip", "Unknown");
        } catch (Exception e) {
            log.error("Failed to get public IP: {}", e.getMessage());
            return "Unknown";
        }
    }

    private static String getLocalIP() {
        try {
            InetAddress localHost = InetAddress.getLocalHost();
            return localHost.getHostAddress();
        } catch (Exception e) {
            return "Unknown";
        }
    }


    /**
     * Retrieves location data based on IP address using ip-api.com
     */
    private static Map<String, String> getLocationFromIP(String ip) {
        try {
            Client client = ClientBuilder.newClient();
            WebTarget target = client.target("https://ip-api.com/json/" + ip);
            Response response = target.request().get();
            String jsonResponse = response.readEntity(String.class);
            response.close();

            JSONObject json = new JSONObject(jsonResponse);
            if ("fail".equals(json.optString("status"))) {
                return Map.of("location", "Unknown");
            }

            return Map.of(
                    "city", json.optString("city", "Unknown"),
                    "region", json.optString("regionName", "Unknown"),
                    "country", json.optString("country", "Unknown"),
                    "latitude", json.optString("lat", "Unknown"),
                    "longitude", json.optString("lon", "Unknown")
            );

        } catch (Exception e) {
            return Map.of("location", "Ariana,Tunisia");
        }
    }

    /**
     * Retrieves location data based on IP address using MaxMind GeoIP (Optional)
     */
    private static Map<String, String> getLocationFromIPMaxMind(String ip) {
        try {
            File database = new File("C:\\Users\\MSI\\Desktop\\user-management\\Back\\src\\main\\java\\com\\example\\back\\GeoLite2-City.mmdb");
            DatabaseReader reader = new DatabaseReader.Builder(database).build();
            InetAddress ipAddress = InetAddress.getByName(ip);
            CityResponse response = reader.city(ipAddress);

            return Map.of(
                    "city", response.getCity().getName(),
                    "region", response.getMostSpecificSubdivision().getName(),
                    "country", response.getCountry().getName(),
                    "latitude", String.valueOf(response.getLocation().getLatitude()),
                    "longitude", String.valueOf(response.getLocation().getLongitude())
            );

        } catch (Exception e) {
            return Map.of("location", "Unknown");
        }
    }

    /**
     * Retrieves an access token from Keycloak
     */
    public static String getAccessToken() {
        return getInstance().tokenManager().grantToken().getToken();
    }
}
