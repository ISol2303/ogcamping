package com.mytech.backend.portal.models;
import com.fasterxml.jackson.annotation.JsonCreator;

public enum GearStatus {
    AVAILABLE,
    OUT_OF_STOCK,
    MAINTENANCE;

    @JsonCreator
    public static GearStatus fromValue(String value) {
        return GearStatus.valueOf(value.toUpperCase());
    }
}


