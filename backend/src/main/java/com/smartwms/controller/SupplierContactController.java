package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.request.SupplierContactRequest;
import com.smartwms.dto.response.SupplierContactResponse;
import com.smartwms.service.SupplierContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Supplier Contact operations.
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/suppliers/{supplierId}/contacts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Supplier Contacts", description = "Contact management for suppliers")
public class SupplierContactController {

    private final SupplierContactService contactService;

    @PostMapping
    @Operation(summary = "Create Supplier Contact", description = "Creates a new contact for a supplier.")
    public ResponseEntity<ApiResponse<SupplierContactResponse>> createContact(
            @PathVariable Long supplierId,
            @Valid @RequestBody SupplierContactRequest request) {
        log.info("POST /suppliers/{}/contacts — {}", supplierId, request.getName());
        SupplierContactResponse response = contactService.createContact(supplierId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contact created successfully", response));
    }

    @PutMapping("/{contactId}")
    @Operation(summary = "Update Supplier Contact", description = "Updates an existing contact.")
    public ResponseEntity<ApiResponse<SupplierContactResponse>> updateContact(
            @PathVariable Long supplierId,
            @PathVariable Long contactId,
            @Valid @RequestBody SupplierContactRequest request) {
        log.info("PUT /suppliers/{}/contacts/{}", supplierId, contactId);
        SupplierContactResponse response = contactService.updateContact(supplierId, contactId, request);
        return ResponseEntity.ok(ApiResponse.success("Contact updated successfully", response));
    }

    @DeleteMapping("/{contactId}")
    @Operation(summary = "Delete Supplier Contact", description = "Soft-deletes a contact.")
    public ResponseEntity<ApiResponse<Void>> deleteContact(
            @PathVariable Long supplierId,
            @PathVariable Long contactId) {
        log.info("DELETE /suppliers/{}/contacts/{}", supplierId, contactId);
        contactService.deleteContact(supplierId, contactId);
        return ResponseEntity.ok(ApiResponse.success("Contact deleted successfully"));
    }

    @GetMapping("/{contactId}")
    @Operation(summary = "Get Contact by ID", description = "Returns a specific contact.")
    public ResponseEntity<ApiResponse<SupplierContactResponse>> getContact(
            @PathVariable Long supplierId,
            @PathVariable Long contactId) {
        SupplierContactResponse response = contactService.getContactById(supplierId, contactId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get Supplier Contacts", description = "Returns all contacts for a supplier.")
    public ResponseEntity<ApiResponse<List<SupplierContactResponse>>> getContacts(
            @PathVariable Long supplierId) {
        List<SupplierContactResponse> contacts = contactService.getContactsBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(contacts));
    }

    @PatchMapping("/{contactId}/primary")
    @Operation(summary = "Set Primary Contact", description = "Sets a contact as the primary contact.")
    public ResponseEntity<ApiResponse<SupplierContactResponse>> setPrimaryContact(
            @PathVariable Long supplierId,
            @PathVariable Long contactId) {
        SupplierContactResponse response = contactService.setPrimaryContact(supplierId, contactId);
        return ResponseEntity.ok(ApiResponse.success("Primary contact updated", response));
    }
}
