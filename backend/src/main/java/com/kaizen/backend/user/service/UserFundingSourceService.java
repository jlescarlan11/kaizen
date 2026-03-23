package com.kaizen.backend.user.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.user.entity.FundingSourceType;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.entity.UserFundingSource;
import com.kaizen.backend.user.repository.UserFundingSourceRepository;

@Service
@Transactional(readOnly = true)
public class UserFundingSourceService {

    private final UserFundingSourceRepository userFundingSourceRepository;

    public UserFundingSourceService(UserFundingSourceRepository userFundingSourceRepository) {
        this.userFundingSourceRepository = userFundingSourceRepository;
    }

    @Transactional
    public UserFundingSource replaceInitialSource(
        UserAccount userAccount,
        FundingSourceType sourceType,
        BigDecimal startingFunds
    ) {
        userFundingSourceRepository.deleteByUserAccountId(userAccount.getId());

        UserFundingSource source = new UserFundingSource(
            userAccount,
            sourceType,
            sourceType.defaultName(),
            startingFunds,
            true
        );

        return userFundingSourceRepository.save(source);
    }

    @Transactional
    public void deleteAllForUser(UserAccount userAccount) {
        userFundingSourceRepository.deleteByUserAccountId(userAccount.getId());
    }
}
