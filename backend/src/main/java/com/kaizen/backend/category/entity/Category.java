package com.kaizen.backend.category.entity;

import com.kaizen.backend.common.entity.BaseEntity;
import com.kaizen.backend.user.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "is_global", nullable = false)
    private boolean global = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(length = 255)
    private String icon;

    @Column(length = 7)
    private String color;

    public Category(String name, boolean isGlobal, UserAccount user, String icon, String color) {
        this.name = name;
        this.global = isGlobal;
        this.user = user;
        this.icon = icon;
        this.color = color;
    }
}
