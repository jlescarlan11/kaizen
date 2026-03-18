package com.kaizen.backend.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;

import com.kaizen.backend.common.repository.BaseRepository;
import com.kaizen.backend.user.entity.UserAccount;

public interface UserAccountRepository extends BaseRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<UserAccount> findByEmailIgnoreCase(String email);

    Optional<UserAccount> findByProviderNameAndProviderUserId(String providerName, String providerUserId);
}
