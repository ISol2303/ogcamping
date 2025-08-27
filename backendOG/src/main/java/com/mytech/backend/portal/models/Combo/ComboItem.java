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
    public static class Builder {
        private Long id;
        private Combo combo;
        private Service service;
        private Integer quantity;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder combo(Combo combo) {
            this.combo = combo;
            return this;
        }

        public Builder service(Service service) {
            this.service = service;
            return this;
        }

        public Builder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public ComboItem build() {
            ComboItem comboItem = new ComboItem();
            comboItem.id = this.id;
            comboItem.combo = this.combo;
            comboItem.service = this.service;
            comboItem.quantity = this.quantity;
            return comboItem;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Combo getCombo() {
		return combo;
	}

	public void setCombo(Combo combo) {
		this.combo = combo;
	}

	public Service getService() {
		return service;
	}

	public void setService(Service service) {
		this.service = service;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
    
}
