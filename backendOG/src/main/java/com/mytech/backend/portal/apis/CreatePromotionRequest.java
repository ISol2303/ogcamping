// com/mytech/backend/portal/apis/CreatePromotionRequest.java
package com.mytech.backend.portal.apis;

public class CreatePromotionRequest {
    private String code;
    private int discount;
    private String startDate;
    private String endDate;
    private String status;

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public int getDiscount() { return discount; }
    public void setDiscount(int discount) { this.discount = discount; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}