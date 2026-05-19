package com.capstone.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "user_measurements",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "measurement_definition_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "measurement_definition_id", nullable = false)
    private MeasurementDefinition measurementDefinition;

    @Column(name = "measurement_value", nullable = false)
    private Double value;
}