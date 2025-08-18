package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_booking_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderBookingItem extends AbstractEntity{
    /**
	 * 
	 */
	private static final long serialVersionUID = 6611479671423920730L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_booking_id", nullable = false)
    private OrderBooking orderBooking;

    @Column(name = "item_type", nullable = false)
    private String itemType;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public OrderBooking getOrderBooking() {
		return orderBooking;
	}

	public void setOrderBooking(OrderBooking orderBooking) {
		this.orderBooking = orderBooking;
	}

	public String getItemType() {
		return itemType;
	}

	public void setItemType(String itemType) {
		this.itemType = itemType;
	}

	public Long getItemId() {
		return itemId;
	}

	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public Double getUnitPrice() {
		return unitPrice;
	}

	public void setUnitPrice(Double unitPrice) {
		this.unitPrice = unitPrice;
	}

	public Double getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(Double totalPrice) {
		this.totalPrice = totalPrice;
	}
    
}