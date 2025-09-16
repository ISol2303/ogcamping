package com.mytech.backend.portal.models.Shift;

import jakarta.persistence.*;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "shifts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate shiftDate;      // ngày trực
    private LocalTime startTime;      // giờ bắt đầu
    private LocalTime endTime;        // giờ kết thúc

    @Enumerated(EnumType.STRING)
    private ShiftStatus status = ShiftStatus.REGISTERED;

    @OneToMany(mappedBy = "shift", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ShiftAssignment> assignments = new HashSet<>();

}

