package com.example.back.Services;

import java.util.List;
import java.util.Optional;

import com.example.back.Entities.User;

public interface    UserService {

        Optional<User> GetUserByEmail(String email); // Use Optional to avoid null checks

    public void assignRoles(String userId, List<String> roles);

    public User addUser(User user);

    public List<User> AddUsers(List<User> users);

    public User UpdateUser(User u );

    public void DeleteUserByUserName(String username) ;

    public List<User> GetAllUsers();


    public User GetUserByUserName(String username);



    boolean existsByLogin(String login);

    User findById(Long idadmin);

    User findByIsTicketManager(boolean isTicketManager);
}
