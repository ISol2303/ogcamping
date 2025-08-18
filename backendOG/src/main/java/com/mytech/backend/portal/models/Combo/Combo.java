package com.mytech.backend.portal.models.Combo;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="combos")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Combo {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Double price;       // giá combo
    private Boolean active = true;

    @OneToMany(mappedBy="combo", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<ComboItem> items = new ArrayList<>();
}

