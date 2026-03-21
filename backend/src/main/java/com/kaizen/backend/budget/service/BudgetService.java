package com.kaizen.backend.budget.service;

import com.kaizen.backend.budget.dto.BudgetBatchRequest;
import com.kaizen.backend.budget.dto.BudgetCreateRequest;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserAccountRepository userAccountRepository;
    private final CategoryRepository categoryRepository;

    public BudgetService(
        BudgetRepository budgetRepository,
        UserAccountRepository userAccountRepository,
        CategoryRepository categoryRepository
    ) {
        this.budgetRepository = budgetRepository;
        this.userAccountRepository = userAccountRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public List<Budget> saveSmartBudgets(String email, BudgetBatchRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        List<Budget> budgets = new ArrayList<>(request.budgets().size());
        for (BudgetCreateRequest createRequest : request.budgets()) {
            Category category = categoryRepository.findById(createRequest.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found."));
            if (!category.isGlobal() && (category.getUser() == null || !category.getUser().getId().equals(user.getId()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is not available for this user.");
            }

            budgets.add(new Budget(user, category, createRequest.amount(), createRequest.period()));
        }

        return budgetRepository.saveAll(budgets);
    }

    @Transactional
    public Budget saveBudget(String email, BudgetCreateRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found."));
        if (!category.isGlobal() && (category.getUser() == null || !category.getUser().getId().equals(user.getId()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is not available for this user.");
        }

        Budget budget = new Budget(user, category, request.amount(), request.period());
        return budgetRepository.save(budget);
    }

    public long countBudgetsForUser(String email) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        return budgetRepository.countByUserId(user.getId());
    }
}
