package com.smartwms.service.impl;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.InventoryTransactionType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.HistoryRequest;
import com.smartwms.dto.response.HistorySummaryResponse;
import com.smartwms.dto.response.InventoryResponse;
import com.smartwms.entity.InventoryTransaction;
import com.smartwms.mapper.InventoryMapper;
import com.smartwms.repository.InventoryTransactionRepository;
import com.smartwms.service.InventoryHistoryService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryHistoryServiceImpl implements InventoryHistoryService {

    private final InventoryTransactionRepository transactionRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public PageResponse<InventoryResponse> getHistory(HistoryRequest request) {
        Sort sortObj = "asc".equalsIgnoreCase(request.getDirection())
                ? Sort.by(request.getSort()).ascending()
                : Sort.by(request.getSort()).descending();

        Pageable pageable = PageRequest.of(
                request.getPage(),
                Math.min(request.getSize(), AppConstants.MAX_PAGE_SIZE),
                sortObj);

        Specification<InventoryTransaction> spec = buildSpec(request);
        Page<InventoryTransaction> txnPage = transactionRepository.findAll(spec, pageable);
        Page<InventoryResponse> responsePage = txnPage.map(inventoryMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    public HistorySummaryResponse getHistorySummary(HistoryRequest request) {
        // Use the same spec to count matching transactions
        Specification<InventoryTransaction> spec = buildSpec(request);
        List<InventoryTransaction> allTxns = transactionRepository.findAll(spec);

        long total = allTxns.size();
        long stockIn = 0;
        long stockOut = 0;
        long adjustments = 0;
        BigDecimal totalValue = BigDecimal.ZERO;
        Set<Long> uniqueProducts = new HashSet<>();
        Set<Long> uniqueWarehouses = new HashSet<>();
        Map<String, Long> byType = new LinkedHashMap<>();

        for (InventoryTransaction txn : allTxns) {
            uniqueProducts.add(txn.getProduct().getId());
            uniqueWarehouses.add(txn.getWarehouse().getId());

            if (txn.getTotalValue() != null) {
                totalValue = totalValue.add(txn.getTotalValue());
            }

            String typeName = txn.getTransactionType().name();
            byType.merge(typeName, 1L, Long::sum);

            switch (txn.getTransactionType()) {
                case STOCK_IN -> stockIn += txn.getQuantity();
                case STOCK_OUT -> stockOut += txn.getQuantity();
                case ADJUSTMENT -> adjustments++;
                default -> {}
            }
        }

        return HistorySummaryResponse.builder()
                .totalTransactions(total)
                .totalStockIn(stockIn)
                .totalStockOut(stockOut)
                .totalAdjustments(adjustments)
                .totalValue(totalValue)
                .transactionsByType(byType)
                .uniqueProducts(uniqueProducts.size())
                .uniqueWarehouses(uniqueWarehouses.size())
                .build();
    }

    private Specification<InventoryTransaction> buildSpec(HistoryRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), request.getDateFrom()));
            }
            if (request.getDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), request.getDateTo()));
            }
            if (request.getPerformedBy() != null && !request.getPerformedBy().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("performedBy")),
                        request.getPerformedBy().trim().toLowerCase()));
            }
            if (request.getTransactionType() != null && !request.getTransactionType().isBlank()) {
                try {
                    InventoryTransactionType type = InventoryTransactionType.valueOf(
                            request.getTransactionType().trim().toUpperCase());
                    predicates.add(cb.equal(root.get("transactionType"), type));
                } catch (IllegalArgumentException e) {
                    predicates.add(cb.equal(root.get("transactionType"), null));
                }
            }
            if (request.getProductId() != null) {
                predicates.add(cb.equal(root.get("product").get("id"), request.getProductId()));
            }
            if (request.getWarehouseId() != null) {
                predicates.add(cb.equal(root.get("warehouse").get("id"), request.getWarehouseId()));
            }
            if (request.getSearch() != null && !request.getSearch().isBlank()) {
                String keyword = "%" + request.getSearch().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("referenceNumber")), keyword),
                        cb.like(cb.lower(root.get("reason")), keyword),
                        cb.like(cb.lower(root.get("batchNumber")), keyword)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
