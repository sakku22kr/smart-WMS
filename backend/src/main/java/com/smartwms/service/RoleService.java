package com.smartwms.service;

import com.smartwms.dto.response.RoleResponse;

import java.util.List;

/**
 * Service contract for Role management operations.
 */
public interface RoleService {

    /** List all active roles. */
    List<RoleResponse> getAllActive();

    /** Get a single role by ID. */
    RoleResponse getById(Long id);
}
