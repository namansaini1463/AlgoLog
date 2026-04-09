package com.algolog.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, UUID> {

    Optional<NotificationPreferences> findByUserId(UUID userId);

    @Query("SELECT np FROM NotificationPreferences np JOIN FETCH np.user WHERE np.emailReminders = true")
    List<NotificationPreferences> findAllWithEmailRemindersEnabled();
}
