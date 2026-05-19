package com.capstone.model;
import com.capstone.model.MeasurementCode;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "measurement_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeasurementDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private MeasurementCode code;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "required_by_default", nullable = false)
    private boolean requiredByDefault;
}