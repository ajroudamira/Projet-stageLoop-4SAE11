package com.example.back.Services;

import com.example.back.Entities.StudentRequest;
import com.example.back.Entities.User;
import java.util.List;

public interface StudentRequestService {
    StudentRequest createRequest(StudentRequest request);
    StudentRequest approveRequest(Long requestId);
    StudentRequest rejectRequest(Long requestId, String reason);
    List<StudentRequest> getPendingRequests();
    List<StudentRequest> getUserRequests(User user);
    StudentRequest getRequestById(Long requestId);
} 