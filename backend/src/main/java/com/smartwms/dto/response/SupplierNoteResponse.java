package com.smartwms.dto.response;

import com.smartwms.entity.SupplierNote;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Response payload for supplier notes.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier note response")
public class SupplierNoteResponse {

    @Schema(description = "Note ID")
    private Long id;

    @Schema(description = "Supplier ID")
    private Long supplierId;

    @Schema(description = "Note type", example = "MEETING")
    private SupplierNote.SupplierNoteType noteType;

    @Schema(description = "Note title", example = "Q1 Review Meeting")
    private String title;

    @Schema(description = "Note content")
    private String content;

    @Schema(description = "Whether note is pinned", example = "false")
    private boolean pinned;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Created by")
    private String createdBy;
}
