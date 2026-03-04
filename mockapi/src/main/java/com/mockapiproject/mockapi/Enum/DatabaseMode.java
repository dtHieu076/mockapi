package com.mockapiproject.mockapi.Enum;

public enum DatabaseMode {
    SHARED, // All subdomains use same database
    PER_SUBDOMAIN // Each subdomain has own database
}
