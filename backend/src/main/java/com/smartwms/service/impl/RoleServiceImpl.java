package com.smartwms.service.impl;

import com.smartwms.dto.response.RoleResponse;
import com.smartwms.entity.Role;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.RoleMapper;
import com.smartwms.repository.RoleRepository;
import com.smartwms.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link RoleService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper     roleMapper;

    @Override
    public List<RoleResponse> getAllActive() {
        List<Role> roles = roleRepository.findByActiveTrue();
        return roleMapper.toResponseList(roles);
    }

    @Override
    public RoleResponse getById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return roleMapper.toResponse(role);
    }
}
