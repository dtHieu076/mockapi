package com.mockapiproject.mockapi.Entity;

import jakarta.persistence.*; // Cho @Entity, @Table, @Id, @GeneratedValue, @ManyToOne, @JoinColumn, @UniqueConstraint
import lombok.*; // Cho @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor, @Builder
import org.hibernate.annotations.CreationTimestamp; // Cho @CreationTimestamp
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mock_api", uniqueConstraints = @UniqueConstraint(columnNames = { "subdomain_id", "method", "path" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockApiEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "subdomain_id", nullable = false)
    private SubdomainEntity subdomain;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private String path;

    private Integer statusCode = 200;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    @CreationTimestamp
    private LocalDateTime createdAt;
}