package com.example.back.Services;

import com.example.back.Entities.PartnerRequest;
import com.example.back.Entities.User;

import java.util.List;

public interface PartnerRequestService {
    PartnerRequest createRequest(PartnerRequest request);
    PartnerRequest approveRequest(Long requestId);
    PartnerRequest rejectRequest(Long requestId, String reason);
    List<PartnerRequest> getPendingRequests();
    List<PartnerRequest> getUserRequests(User user);
    PartnerRequest getRequestById(Long requestId);
} 