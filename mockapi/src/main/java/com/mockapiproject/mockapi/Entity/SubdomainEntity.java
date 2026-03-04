package com.mockapiproject.mockapi.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "subdomain", uniqueConstraints = @UniqueConstraint(columnNames = { "account_id", "name" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubdomainEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private AccountEntity account;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String fullDomain;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "subdomain", cascade = CascadeType.ALL)
    private List<MockApiEntity> apis;

    // Each subdomain can have its own database (for PER_SUBDOMAIN mode)
    @ManyToOne
    @JoinColumn(name = "database_connection_id")
    private DatabaseConnectionEntity databaseConnection;
}
