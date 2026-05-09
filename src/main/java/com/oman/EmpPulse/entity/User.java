package com.oman.EmpPulse.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(name = "\"User\"")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "pass_hash", nullable = false)
    private String passHash;

    @Column(nullable = false, columnDefinition = "theme")
    @ColumnTransformer(write = "?::theme")
    private String theme;

    @Column(nullable = false, columnDefinition = "language")
    @ColumnTransformer(write = "?::language")
    private String language;

    @Column(nullable = false, columnDefinition = "role")
    @ColumnTransformer(write = "?::role")
    private String role; // "OWNER", "ADMIN", "WORKER"

    public User() {}

    public User(String name, String surname, String email, String passHash, String theme, String language, String role) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.passHash = passHash;
        this.theme = theme;
        this.language = language;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassHash() { return passHash; }
    public void setPassHash(String passHash) { this.passHash = passHash; }
    
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
