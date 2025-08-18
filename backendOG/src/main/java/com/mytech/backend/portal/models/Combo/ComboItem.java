package com.mytech.backend.portal.models.Combo;

import com.mytech.backend.portal.models.Service.Service;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="combo_items")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComboItem {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="combo_id", nullable=false)
    private Combo combo;

    @ManyToOne @JoinColumn(name="service_id", nullable=false)
    private Service service;

    private Integer quantity;   // nếu cần
}
