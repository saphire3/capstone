package com.capstone.model;

import com.capstone.model.Axis;
import com.capstone.model.MeasurementCode;
import com.capstone.model.PatternPointTargetType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "adjustment_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdjustmentRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "base_pattern_id", nullable = false)
    private BasePattern basePattern;

    @Column(name = "piece_name", nullable = false, length = 100)
    private String pieceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private PatternPointTargetType targetType;

    @Column(name = "target_name", nullable = false, length = 100)
    private String targetName;

    @Enumerated(EnumType.STRING)
    @Column(name = "measurement_code", nullable = false, length = 50)
    private MeasurementCode measurementCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "axis", nullable = false, length = 10)
    private Axis axis;

    @Column(name = "ratio", nullable = false)
    private Double ratio;

    @Column(name = "description", length = 500)
    private String description;
}