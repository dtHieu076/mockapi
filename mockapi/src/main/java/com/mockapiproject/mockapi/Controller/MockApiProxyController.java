package com.mockapiproject.mockapi.Controller;

import com.mockapiproject.mockapi.Entity.MockApiEntity;
import com.mockapiproject.mockapi.Entity.SubdomainEntity;
import com.mockapiproject.mockapi.Repository.MockApiRepository;
import com.mockapiproject.mockapi.Repository.SubdomainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Controller xử lý mock API requests từ subdomain
 * Ví dụ: test.dangthanhhieu076.id.vn/api/users -> GET/POST/PUT/DELETE
 */
@RestController
@RequiredArgsConstructor
public class MockApiProxyController {

    private final SubdomainRepository subdomainRepository;
    private final MockApiRepository mockApiRepository;

    /**
     * Xử lý tất cả các HTTP methods cho mock API
     * Request đến: {subdomain}.dangthanhhieu076.id.vn/{path}
     */
    @RequestMapping(value = "/**")
    public ResponseEntity<?> handleMockApi(
            @RequestHeader(value = "X-Subdomain", required = false) String subdomain,
            @RequestHeader(value = "X-Original-Method", required = false) String method,
            @RequestHeader(value = "X-Original-URI", required = false) String originalUri,
            @RequestHeader(value = "Host", required = false) String host,
            @RequestBody(required = false) String body) {

        // Nếu không có subdomain header, bỏ qua (để các controller khác xử lý)
        if (subdomain == null || subdomain.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"Subdomain required\"}");
        }

        // Log để debug
        System.out.println("=== Mock API Request ===");
        System.out.println("Subdomain: " + subdomain);
        System.out.println("Method: " + method);
        System.out.println("Original URI: " + originalUri);
        System.out.println("Host: " + host);

        // Tìm subdomain trong database
        Optional<SubdomainEntity> subdomainOpt = subdomainRepository.findByName(subdomain);
        if (subdomainOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"Subdomain not found: " + subdomain + "\"}");
        }

        SubdomainEntity subdomainEntity = subdomainOpt.get();

        // Lấy path từ originalUri (bỏ qua phần subdomain nếu có)
        String requestPath = extractPath(originalUri);
        if (requestPath == null || requestPath.isEmpty()) {
            requestPath = "/";
        }

        System.out.println("Request path: " + requestPath);

        // Tìm mock API configuration dựa trên path và method
        String httpMethod = method != null ? method.toUpperCase() : "GET";

        Optional<MockApiEntity> mockApiOpt = mockApiRepository.findBySubdomainIdAndMethodAndPath(
                subdomainEntity.getId(),
                httpMethod,
                requestPath);

        if (mockApiOpt.isEmpty()) {
            // Thử tìm mà không cần method (cho wildcard)
            mockApiOpt = mockApiRepository.findBySubdomainIdAndPath(
                    subdomainEntity.getId(),
                    requestPath);
        }

        if (mockApiOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"Mock API not found for path: " + requestPath + "\"}");
        }

        MockApiEntity mockApi = mockApiOpt.get();

        // Trả về response đã được cấu hình
        System.out.println("Found mock API: " + mockApi.getPath() + " [" + mockApi.getMethod() + "]");
        System.out.println("Response: " + mockApi.getResponseBody());

        return ResponseEntity.status(mockApi.getStatusCode()).body(mockApi.getResponseBody());
    }

    /**
     * Extract path từ original URI
     */
    private String extractPath(String originalUri) {
        if (originalUri == null || originalUri.isEmpty()) {
            return "/";
        }

        // Remove query string if any
        int queryIndex = originalUri.indexOf('?');
        if (queryIndex > 0) {
            originalUri = originalUri.substring(0, queryIndex);
        }

        return originalUri;
    }
}
