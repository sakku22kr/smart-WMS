package com.smartwms.repository;

import com.smartwms.constants.WarehouseStatus;
import com.smartwms.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long>, JpaSpecificationExecutor<Warehouse> {

    Optional<Warehouse> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT COALESCE(SUM(w.capacity), 0.0) FROM Warehouse w")
    Double sumCapacity();

    @Query("SELECT COALESCE(SUM(w.currentUtilization), 0.0) FROM Warehouse w")
    Double sumCurrentUtilization();

    @Query("SELECT COUNT(w) FROM Warehouse w WHERE w.status = :status")
    long countByStatus(WarehouseStatus status);

    @Query("SELECT COUNT(w) FROM Warehouse w WHERE w.capacity > 0 AND (w.currentUtilization / w.capacity) >= 0.9")
    long countNearCapacity();

    @Query("SELECT COUNT(w) FROM Warehouse w WHERE w.capacity > 0 AND w.currentUtilization >= w.capacity")
    long countFull();
}
