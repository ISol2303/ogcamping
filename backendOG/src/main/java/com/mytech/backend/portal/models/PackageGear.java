package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "package_gears")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageGear extends AbstractEntity{
    /**
	 * 
	 */
	private static final long serialVersionUID = -1494317269267764491L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private Package pkg;

    @ManyToOne
    @JoinColumn(name = "gear_id", nullable = false)
    private Gear gear;

    @Column(name = "gear_quantity", nullable = false)
    private Integer gearQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Area.AreaName area;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Package getPkg() {
		return pkg;
	}

	public void setPkg(Package pkg) {
		this.pkg = pkg;
	}

	public Gear getGear() {
		return gear;
	}

	public void setGear(Gear gear) {
		this.gear = gear;
	}

	public Integer getGearQuantity() {
		return gearQuantity;
	}

	public void setGearQuantity(Integer gearQuantity) {
		this.gearQuantity = gearQuantity;
	}

	public Area.AreaName getArea() {
		return area;
	}

	public void setArea(Area.AreaName area) {
		this.area = area;
	}
    
}