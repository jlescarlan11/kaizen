package com.kaizen.backend.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.kaizen.backend.config.JpaAuditingConfig;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import(JpaAuditingConfig.class)
class UserAccountRepositoryIntegrationTest {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Test
    void savesSocialAccountWithoutPasswordHash() {
        UserAccount userAccount = new UserAccount(
            "Jane Doe",
            "jane@example.com",
            "google",
            "google-user-123",
            null,
            "enc:v1:access-token",
            "enc:v1:refresh-token"
        );

        UserAccount savedUserAccount = userAccountRepository.save(userAccount);
        UserAccount foundUserAccount = userAccountRepository.findByEmail("jane@example.com").orElseThrow();

        assertNotNull(savedUserAccount.getId());
        assertEquals(savedUserAccount.getId(), foundUserAccount.getId());
        assertEquals("google", foundUserAccount.getProviderName());
        assertNull(foundUserAccount.getPasswordHash());
        assertEquals("enc:v1:access-token", foundUserAccount.getEncryptedAccessToken());
        assertEquals("enc:v1:refresh-token", foundUserAccount.getEncryptedRefreshToken());
    }
}
