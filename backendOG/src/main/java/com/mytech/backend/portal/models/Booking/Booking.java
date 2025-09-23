package com.mytech.backend.portal.models.Booking;

import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Equipment.Equipment;
import com.mytech.backend.portal.models.Payment.Payment;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.User.User;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;


    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Integer numberOfPeople;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    private String note;
    private String internalNotes;
    private Integer rating;
    private String feedback;
    private boolean hasReview;

    @ManyToOne
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff; // nhân viên được gán

    @Column(name = "total_price")
    private Long totalPrice;

    @OneToOne(mappedBy="booking", cascade=CascadeType.ALL, orphanRemoval=true)
    private Payment payment;

    @CreationTimestamp
    @Column(nullable=false, updatable=false)
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingItem> items = new ArrayList<>();


    public Long calculateTotalPrice() {
        long total = 0L;

        for (BookingItem item : items) {
            double base = 0.0;

            // 👉 Nếu là SERVICE
            if (item.getService() != null) {
                Service service = item.getService();

                // Giá cơ bản * số lượng (thường quantity = 1 với service)
                base = (service.getPrice() != null ? service.getPrice() : 0.0) * item.getQuantity();

                // Tính phụ phí extraPeople (nếu có)
                if (item.getNumberOfPeople() != null) {
                    int people = item.getNumberOfPeople();
                    int maxCapacity = service.getMaxCapacity() != null ? service.getMaxCapacity() : 0;

                    if (people > maxCapacity && Boolean.TRUE.equals(service.getAllowExtraPeople())) {
                        int extra = people - maxCapacity;
                        int limitedExtra = Math.min(extra,
                                service.getMaxExtraPeople() != null ? service.getMaxExtraPeople() : extra);

                        double extraFee = service.getExtraFeePerPerson() != null ? service.getExtraFeePerPerson() : 0.0;
                        base += limitedExtra * extraFee;
                    }
                }
            }

            // 👉 Nếu là COMBO
            else if (item.getCombo() != null) {
                Combo combo = item.getCombo();
                base = (combo.getPrice() != null ? combo.getPrice() : 0.0) * item.getQuantity();
            }

            // 👉 Nếu là EQUIPMENT
            else if (item.getEquipment() != null) {
                Equipment eq = item.getEquipment();
                base = (eq.getPrice() != null ? eq.getPrice() : 0.0) * item.getQuantity();
            }

            // Cộng dồn vào tổng
            total += Math.round(base);
        }

        return total;
    }


}

