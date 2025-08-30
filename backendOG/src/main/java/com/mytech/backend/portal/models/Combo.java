	package com.mytech.backend.portal.models;
	
	import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
	
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
	
		public Long getId() {
			return id;
		}
	
		public void setId(Long id) {
			this.id = id;
		}
	
		public String getName() {
			return name;
		}
	
		public void setName(String name) {
			this.name = name;
		}
	
		public String getDescription() {
			return description;
		}
	
		public void setDescription(String description) {
			this.description = description;
		}
	
		public Double getPrice() {
			return price;
		}
	
		public void setPrice(Double price) {
			this.price = price;
		}
	
		public Boolean getActive() {
			return active;
		}
	
		public void setActive(Boolean active) {
			this.active = active;
		}
	
		public List<ComboItem> getItems() {
			return items;
		}
	
		public void setItems(List<ComboItem> items) {
			this.items = items;
		}
		public static class Builder {
	        private Long id;
	        private String name;
	        private String description;
	        private Double price;
	        private Boolean active;
	        private List<ComboItem> items = new ArrayList<>();

	        public Builder id(Long id) {
	            this.id = id;
	            return this;
	        }

	        public Builder name(String name) {
	            this.name = name;
	            return this;
	        }

	        public Builder description(String description) {
	            this.description = description;
	            return this;
	        }

	        public Builder price(Double price) {
	            this.price = price;
	            return this;
	        }

	        public Builder active(Boolean active) {
	            this.active = active;
	            return this;
	        }

	        public Builder items(List<ComboItem> items) {
	            this.items = items != null ? items : new ArrayList<>();
	            return this;
	        }

	        public Combo build() {
	            Combo combo = new Combo();
	            combo.id = this.id;
	            combo.name = this.name;
	            combo.description = this.description;
	            combo.price = this.price;
	            combo.active = this.active != null ? this.active : true;
	            combo.items = this.items;
	            return combo;
	        }
	    }

	    public static Builder builder() {
	        return new Builder();
	    }
	}
	
