package com.capstone.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "user_pattern_selections",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPatternSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "base_pattern_id", nullable = false)
    private BasePattern basePattern;
}