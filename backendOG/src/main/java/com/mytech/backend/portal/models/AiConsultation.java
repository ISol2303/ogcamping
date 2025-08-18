package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiConsultation extends AbstractEntity{
    /**
	 * 
	 */
	private static final long serialVersionUID = -1512199952347623721L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String keyword;

    @Column(name = "user_question")
    private String userQuestion;

    @Column
    private String preferences;

    @ManyToOne
    @JoinColumn(name = "recommended_package_id")
    private Package recommendedPackage;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getKeyword() {
		return keyword;
	}

	public void setKeyword(String keyword) {
		this.keyword = keyword;
	}

	public String getUserQuestion() {
		return userQuestion;
	}

	public void setUserQuestion(String userQuestion) {
		this.userQuestion = userQuestion;
	}

	public String getPreferences() {
		return preferences;
	}

	public void setPreferences(String preferences) {
		this.preferences = preferences;
	}

	public Package getRecommendedPackage() {
		return recommendedPackage;
	}

	public void setRecommendedPackage(Package recommendedPackage) {
		this.recommendedPackage = recommendedPackage;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
}