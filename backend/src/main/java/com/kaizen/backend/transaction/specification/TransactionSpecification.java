package com.kaizen.backend.transaction.specification;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.transaction.entity.Transaction;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class TransactionSpecification {

    public static Specification<Transaction> filterTransactions(
            Long userId,
            String search,
            List<Long> categoryIds,
            List<Long> paymentMethodIds,
            List<TransactionType> types,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            OffsetDateTime lastDate,
            Long lastId) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. User Ownership (Mandatory)
            predicates.add(criteriaBuilder.equal(root.get("userAccount").get("id"), userId));

            // 2. Search (description, notes, or category name)
            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate descriptionPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern);
                Predicate notesPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("notes")), searchPattern);
                Predicate categoryPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.join("category", JoinType.LEFT).get("name")), searchPattern);
                predicates.add(criteriaBuilder.or(descriptionPredicate, notesPredicate, categoryPredicate));
                if (query != null) {
                    query.distinct(true);
                }
            }

            // 3. Category IDs
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            // 4. Payment Method IDs
            if (paymentMethodIds != null && !paymentMethodIds.isEmpty()) {
                predicates.add(root.get("paymentMethod").get("id").in(paymentMethodIds));
            }

            // 5. Transaction Types
            if (types != null && !types.isEmpty()) {
                predicates.add(root.get("type").in(types));
            }

            // 6. Date Range
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }

            // 7. Amount Range
            if (minAmount != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            // 8. Cursor-based Pagination
            if (lastDate != null && lastId != null) {
                Predicate dateBefore = criteriaBuilder.lessThan(root.get("transactionDate"), lastDate);
                Predicate sameDateIdBefore = criteriaBuilder.and(
                    criteriaBuilder.equal(root.get("transactionDate"), lastDate),
                    criteriaBuilder.lessThan(root.get("id"), lastId)
                );
                predicates.add(criteriaBuilder.or(dateBefore, sameDateIdBefore));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
