package com.smartwms.repository;

import com.smartwms.entity.RefreshToken;
import com.smartwms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link RefreshToken} entities.
 *
 * <p>Provides token lookup, bulk revocation, and expired-token cleanup queries.
 * All bulk-mutation queries use {@code @Modifying + @Transactional} to ensure
 * safe batch updates without loading entities into memory.</p>
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** Looks up a token by its opaque string value. */
    Optional<RefreshToken> findByToken(String token);

    /** Returns all active (not revoked, not expired) tokens for a user. */
    @Query("""
            SELECT rt FROM RefreshToken rt
            WHERE rt.user = :user
              AND rt.revoked = false
              AND rt.expiresAt > :now
            """)
    List<RefreshToken> findActiveTokensByUser(@Param("user") User user,
                                              @Param("now") LocalDateTime now);

    /** Returns all tokens (any state) for a given user. */
    List<RefreshToken> findAllByUser(User user);

    /** Returns all tokens for a user by user ID. */
    List<RefreshToken> findAllByUserId(Long userId);

    /**
     * Revokes all non-revoked tokens belonging to a user.
     * Used for "logout everywhere" and password/credential change flows.
     */
    @Modifying
    @Transactional
    @Query("""
            UPDATE RefreshToken rt
            SET rt.revoked = true
            WHERE rt.user = :user
              AND rt.revoked = false
            """)
    int revokeAllByUser(@Param("user") User user);

    /**
     * Revokes all non-revoked tokens belonging to a user by ID.
     */
    @Modifying
    @Transactional
    @Query("""
            UPDATE RefreshToken rt
            SET rt.revoked = true
            WHERE rt.user.id = :userId
              AND rt.revoked = false
            """)
    int revokeAllByUserId(@Param("userId") Long userId);

    /**
     * Deletes all tokens that are either revoked or past their expiry.
     * Should be called periodically by a maintenance scheduler.
     *
     * @return the number of rows deleted
     */
    @Modifying
    @Transactional
    @Query("""
            DELETE FROM RefreshToken rt
            WHERE rt.revoked = true
               OR rt.expiresAt <= :now
            """)
    int deleteExpiredAndRevokedTokens(@Param("now") LocalDateTime now);

    boolean existsByToken(String token);
}
