package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.SupplierNoteRequest;
import com.smartwms.dto.response.SupplierNoteResponse;

import java.util.List;

/**
 * Service contract for Supplier Note operations.
 */
public interface SupplierNoteService {

    SupplierNoteResponse createNote(Long supplierId, SupplierNoteRequest request);

    SupplierNoteResponse updateNote(Long supplierId, Long noteId, SupplierNoteRequest request);

    void deleteNote(Long supplierId, Long noteId);

    SupplierNoteResponse getNoteById(Long supplierId, Long noteId);

    List<SupplierNoteResponse> getNotesBySupplier(Long supplierId);

    PageResponse<SupplierNoteResponse> getNotesBySupplier(Long supplierId, int page, int size);

    List<SupplierNoteResponse> getNotesByType(Long supplierId, String noteType);

    SupplierNoteResponse togglePin(Long supplierId, Long noteId);
}
