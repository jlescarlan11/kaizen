package com.kaizen.backend.budget.controller;

import com.kaizen.backend.budget.dto.BudgetBatchRequest;
import com.kaizen.backend.budget.dto.BudgetCountResponse;
import com.kaizen.backend.budget.dto.BudgetCreateRequest;
import com.kaizen.backend.budget.dto.BudgetResponse;
import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.service.BudgetService;
import com.kaizen.backend.budget.validation.BudgetValidationService;
import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.common.dto.ValidationErrorResponse;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Budget", description = "Budget management.")
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetValidationService budgetValidationService;

    public BudgetController(BudgetService budgetService,
        BudgetValidationService budgetValidationService) {
        this.budgetService = budgetService;
        this.budgetValidationService = budgetValidationService;
    }

    @Operation(
    summary = "Save batch budget allocations",
    description = "Saves all provided budgets atomically for the authenticated user."
  )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "All budgets saved successfully.",
            content = @Content(
                array = @ArraySchema(schema = @Schema(implementation = BudgetResponse.class))
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Validation failed for one or more budgets.",
            content = @Content(schema = @Schema(implementation = ValidationErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User profile not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping("/batch")
    @ResponseStatus(HttpStatus.CREATED)
    public List<BudgetResponse> saveSmartBudgets(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody BudgetBatchRequest request
    ) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
    }
        budgetValidationService.validateSmartBudgets(userDetails.getUsername(), request);

        return budgetService.saveSmartBudgets(userDetails.getUsername(), request).stream()
            .map(this::map)
            .collect(Collectors.toList());
  }

  @Operation(
      summary = "Create a budget",
      description = "Saves a single budget for the authenticated user.",
      operationId = "createBudget"
  )
  @ApiResponses({
      @ApiResponse(
          responseCode = "201",
          description = "Budget saved successfully.",
          content = @Content(schema = @Schema(implementation = BudgetResponse.class))
      ),
      @ApiResponse(
          responseCode = "400",
          description = "Validation failed for the budget.",
          content = @Content(schema = @Schema(implementation = ValidationErrorResponse.class))
      ),
      @ApiResponse(
          responseCode = "401",
          description = "User must be authenticated.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "User profile not found.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      )
  })
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public BudgetResponse createBudget(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody BudgetCreateRequest request
  ) {
    if (userDetails == null) {
      throw new ProfileNotFoundException();
    }

    budgetValidationService.validateSingleBudget(userDetails.getUsername(), request);

    return map(budgetService.saveBudget(userDetails.getUsername(), request));
  }

  @Operation(
      summary = "Get user budgets",
      description = "Returns all budgets saved by the authenticated user."
  )
  @ApiResponses({
      @ApiResponse(
          responseCode = "200",
          description = "Budgets returned successfully.",
          content = @Content(
              array = @ArraySchema(schema = @Schema(implementation = BudgetResponse.class))
          )
      ),
      @ApiResponse(
          responseCode = "401",
          description = "User must be authenticated.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "User profile not found.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      )
  })
  @GetMapping
  public List<BudgetResponse> getBudgets(@AuthenticationPrincipal UserDetails userDetails) {
    if (userDetails == null) {
      throw new ProfileNotFoundException();
    }

    return budgetService.getBudgetsWithProjections(userDetails.getUsername());
  }

  @Operation(
      summary = "Count user budgets",
      description = "Returns the total number of budgets saved by the authenticated user."
  )
  @ApiResponses({
      @ApiResponse(
          responseCode = "200",
          description = "Budget count returned successfully."
      ),
      @ApiResponse(
          responseCode = "401",
          description = "User must be authenticated.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "User profile not found.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      )
  })
  @GetMapping("/count")
  public BudgetCountResponse countBudgets(@AuthenticationPrincipal UserDetails userDetails) {
    if (userDetails == null) {
      throw new ProfileNotFoundException();
    }

    return new BudgetCountResponse(budgetService.countBudgetsForUser(userDetails.getUsername()));
  }

  @Operation(
      summary = "Get budget allocation summary",
      description = "Returns the authenticated user's actual balance, total allocated budgets, total spent, unallocated amount (balance minus the sum of max(0, amount - expense) per budget; may be negative when post-allocation drift occurs), allocation percentage, and budget count.",
      operationId = "getBudgetSummary"
  )
  @ApiResponses({
      @ApiResponse(
          responseCode = "200",
          description = "Budget summary returned successfully.",
          content = @Content(schema = @Schema(implementation = BudgetSummaryResponse.class))
      ),
      @ApiResponse(
          responseCode = "401",
          description = "User must be authenticated.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "User profile not found.",
          content = @Content(schema = @Schema(implementation = ErrorResponse.class))
      )
  })
  @GetMapping("/summary")
  public BudgetSummaryResponse getBudgetSummary(@AuthenticationPrincipal UserDetails userDetails) {
    if (userDetails == null) {
      throw new ProfileNotFoundException();
    }

    return budgetService.getBudgetSummaryForUser(userDetails.getUsername());
  }

  private BudgetResponse map(Budget budget) {
    return new BudgetResponse(
            budget.getId(),
            budget.getUser().getId(),
            budget.getCategory().getId(),
            budget.getCategory().getName(),
            budget.getAmount(),
            budget.getExpense(),
            null, // burnRate
            null, // dailyAllowance
            null, // projectedTotal
            null, // daysElapsed
            null, // daysLeft
            budget.getPeriod(),
            budget.getCreatedAt(),
            budget.getUpdatedAt()
        );
    }
}
