package com.kaizen.backend.category.repository;

import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.common.repository.BaseRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends BaseRepository<Category> {

    @Query("SELECT c FROM Category c WHERE c.global = true OR (:userId IS NOT NULL AND c.user IS NOT NULL AND c.user.id = :userId)")
    List<Category> findAllVisibleToUser(@Param("userId") Long userId);

    List<Category> findByGlobalTrue();

    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}
