package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response payload for supplier documents.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier document response")
public class SupplierDocumentResponse {

    @Schema(description = "Document ID")
    private Long id;

    @Schema(description = "Supplier ID")
    private Long supplierId;

    @Schema(description = "Document name", example = "GST Certificate")
    private String documentName;

    @Schema(description = "Document type", example = "GST_CERTIFICATE")
    private String documentType;

    @Schema(description = "Original file name", example = "gst_cert.pdf")
    private String fileName;

    @Schema(description = "File size in bytes", example = "1024000")
    private Long fileSize;

    @Schema(description = "MIME type", example = "application/pdf")
    private String mimeType;

    @Schema(description = "Document description")
    private String description;

    @Schema(description = "Document expiry date")
    private LocalDate expiryDate;

    @Schema(description = "Upload timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Uploaded by")
    private String createdBy;
}
