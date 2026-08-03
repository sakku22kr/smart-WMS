package com.smartwms.service.impl;

import com.smartwms.entity.User;
import com.smartwms.repository.UserRepository;
import com.smartwms.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Security {@link UserDetailsService} implementation.
 *
 * <p>Loads a {@link User} by email address (the system's unique login identifier)
 * and wraps it in a {@link CustomUserDetails} instance for the security framework.</p>
 *
 * <p>The method is annotated {@code @Transactional(readOnly = true)} so that
 * the Hibernate session remains open long enough to initialize the eagerly-loaded
 * {@code roles} collection before the session closes.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Locates the user whose email matches the given {@code username} parameter.
     *
     * <p>Spring Security passes the value from the login form / JWT subject as
     * {@code username}. This system uses the email address as the username.</p>
     *
     * @param username the email address submitted for authentication
     * @return a fully-populated {@link CustomUserDetails} instance
     * @throws UsernameNotFoundException if no active user with this email exists
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading UserDetails for email: {}", username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    log.warn("Authentication failed — user not found: {}", username);
                    // Use a generic message to avoid email enumeration attacks
                    return new UsernameNotFoundException(
                            "Invalid credentials — no account found for: " + username);
                });

        log.debug("Found user [id={}] for email: {}", user.getId(), username);
        return new CustomUserDetails(user);
    }
}
