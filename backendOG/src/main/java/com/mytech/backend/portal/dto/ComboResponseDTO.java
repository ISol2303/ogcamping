package com.mytech.backend.portal.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboResponseDTO {
    private Long _id;
    private String name;
    private String description;
    private Double price;
    private Boolean active;
    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private Double price;
        private Boolean active;

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

        public ComboResponseDTO build() {
            ComboResponseDTO comboResponseDTO = new ComboResponseDTO();
            comboResponseDTO._id = this.id;
            comboResponseDTO.name = this.name;
            comboResponseDTO.description = this.description;
            comboResponseDTO.price = this.price;
            comboResponseDTO.active = this.active;
            return comboResponseDTO;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

	public Long getId() {
		return _id;
	}

	public void setId(Long id) {
		this._id = id;
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
    
}
