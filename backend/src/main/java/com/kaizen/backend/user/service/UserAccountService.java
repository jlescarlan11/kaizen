package com.kaizen.backend.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.user.dto.UserResponse;
import com.kaizen.backend.user.repository.UserAccountRepository;

@Service
@Transactional(readOnly = true)
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;

    public UserAccountService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public UserResponse getByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
            .map(account -> new UserResponse(
                account.getId(),
                account.getName(),
                account.getEmail()
            ))
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
}
