package com.capstone.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "base_patterns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BasePattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pattern_name", nullable = false, unique = true, length = 150)
    private String patternName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private PatternCategory category;

    @Column(name = "base_chest", nullable = false)
    private Double baseChest;

    @Column(name = "base_shoulder_width", nullable = false)
    private Double baseShoulderWidth;

    @Column(name = "base_shirt_length", nullable = false)
    private Double baseShirtLength;

    @Column(name = "base_sleeve_length", nullable = false)
    private Double baseSleeveLength;

    @Column(name = "base_waist")
    private Double baseWaist;

    @Column(name = "base_hip")
    private Double baseHip;

    @Column(name = "base_outseam")
    private Double baseOutseam;

    @Column(name = "base_neck")
    private Double baseNeck;

    @Column(name = "base_armhole_depth")
    private Double baseArmholeDepth;

    @Column(name = "base_bicep")
    private Double baseBicep;

    @Lob
    @Column(name = "geometry_json", nullable = false, columnDefinition = "TEXT")
    private String geometryJson;

    @Column(name = "description", length = 500)
    private String description;

    @Builder.Default
    @Column(name = "use_count", nullable = false)
    private Long useCount = 0L;

    @OneToMany(mappedBy = "basePattern", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AdjustmentRule> adjustmentRules = new ArrayList<>();
}