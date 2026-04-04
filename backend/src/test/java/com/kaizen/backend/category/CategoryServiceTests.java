package com.kaizen.backend.category;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.category.service.CategoryService;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import jakarta.persistence.EntityManager;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class CategoryServiceTests {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private EntityManager entityManager;

    private CategoryService categoryService;

    private UserAccount user;
    private Category sourceCategory;
    private Category targetCategory;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryService(categoryRepository, userAccountRepository, transactionRepository, entityManager);
        user = mock(UserAccount.class);
        when(user.getId()).thenReturn(1L);

        sourceCategory = mock(Category.class);
        when(sourceCategory.getId()).thenReturn(10L);

        targetCategory = mock(Category.class);
        when(targetCategory.getId()).thenReturn(20L);
    }

    @Test
    void mergeCategories_Success() {
        String email = "test@example.com";
        when(userAccountRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(categoryRepository.findAccessibleByIds(any(), any())).thenReturn(List.of(sourceCategory, targetCategory));
        when(transactionRepository.existsByCategoryId(10L)).thenReturn(false);

        categoryService.mergeCategories(email, 10L, 20L);

        verify(transactionRepository).updateCategoryId(10L, 20L);
        verify(categoryRepository).delete(Objects.requireNonNull(sourceCategory));
        verify(transactionRepository).existsByCategoryId(10L);
    }

    @Test
    void mergeCategories_SameId_ThrowsException() {
        String email = "test@example.com";
        assertThrows(IllegalArgumentException.class, () -> categoryService.mergeCategories(email, 10L, 10L));
    }

    @Test
    void mergeCategories_ReferentialIntegrityViolation_ThrowsException() {
        String email = "test@example.com";
        when(userAccountRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(categoryRepository.findAccessibleByIds(any(), any())).thenReturn(List.of(sourceCategory, targetCategory));
        when(transactionRepository.existsByCategoryId(10L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> categoryService.mergeCategories(email, 10L, 20L));
    }
}
