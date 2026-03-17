package com.kaizen.backend.user.repository;

import com.kaizen.backend.common.repository.BaseRepository;
import com.kaizen.backend.user.entity.UserAccount;
import java.util.Optional;

public interface UserAccountRepository extends BaseRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmail(String email);

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    Optional<UserAccount> findByProviderNameAndProviderUserId(String providerName, String providerUserId);
}
