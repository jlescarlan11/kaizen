package com.kaizen.backend.user.repository;

import java.util.List;

import com.kaizen.backend.common.repository.BaseRepository;
import com.kaizen.backend.user.entity.UserFundingSource;

public interface UserFundingSourceRepository extends BaseRepository<UserFundingSource, Long> {

    List<UserFundingSource> findByUserAccountId(Long userAccountId);

    void deleteByUserAccountId(Long userAccountId);
}
