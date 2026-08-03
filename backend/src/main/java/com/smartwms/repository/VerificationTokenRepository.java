package com.smartwms.repository;

import com.smartwms.entity.User;
import com.smartwms.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByToken(String token);

    /** Deletes all existing tokens for a user before issuing a new one (resend). */
    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken vt WHERE vt.user = :user")
    void deleteAllByUser(@Param("user") User user);

    /** Periodic cleanup of expired/used tokens. */
    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken vt WHERE vt.used = true OR vt.expiresAt <= :now")
    int deleteExpiredAndUsedTokens(@Param("now") LocalDateTime now);
}
