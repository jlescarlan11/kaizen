package com.kaizen.backend.category.repository;

import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.common.repository.BaseRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CategoryRepository extends BaseRepository<Category, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Category c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Category c WHERE c.global = true OR (:userId IS NOT NULL AND c.user IS NOT NULL AND c.user.id = :userId)")
    List<Category> findAllVisibleToUser(@Param("userId") Long userId);

    List<Category> findByGlobalTrue();

    @Query("""
        SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
        FROM Category c
        WHERE LOWER(c.name) = LOWER(:name)
          AND (c.global = true OR (c.user IS NOT NULL AND c.user.id = :userId))
        """)
    boolean existsVisibleToUserByNameIgnoreCase(@Param("userId") Long userId, @Param("name") String name);

    @Query("""
        SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
        FROM Category c
        WHERE c.id <> :categoryId
          AND LOWER(c.name) = LOWER(:name)
          AND (c.global = true OR (c.user IS NOT NULL AND c.user.id = :userId))
        """)
    boolean existsOtherVisibleToUserByNameIgnoreCase(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("name") String name
    );

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);

    @Query("SELECT c FROM Category c WHERE c.id IN :ids AND (c.global = true OR (c.user IS NOT NULL AND c.user.id = :userId))")
    List<Category> findAccessibleByIds(@Param("ids") List<Long> ids, @Param("userId") Long userId);
}
