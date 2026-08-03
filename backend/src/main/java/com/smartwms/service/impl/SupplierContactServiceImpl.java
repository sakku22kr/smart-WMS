package com.smartwms.service.impl;

import com.smartwms.dto.request.SupplierContactRequest;
import com.smartwms.dto.response.SupplierContactResponse;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.SupplierContact;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.repository.SupplierContactRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.service.SupplierContactService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link SupplierContactService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SupplierContactServiceImpl implements SupplierContactService {

    private final SupplierContactRepository contactRepository;
    private final SupplierRepository supplierRepository;

    @Override
    public SupplierContactResponse createContact(Long supplierId, SupplierContactRequest request) {
        Supplier supplier = findSupplier(supplierId);

        SupplierContact contact = new SupplierContact();
        contact.setSupplier(supplier);
        contact.setName(request.getName());
        contact.setDesignation(request.getDesignation());
        contact.setDepartment(request.getDepartment());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setAlternatePhone(request.getAlternatePhone());
        contact.setPrimary(request.isPrimary());
        contact.setNotes(request.getNotes());

        // If this is set as primary, unset other primaries
        if (request.isPrimary()) {
            unsetPrimaryContacts(supplierId);
        }

        SupplierContact saved = contactRepository.save(contact);
        log.info("Contact created for supplier {}: {}", supplierId, request.getName());
        return toResponse(saved);
    }

    @Override
    public SupplierContactResponse updateContact(Long supplierId, Long contactId, SupplierContactRequest request) {
        SupplierContact contact = findContact(supplierId, contactId);

        contact.setName(request.getName());
        contact.setDesignation(request.getDesignation());
        contact.setDepartment(request.getDepartment());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setAlternatePhone(request.getAlternatePhone());
        contact.setPrimary(request.isPrimary());
        contact.setNotes(request.getNotes());

        // If this is set as primary, unset other primaries
        if (request.isPrimary()) {
            unsetPrimaryContacts(supplierId);
            contact.setPrimary(true);
        }

        SupplierContact saved = contactRepository.save(contact);
        log.info("Contact updated for supplier {}: {}", supplierId, request.getName());
        return toResponse(saved);
    }

    @Override
    public void deleteContact(Long supplierId, Long contactId) {
        SupplierContact contact = findContact(supplierId, contactId);
        contact.softDelete("system");
        contactRepository.save(contact);
        log.info("Contact deleted for supplier {}: {}", supplierId, contact.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierContactResponse getContactById(Long supplierId, Long contactId) {
        SupplierContact contact = findContact(supplierId, contactId);
        return toResponse(contact);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierContactResponse> getContactsBySupplier(Long supplierId) {
        findSupplier(supplierId);
        return contactRepository.findBySupplierIdOrderByPrimaryDescNameAsc(supplierId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SupplierContactResponse setPrimaryContact(Long supplierId, Long contactId) {
        SupplierContact contact = findContact(supplierId, contactId);
        unsetPrimaryContacts(supplierId);
        contact.setPrimary(true);
        SupplierContact saved = contactRepository.save(contact);
        log.info("Primary contact set for supplier {}: {}", supplierId, contact.getName());
        return toResponse(saved);
    }

    private void unsetPrimaryContacts(Long supplierId) {
        List<SupplierContact> contacts = contactRepository.findBySupplierId(supplierId);
        for (SupplierContact c : contacts) {
            if (c.isPrimary()) {
                c.setPrimary(false);
                contactRepository.save(c);
            }
        }
    }

    private Supplier findSupplier(Long supplierId) {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
    }

    private SupplierContact findContact(Long supplierId, Long contactId) {
        return contactRepository.findByIdAndSupplierId(contactId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplierContact", "id", contactId));
    }

    private SupplierContactResponse toResponse(SupplierContact contact) {
        return SupplierContactResponse.builder()
                .id(contact.getId())
                .supplierId(contact.getSupplier().getId())
                .name(contact.getName())
                .designation(contact.getDesignation())
                .department(contact.getDepartment())
                .email(contact.getEmail())
                .phone(contact.getPhone())
                .alternatePhone(contact.getAlternatePhone())
                .primary(contact.isPrimary())
                .notes(contact.getNotes())
                .createdAt(contact.getCreatedAt())
                .createdBy(contact.getCreatedBy())
                .build();
    }
}
