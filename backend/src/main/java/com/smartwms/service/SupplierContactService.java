package com.smartwms.service;

import com.smartwms.dto.request.SupplierContactRequest;
import com.smartwms.dto.response.SupplierContactResponse;

import java.util.List;

/**
 * Service contract for Supplier Contact operations.
 */
public interface SupplierContactService {

    SupplierContactResponse createContact(Long supplierId, SupplierContactRequest request);

    SupplierContactResponse updateContact(Long supplierId, Long contactId, SupplierContactRequest request);

    void deleteContact(Long supplierId, Long contactId);

    SupplierContactResponse getContactById(Long supplierId, Long contactId);

    List<SupplierContactResponse> getContactsBySupplier(Long supplierId);

    SupplierContactResponse setPrimaryContact(Long supplierId, Long contactId);
}
