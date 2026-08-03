package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.SupplierNoteRequest;
import com.smartwms.dto.response.SupplierNoteResponse;
import com.smartwms.service.SupplierNoteService;
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
 * REST controller for Supplier Note operations.
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/suppliers/{supplierId}/notes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Supplier Notes", description = "Note management for suppliers")
public class SupplierNoteController {

    private final SupplierNoteService noteService;

    @PostMapping
    @Operation(summary = "Create Supplier Note", description = "Creates a new note for a supplier.")
    public ResponseEntity<ApiResponse<SupplierNoteResponse>> createNote(
            @PathVariable Long supplierId,
            @Valid @RequestBody SupplierNoteRequest request) {
        log.info("POST /suppliers/{}/notes — {}", supplierId, request.getTitle());
        SupplierNoteResponse response = noteService.createNote(supplierId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note created successfully", response));
    }

    @PutMapping("/{noteId}")
    @Operation(summary = "Update Supplier Note", description = "Updates an existing note.")
    public ResponseEntity<ApiResponse<SupplierNoteResponse>> updateNote(
            @PathVariable Long supplierId,
            @PathVariable Long noteId,
            @Valid @RequestBody SupplierNoteRequest request) {
        log.info("PUT /suppliers/{}/notes/{}", supplierId, noteId);
        SupplierNoteResponse response = noteService.updateNote(supplierId, noteId, request);
        return ResponseEntity.ok(ApiResponse.success("Note updated successfully", response));
    }

    @DeleteMapping("/{noteId}")
    @Operation(summary = "Delete Supplier Note", description = "Soft-deletes a note.")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable Long supplierId,
            @PathVariable Long noteId) {
        log.info("DELETE /suppliers/{}/notes/{}", supplierId, noteId);
        noteService.deleteNote(supplierId, noteId);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully"));
    }

    @GetMapping("/{noteId}")
    @Operation(summary = "Get Note by ID", description = "Returns a specific note.")
    public ResponseEntity<ApiResponse<SupplierNoteResponse>> getNote(
            @PathVariable Long supplierId,
            @PathVariable Long noteId) {
        SupplierNoteResponse response = noteService.getNoteById(supplierId, noteId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get Supplier Notes", description = "Returns all notes for a supplier.")
    public ResponseEntity<ApiResponse<List<SupplierNoteResponse>>> getNotes(
            @PathVariable Long supplierId) {
        List<SupplierNoteResponse> notes = noteService.getNotesBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @GetMapping("/type/{noteType}")
    @Operation(summary = "Get Notes by Type", description = "Returns notes filtered by type.")
    public ResponseEntity<ApiResponse<List<SupplierNoteResponse>>> getNotesByType(
            @PathVariable Long supplierId,
            @PathVariable String noteType) {
        List<SupplierNoteResponse> notes = noteService.getNotesByType(supplierId, noteType);
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @PatchMapping("/{noteId}/pin")
    @Operation(summary = "Toggle Pin Note", description = "Toggles the pinned status of a note.")
    public ResponseEntity<ApiResponse<SupplierNoteResponse>> togglePin(
            @PathVariable Long supplierId,
            @PathVariable Long noteId) {
        SupplierNoteResponse response = noteService.togglePin(supplierId, noteId);
        return ResponseEntity.ok(ApiResponse.success("Note pin status updated", response));
    }
}
