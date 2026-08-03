package com.smartwms.dto.request;

import com.smartwms.entity.SupplierNote;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload for creating or updating a supplier note.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierNoteRequest {

    @NotNull(message = "Note type is required")
    private SupplierNote.SupplierNoteType noteType;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 2000, message = "Content must be between 1 and 2000 characters")
    private String content;

    @Builder.Default
    private boolean pinned = false;
}
