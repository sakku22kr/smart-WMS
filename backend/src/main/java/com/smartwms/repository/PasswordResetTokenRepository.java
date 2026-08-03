package com.smartwms.repository;

import com.smartwms.entity.PasswordResetToken;
import com.smartwms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    /** Deletes all existing (used or expired) tokens for a user before issuing a new one. */
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.user = :user")
    void deleteAllByUser(@Param("user") User user);

    /** Periodic cleanup of expired/used tokens. */
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.used = true OR prt.expiresAt <= :now")
    int deleteExpiredAndUsedTokens(@Param("now") LocalDateTime now);

    boolean existsByUserAndUsedFalseAndExpiresAtAfter(User user, LocalDateTime now);
}
