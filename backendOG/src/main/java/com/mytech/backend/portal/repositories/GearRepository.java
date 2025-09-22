package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Area.AreaName;
import com.mytech.backend.portal.models.Gear;
import com.mytech.backend.portal.models.Gear.GearStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GearRepository extends JpaRepository<Gear, Long> {
	  @Query("""
		        SELECT g FROM Gear g
		        WHERE (:name IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :name, '%')))
		        AND (:category IS NULL OR g.category = :category)
		        AND (:area IS NULL OR g.area = :area)
		        AND (:status IS NULL OR g.status = :status)
		    """)
		    List<Gear> searchGears(
		        @Param("name") String name,
		        @Param("category") String category,
		        @Param("area") AreaName area,
		        @Param("status") GearStatus status
		    );
}
