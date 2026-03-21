package com.kaizen.backend.budget.repository;

import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.common.repository.BaseRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends BaseRepository<Budget, Long> {

    List<Budget> findAllByUserIdAndPeriod(Long userId, BudgetPeriod period);

    long countByUserId(Long userId);
}
