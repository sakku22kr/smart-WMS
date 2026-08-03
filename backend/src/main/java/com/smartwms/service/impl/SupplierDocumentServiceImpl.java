package com.smartwms.service.impl;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.SupplierDocumentResponse;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.SupplierDocument;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.repository.SupplierDocumentRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.service.SupplierDocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of {@link SupplierDocumentService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SupplierDocumentServiceImpl implements SupplierDocumentService {

    private final SupplierDocumentRepository documentRepository;
    private final SupplierRepository supplierRepository;

    private static final String UPLOAD_DIR = "uploads/supplier-documents/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Override
    public SupplierDocumentResponse uploadDocument(Long supplierId, String documentName, String documentType,
                                                    String description, String expiryDate, MultipartFile file) {
        Supplier supplier = findSupplier(supplierId);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        try {
            String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(UPLOAD_DIR + supplierId);
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath);

            SupplierDocument document = new SupplierDocument();
            document.setSupplier(supplier);
            document.setDocumentName(documentName);
            document.setDocumentType(documentType);
            document.setFileName(file.getOriginalFilename());
            document.setFilePath(filePath.toString());
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());
            document.setDescription(description);

            if (expiryDate != null && !expiryDate.isBlank()) {
                document.setExpiryDate(LocalDate.parse(expiryDate));
            }

            SupplierDocument saved = documentRepository.save(document);
            log.info("Document uploaded for supplier {}: {} ({})", supplierId, documentName, documentType);
            return toResponse(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDocumentResponse> getDocumentsBySupplier(Long supplierId) {
        findSupplier(supplierId);
        return documentRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierDocumentResponse> getDocumentsBySupplier(Long supplierId, int page, int size) {
        findSupplier(supplierId);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by("createdAt").descending());
        Page<SupplierDocument> docPage = documentRepository.findBySupplierId(supplierId, pageable);
        return PageResponse.from(docPage.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDocumentResponse getDocumentById(Long supplierId, Long documentId) {
        SupplierDocument doc = documentRepository.findByIdAndSupplierId(documentId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplierDocument", "id", documentId));
        return toResponse(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadDocument(Long supplierId, Long documentId) {
        SupplierDocument doc = documentRepository.findByIdAndSupplierId(documentId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplierDocument", "id", documentId));

        try {
            Path filePath = Paths.get(doc.getFilePath());
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteDocument(Long supplierId, Long documentId) {
        SupplierDocument doc = documentRepository.findByIdAndSupplierId(documentId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplierDocument", "id", documentId));

        try {
            Path filePath = Paths.get(doc.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file from disk: {}", e.getMessage());
        }

        doc.softDelete("system");
        documentRepository.save(doc);
        log.info("Document deleted for supplier {}: {}", supplierId, doc.getDocumentName());
    }

    private Supplier findSupplier(Long supplierId) {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
    }

    private SupplierDocumentResponse toResponse(SupplierDocument doc) {
        return SupplierDocumentResponse.builder()
                .id(doc.getId())
                .supplierId(doc.getSupplier().getId())
                .documentName(doc.getDocumentName())
                .documentType(doc.getDocumentType())
                .fileName(doc.getFileName())
                .fileSize(doc.getFileSize())
                .mimeType(doc.getMimeType())
                .description(doc.getDescription())
                .expiryDate(doc.getExpiryDate())
                .createdAt(doc.getCreatedAt())
                .createdBy(doc.getCreatedBy())
                .build();
    }
}
