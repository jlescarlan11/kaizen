package com.kaizen.backend.transaction.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.transaction.dto.BulkDeleteRequest;
import com.kaizen.backend.transaction.dto.TransactionRequest;
import com.kaizen.backend.transaction.dto.TransactionResponse;
import com.kaizen.backend.transaction.service.TransactionService;

@SpringBootTest
@AutoConfigureMockMvc
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void testGetTransactions() throws Exception {
        when(transactionService.getTransactions(anyString())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/transactions"))
            .andExpect(status().isOk())
            .andExpect(content().json("[]"));
    }

    @Test
    @WithMockUser
    public void testUpdateTransaction() throws Exception {
        TransactionRequest request = TransactionRequest.builder()
            .amount(new BigDecimal("100.00"))
            .type(TransactionType.EXPENSE)
            .transactionDate(LocalDateTime.now())
            .description("Update description")
            .build();

        TransactionResponse response = TransactionResponse.builder()
            .id(1L)
            .amount(new BigDecimal("100.00"))
            .type(TransactionType.EXPENSE)
            .transactionDate(LocalDateTime.now())
            .description("Update description")
            .build();

        when(transactionService.updateTransaction(anyString(), anyLong(), any())).thenReturn(response);

        mockMvc.perform(put("/api/transactions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.description").value("Update description"));
    }

    @Test
    @WithMockUser
    public void testDeleteTransaction() throws Exception {
        mockMvc.perform(delete("/api/transactions/1"))
            .andExpect(status().isNoContent());

        verify(transactionService, times(1)).deleteTransaction(anyString(), eq(1L));
    }

    @Test
    @WithMockUser
    public void testBulkDeleteTransactions() throws Exception {
        BulkDeleteRequest request = new BulkDeleteRequest(Collections.singletonList(1L));

        mockMvc.perform(post("/api/transactions/bulk-delete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(transactionService, times(1)).bulkDeleteTransactions(anyString(), anyList());
    }
}
