package com.kaizen.backend.budget.repository;

import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.common.repository.BaseRepository;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends BaseRepository<Budget, Long> {

    List<Budget> findAllByUserIdAndPeriod(Long userId, BudgetPeriod period);

    @EntityGraph(attributePaths = {"user", "category"})
    List<Budget> findAllByUserId(Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndCategoryId(Long userId, Long categoryId);

    java.util.Optional<Budget> findByUserIdAndCategoryId(Long userId, Long categoryId);

    void deleteByUserId(Long userId);
}
