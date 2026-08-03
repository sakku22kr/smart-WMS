package com.smartwms.mapper;

import com.smartwms.dto.request.PurchaseOrderRequest;
import com.smartwms.entity.PurchaseOrder;
import org.mapstruct.*;

/**
 * Mapper for updating PurchaseOrder entity from request.
 * Separate from the main mapper to handle updates cleanly.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PurchaseOrderUpdateMapper {

    @Mapping(target = "id",               ignore = true)
    @Mapping(target = "version",          ignore = true)
    @Mapping(target = "createdAt",        ignore = true)
    @Mapping(target = "updatedAt",        ignore = true)
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "updatedBy",        ignore = true)
    @Mapping(target = "deleted",          ignore = true)
    @Mapping(target = "deletedAt",        ignore = true)
    @Mapping(target = "deletedBy",        ignore = true)
    @Mapping(target = "orderNumber",      ignore = true)
    @Mapping(target = "supplier",         ignore = true)
    @Mapping(target = "warehouse",        ignore = true)
    @Mapping(target = "status",           ignore = true)
    @Mapping(target = "items",            ignore = true)
    @Mapping(target = "subtotal",         ignore = true)
    @Mapping(target = "totalAmount",      ignore = true)
    @Mapping(target = "approvedBy",       ignore = true)
    @Mapping(target = "approvedAt",       ignore = true)
    @Mapping(target = "receivedBy",       ignore = true)
    @Mapping(target = "receivedAt",       ignore = true)
    void updateEntityFromRequest(PurchaseOrderRequest request, @MappingTarget PurchaseOrder purchaseOrder);
}
