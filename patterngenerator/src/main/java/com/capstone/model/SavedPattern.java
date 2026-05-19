package com.capstone.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_patterns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "pattern_name", nullable = false, length = 150)
    private String patternName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private PatternCategory category;

    @Column(name = "base_pattern_id")
    private Long basePatternId;

    @Lob
    @Column(name = "adjusted_geometry_json", nullable = false, columnDefinition = "TEXT")
    private String adjustedGeometryJson;

    @Lob
    @Column(name = "piece_measurements_json", columnDefinition = "TEXT")
    private String pieceMeasurementsJson;

    @Lob
    @Column(name = "measurements_snapshot", columnDefinition = "TEXT")
    private String measurementsSnapshot;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}