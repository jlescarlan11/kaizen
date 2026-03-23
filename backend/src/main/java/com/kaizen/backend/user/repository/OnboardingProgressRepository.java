package com.kaizen.backend.user.repository;

import java.util.Optional;

import com.kaizen.backend.common.repository.BaseRepository;
import com.kaizen.backend.user.entity.OnboardingProgress;

public interface OnboardingProgressRepository extends BaseRepository<OnboardingProgress, Long> {

    Optional<OnboardingProgress> findByUserAccountId(Long userAccountId);
}
