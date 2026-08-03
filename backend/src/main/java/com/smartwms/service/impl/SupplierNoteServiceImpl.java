package com.smartwms.service.impl;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.SupplierNoteRequest;
import com.smartwms.dto.response.SupplierNoteResponse;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.SupplierNote;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.repository.SupplierNoteRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.service.SupplierNoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link SupplierNoteService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SupplierNoteServiceImpl implements SupplierNoteService {

    private final SupplierNoteRepository noteRepository;
    private final SupplierRepository supplierRepository;

    @Override
    public SupplierNoteResponse createNote(Long supplierId, SupplierNoteRequest request) {
        Supplier supplier = findSupplier(supplierId);

        SupplierNote note = new SupplierNote();
        note.setSupplier(supplier);
        note.setNoteType(request.getNoteType());
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setPinned(request.isPinned());

        SupplierNote saved = noteRepository.save(note);
        log.info("Note created for supplier {}: {}", supplierId, request.getTitle());
        return toResponse(saved);
    }

    @Override
    public SupplierNoteResponse updateNote(Long supplierId, Long noteId, SupplierNoteRequest request) {
        SupplierNote note = findNote(supplierId, noteId);

        note.setNoteType(request.getNoteType());
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setPinned(request.isPinned());

        SupplierNote saved = noteRepository.save(note);
        log.info("Note updated for supplier {}: {}", supplierId, request.getTitle());
        return toResponse(saved);
    }

    @Override
    public void deleteNote(Long supplierId, Long noteId) {
        SupplierNote note = findNote(supplierId, noteId);
        note.softDelete("system");
        noteRepository.save(note);
        log.info("Note deleted for supplier {}: {}", supplierId, note.getTitle());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierNoteResponse getNoteById(Long supplierId, Long noteId) {
        SupplierNote note = findNote(supplierId, noteId);
        return toResponse(note);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierNoteResponse> getNotesBySupplier(Long supplierId) {
        findSupplier(supplierId);
        return noteRepository.findBySupplierIdOrderByPinnedDescCreatedAtDesc(supplierId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierNoteResponse> getNotesBySupplier(Long supplierId, int page, int size) {
        findSupplier(supplierId);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<SupplierNote> notePage = noteRepository.findBySupplierId(supplierId, pageable);
        return PageResponse.from(notePage.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierNoteResponse> getNotesByType(Long supplierId, String noteType) {
        findSupplier(supplierId);
        SupplierNote.SupplierNoteType type = SupplierNote.SupplierNoteType.valueOf(noteType.toUpperCase());
        return noteRepository.findBySupplierIdAndNoteType(supplierId, type)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SupplierNoteResponse togglePin(Long supplierId, Long noteId) {
        SupplierNote note = findNote(supplierId, noteId);
        note.setPinned(!note.isPinned());
        SupplierNote saved = noteRepository.save(note);
        log.info("Note {} for supplier {}: pinned={}", noteId, supplierId, saved.isPinned());
        return toResponse(saved);
    }

    private Supplier findSupplier(Long supplierId) {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
    }

    private SupplierNote findNote(Long supplierId, Long noteId) {
        return noteRepository.findByIdAndSupplierId(noteId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplierNote", "id", noteId));
    }

    private SupplierNoteResponse toResponse(SupplierNote note) {
        return SupplierNoteResponse.builder()
                .id(note.getId())
                .supplierId(note.getSupplier().getId())
                .noteType(note.getNoteType())
                .title(note.getTitle())
                .content(note.getContent())
                .pinned(note.isPinned())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .createdBy(note.getCreatedBy())
                .build();
    }
}
