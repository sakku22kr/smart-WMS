package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.SupplierDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service contract for Supplier Document operations.
 */
public interface SupplierDocumentService {

    SupplierDocumentResponse uploadDocument(Long supplierId, String documentName, String documentType,
                                            String description, String expiryDate, MultipartFile file);

    List<SupplierDocumentResponse> getDocumentsBySupplier(Long supplierId);

    PageResponse<SupplierDocumentResponse> getDocumentsBySupplier(Long supplierId, int page, int size);

    SupplierDocumentResponse getDocumentById(Long supplierId, Long documentId);

    byte[] downloadDocument(Long supplierId, Long documentId);

    void deleteDocument(Long supplierId, Long documentId);
}
