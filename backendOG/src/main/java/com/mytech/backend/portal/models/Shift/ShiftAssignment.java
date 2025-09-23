package com.mytech.backend.portal.models.Shift;

import com.mytech.backend.portal.models.User.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shift_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShiftAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Enumerated(EnumType.STRING)
    private AssignmentRole role;
}

