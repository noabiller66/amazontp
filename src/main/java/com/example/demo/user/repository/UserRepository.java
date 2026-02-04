package com.example.demo.user.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.example.demo.user.model.User;
import com.example.demo.user.security.PasswordHasher;

@Repository
public class UserRepository {
    
    private final List<User> users = new ArrayList<>();
    private final PasswordHasher passwordHasher;

    public UserRepository(PasswordHasher passwordHasher) {
        this.passwordHasher = passwordHasher;
        
        String salt1 = passwordHasher.generateSalt();
        users.add(new User("noa@ok.fr", passwordHasher.hashPassword("test", salt1), salt1));
        
        String salt2 = passwordHasher.generateSalt();
        users.add(new User("noa2@ok.fr", passwordHasher.hashPassword("test", salt2), salt2));
    }

    public List<User> findAll() {
        return users;
    }

    public Optional<User> findById(Long id) {
        return users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst();
    }

    public Optional<User> findByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }

    public User addUser(User user) {
        users.add(user);
        return user;
    }

    public User replaceUser(User oldUser, User newUser) {
        users.remove(oldUser);
        users.add(newUser);
        return newUser;
    }
}
