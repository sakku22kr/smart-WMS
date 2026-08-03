package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.SupplierDocumentResponse;
import com.smartwms.service.SupplierDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller for Supplier Document operations.
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/suppliers/{supplierId}/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Supplier Documents", description = "Document management for suppliers")
public class SupplierDocumentController {

    private final SupplierDocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Supplier Document", description = "Upload a document for a supplier.")
    public ResponseEntity<ApiResponse<SupplierDocumentResponse>> uploadDocument(
            @PathVariable Long supplierId,
            @RequestParam("documentName") String documentName,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "expiryDate", required = false) String expiryDate,
            @RequestParam("file") MultipartFile file) {
        log.info("POST /suppliers/{}/documents — {}", supplierId, documentName);
        SupplierDocumentResponse response = documentService.uploadDocument(supplierId, documentName, documentType, description, expiryDate, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get Supplier Documents", description = "Returns all documents for a supplier.")
    public ResponseEntity<ApiResponse<List<SupplierDocumentResponse>>> getDocuments(
            @PathVariable Long supplierId) {
        List<SupplierDocumentResponse> documents = documentService.getDocumentsBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Get Document by ID", description = "Returns a specific document.")
    public ResponseEntity<ApiResponse<SupplierDocumentResponse>> getDocument(
            @PathVariable Long supplierId,
            @PathVariable Long documentId) {
        SupplierDocumentResponse document = documentService.getDocumentById(supplierId, documentId);
        return ResponseEntity.ok(ApiResponse.success(document));
    }

    @GetMapping("/{documentId}/download")
    @Operation(summary = "Download Document", description = "Downloads the document file.")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long supplierId,
            @PathVariable Long documentId) {
        SupplierDocumentResponse docInfo = documentService.getDocumentById(supplierId, documentId);
        byte[] fileContent = documentService.downloadDocument(supplierId, documentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(docInfo.getMimeType()));
        headers.setContentDispositionFormData("attachment", docInfo.getFileName());
        headers.setContentLength(fileContent.length);

        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Delete Document", description = "Soft-deletes a supplier document.")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long supplierId,
            @PathVariable Long documentId) {
        log.info("DELETE /suppliers/{}/documents/{}", supplierId, documentId);
        documentService.deleteDocument(supplierId, documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully"));
    }
}
