package com.algolog.upload;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class UploadController {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
            "application/pdf"
    );

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @AuthenticationPrincipal UUID userId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        // Limit to 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be under 5MB"));
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "algolog/notes/" + userId,
                    "resource_type", "image",
                    "transformation", "q_auto,f_auto,w_1200,c_limit"
            ));

            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");

            log.info("Image uploaded by user {}: {}", userId, publicId);

            return ResponseEntity.ok(Map.of(
                    "url", url,
                    "publicId", publicId
            ));
        } catch (Exception e) {
            log.error("Cloudinary upload failed for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/file")
    public ResponseEntity<Map<String, String>> uploadFile(
            @AuthenticationPrincipal UUID userId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image and PDF files are allowed"));
        }

        // Limit to 10MB for PDFs, 5MB for images
        long maxSize = contentType.equals("application/pdf") ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "File size must be under " + (contentType.equals("application/pdf") ? "10MB" : "5MB")));
        }

        boolean isPdf = contentType.equals("application/pdf");
        String resourceType = isPdf ? "raw" : "image";

        try {
            var uploadParams = isPdf
                    ? ObjectUtils.asMap(
                            "folder", "algolog/notes/" + userId,
                            "resource_type", resourceType)
                    : ObjectUtils.asMap(
                            "folder", "algolog/notes/" + userId,
                            "resource_type", resourceType,
                            "transformation", "q_auto,f_auto,w_1200,c_limit");

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");

            log.info("File uploaded by user {} (type={}): {}", userId, contentType, publicId);

            return ResponseEntity.ok(Map.of(
                    "url", url,
                    "publicId", publicId,
                    "fileType", isPdf ? "pdf" : "image"
            ));
        } catch (Exception e) {
            log.error("Cloudinary upload failed for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}
