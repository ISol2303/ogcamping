package com.mytech.backend.portal.dto.Service;


import com.mytech.backend.portal.models.Service.ServiceTag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServiceRequestDTO {

    private String name;            // Tên dịch vụ, ví dụ: "Cắm trại Sapa"
    private String description;     // Mô tả dịch vụ
    private Double price;           // Giá trọn gói hoặc theo đêm
    private String location;        // Vị trí, ví dụ: "Sapa, Lào Cai"
    private Integer minDays;        // Số ngày tối thiểu thuê
    private Integer maxDays;        // Số ngày tối đa thuê
    private Integer minCapacity;    // Số khách tối thiểu
    private Integer maxCapacity;    // Số khách tối đa
    private String tag;             // POPULAR / NEW / DISCOUNT
}
