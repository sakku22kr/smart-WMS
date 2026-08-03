package com.smartwms.entity;

import com.smartwms.constants.WarehouseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted = false")
public class Warehouse extends SoftDeleteEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 100)
    private String location;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String manager;

    @Column(length = 20)
    private String contactNumber;

    @Column(length = 100)
    private String email;

    @Column(nullable = false)
    private Double capacity = 0.0;

    @Column(nullable = false)
    private Double currentUtilization = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WarehouseStatus status = WarehouseStatus.ACTIVE;

    @Column(length = 500)
    private String description;
}
