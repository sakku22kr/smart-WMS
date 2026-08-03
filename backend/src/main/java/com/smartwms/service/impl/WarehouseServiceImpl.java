package com.smartwms.service.impl;

import com.smartwms.constants.ActivityType;
import com.smartwms.constants.AppConstants;
import com.smartwms.constants.WarehouseStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.WarehouseRequest;
import com.smartwms.dto.response.WarehouseResponse;
import com.smartwms.dto.response.WarehouseStatsResponse;
import com.smartwms.entity.Warehouse;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.DuplicateResourceException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.WarehouseMapper;
import com.smartwms.repository.ProductRepository;
import com.smartwms.repository.WarehouseRepository;
import com.smartwms.service.ActivityLogService;
import com.smartwms.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;
    private final ProductRepository productRepository;
    private final ActivityLogService activityLogService;

    // ─── Create ───────────────────────────────────────────────

    @Override
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        String code = request.getCode().trim().toUpperCase();
        String name = request.getName().trim();

        if (warehouseRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Warehouse", "code", request.getCode());
        }
        if (warehouseRepository.existsByName(name)) {
            throw new DuplicateResourceException("Warehouse", "name", request.getName());
        }

        validateUtilization(request.getCapacity(), request.getCurrentUtilization());

        Warehouse warehouse = warehouseMapper.toEntity(request);
        warehouse.setCode(code);
        warehouse.setName(name);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            warehouse.setEmail(request.getEmail().trim().toLowerCase());
        }

        Warehouse saved = warehouseRepository.save(warehouse);
        activityLogService.log(
            ActivityType.WAREHOUSE_CREATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Warehouse created: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Warehouse created: {} (id={})", saved.getCode(), saved.getId());
        return warehouseMapper.toResponse(saved);
    }

    // ─── Read ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouseById(Long id) {
        return warehouseMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouseByCode(String code) {
        Warehouse warehouse = warehouseRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "code", code));
        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WarehouseResponse> getAllWarehouses(
            int page, int size, String sort, String direction,
            String search, String status, Double minCapacity, Double maxCapacity) {

        Sort sortObj = direction.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sort).ascending()
                : Sort.by(sort).descending();

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sortObj);

        Specification<Warehouse> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), keyword),
                    cb.like(cb.lower(root.get("code")), keyword),
                    cb.like(cb.lower(root.get("location")), keyword),
                    cb.like(cb.lower(root.get("address")), keyword),
                    cb.like(cb.lower(root.get("manager")), keyword),
                    cb.like(cb.lower(root.get("email")), keyword)
                ));
            }

            if (status != null && !status.isBlank()) {
                try {
                    WarehouseStatus warehouseStatus = WarehouseStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), warehouseStatus));
                } catch (IllegalArgumentException e) {
                    predicates.add(cb.equal(root.get("status"), null));
                }
            }

            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (maxCapacity != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("capacity"), maxCapacity));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Warehouse> warehousePage = warehouseRepository.findAll(spec, pageable);
        Page<WarehouseResponse> responsePage = warehousePage.map(warehouseMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    // ─── Update ───────────────────────────────────────────────

    @Override
    public WarehouseResponse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = findById(id);

        String code = request.getCode().trim().toUpperCase();
        String name = request.getName().trim();

        if (warehouseRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("Warehouse", "code", request.getCode());
        }
        if (warehouseRepository.existsByNameAndIdNot(name, id)) {
            throw new DuplicateResourceException("Warehouse", "name", request.getName());
        }

        validateUtilization(request.getCapacity(), request.getCurrentUtilization());

        warehouseMapper.updateEntityFromRequest(request, warehouse);
        warehouse.setCode(code);
        warehouse.setName(name);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            warehouse.setEmail(request.getEmail().trim().toLowerCase());
        } else {
            warehouse.setEmail(null);
        }

        Warehouse saved = warehouseRepository.save(warehouse);
        activityLogService.log(
            ActivityType.WAREHOUSE_UPDATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Warehouse updated: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Warehouse updated: {} (id={})", saved.getCode(), saved.getId());
        return warehouseMapper.toResponse(saved);
    }

    // ─── Delete ───────────────────────────────────────────────

    @Override
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = findById(id);

        long productCount = productRepository.countByWarehouseId(id);
        if (productCount > 0) {
            throw new BusinessException(
                ErrorCode.WAREHOUSE_HAS_PRODUCTS,
                "Cannot delete warehouse '" + warehouse.getName()
                    + "' — it still contains " + productCount + " product(s)."
            );
        }

        String code = warehouse.getCode();
        String name = warehouse.getName();
        warehouse.softDelete("system");
        warehouseRepository.save(warehouse);
        activityLogService.log(
            ActivityType.WAREHOUSE_DELETED, null, AppConstants.SYSTEM_USER, "System",
            id, name,
            "Warehouse soft-deleted: " + code + " - " + name,
            null, null
        );
        log.info("Warehouse soft-deleted: {} (id={})", code, id);
    }

    @Override
    public void restoreWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        if (!warehouse.isDeleted()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Warehouse is not deleted");
        }
        warehouse.restore();
        Warehouse saved = warehouseRepository.save(warehouse);
        activityLogService.log(
            ActivityType.WAREHOUSE_RESTORED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Warehouse restored: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Warehouse restored: {} (id={})", saved.getCode(), id);
    }

    // ─── Status Management ────────────────────────────────────

    @Override
    public WarehouseResponse activateWarehouse(Long id) {
        Warehouse warehouse = findById(id);
        if (warehouse.getStatus() == WarehouseStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Warehouse is already active");
        }
        warehouse.setStatus(WarehouseStatus.ACTIVE);
        Warehouse saved = warehouseRepository.save(warehouse);
        activityLogService.log(
            ActivityType.WAREHOUSE_ACTIVATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Warehouse activated: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Warehouse activated: {} (id={})", saved.getCode(), id);
        return warehouseMapper.toResponse(saved);
    }

    @Override
    public WarehouseResponse deactivateWarehouse(Long id) {
        Warehouse warehouse = findById(id);
        if (warehouse.getStatus() == WarehouseStatus.INACTIVE) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Warehouse is already inactive");
        }
        warehouse.setStatus(WarehouseStatus.INACTIVE);
        Warehouse saved = warehouseRepository.save(warehouse);
        activityLogService.log(
            ActivityType.WAREHOUSE_DEACTIVATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Warehouse deactivated: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Warehouse deactivated: {} (id={})", saved.getCode(), id);
        return warehouseMapper.toResponse(saved);
    }

    @Override
    public WarehouseResponse setMaintenanceWarehouse(Long id) {
        Warehouse warehouse = findById(id);
        if (warehouse.getStatus() == WarehouseStatus.UNDER_MAINTENANCE) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Warehouse is already under maintenance");
        }
        warehouse.setStatus(WarehouseStatus.UNDER_MAINTENANCE);
        Warehouse saved = warehouseRepository.save(warehouse);
        activityLogService.log(
            ActivityType.WAREHOUSE_MAINTENANCE, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Warehouse set to maintenance: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Warehouse set to maintenance: {} (id={})", saved.getCode(), id);
        return warehouseMapper.toResponse(saved);
    }

    // ─── Private Helpers ──────────────────────────────────────

    private Warehouse findById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
    }

    private void validateUtilization(Double capacity, Double utilization) {
        if (capacity != null && utilization != null && utilization > capacity) {
            throw new BusinessException(
                ErrorCode.VALIDATION_FAILED,
                "Current utilization (" + utilization + ") cannot exceed capacity (" + capacity + ")"
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCodeAvailable(String code, Long excludeId) {
        if (code == null || code.isBlank()) return false;
        String normalized = code.trim().toUpperCase();
        if (excludeId != null) {
            return !warehouseRepository.existsByCodeAndIdNot(normalized, excludeId);
        }
        return !warehouseRepository.existsByCode(normalized);
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseStatsResponse getWarehouseStats() {
        long totalWarehouses = warehouseRepository.count();
        long activeCount = warehouseRepository.countByStatus(WarehouseStatus.ACTIVE);
        long inactiveCount = warehouseRepository.countByStatus(WarehouseStatus.INACTIVE);
        long maintenanceCount = warehouseRepository.countByStatus(WarehouseStatus.UNDER_MAINTENANCE);

        Double totalCapacity = warehouseRepository.sumCapacity();
        Double totalUtilized = warehouseRepository.sumCurrentUtilization();
        Double availableCapacity = totalCapacity - totalUtilized;

        long warehousesNearCapacity = warehouseRepository.countNearCapacity();
        long warehousesFull = warehouseRepository.countFull();

        Double avgUtilization = 0.0;
        if (totalCapacity != null && totalCapacity > 0) {
            avgUtilization = Math.round((totalUtilized / totalCapacity) * 1000.0) / 10.0;
        }

        return WarehouseStatsResponse.builder()
                .totalWarehouses(totalWarehouses)
                .activeCount(activeCount)
                .inactiveCount(inactiveCount)
                .maintenanceCount(maintenanceCount)
                .totalCapacity(totalCapacity)
                .totalUtilized(totalUtilized)
                .availableCapacity(availableCapacity)
                .avgUtilization(avgUtilization)
                .warehousesNearCapacity(warehousesNearCapacity)
                .warehousesFull(warehousesFull)
                .build();
    }
}
