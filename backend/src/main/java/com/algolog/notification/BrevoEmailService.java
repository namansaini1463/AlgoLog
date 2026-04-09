package com.algolog.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BrevoEmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
    private static final String TEMPLATE_PATH = "email/revision-reminder.brevo.html";

    @Value("${brevo.api-key:}")
    private String apiKey;

    @Value("${brevo.sender-email:noreply@algolog.app}")
    private String senderEmail;

    @Value("${brevo.sender-name:AlgoLog}")
    private String senderName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String templateCache;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Sends a revision reminder email using the HTML template with [[PLACEHOLDER]] substitution.
     */
    public void sendRevisionReminder(String toEmail, String toName, String subject, ReminderData data) {
        if (!isConfigured()) {
            log.warn("Brevo API key not configured — skipping email to {}", toEmail);
            return;
        }

        String html = renderTemplate(data);
        sendRawEmail(toEmail, toName, subject, html);
    }

    /**
     * Sends a raw HTML email via Brevo's transactional API.
     */
    public void sendRawEmail(String toEmail, String toName, String subject, String htmlContent) {
        if (!isConfigured()) {
            log.warn("Brevo API key not configured — skipping email to {}", toEmail);
            return;
        }

        try {
            Map<String, Object> payload = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", toEmail, "name", toName)),
                "subject", subject,
                "htmlContent", htmlContent
            );

            String body = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_URL))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent to {} — subject: {}", toEmail, subject);
            } else {
                log.error("Brevo API error ({}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    // ── Template rendering ──

    /**
     * Loads the HTML template and replaces all [[PLACEHOLDER]] tokens.
     */
    public String renderTemplate(ReminderData data) {
        String template = loadTemplate();

        template = template.replace("[[USERNAME]]", esc(data.username()));
        template = template.replace("[[OVERDUE_COUNT]]", String.valueOf(data.overdueCount()));
        template = template.replace("[[DUE_TODAY_COUNT]]", String.valueOf(data.dueTodayCount()));
        template = template.replace("[[FRONTEND_URL]]", esc(frontendUrl));
        template = template.replace("[[STATS_PILLS_HTML]]", buildStatsPillsHtml(data));
        template = template.replace("[[PROBLEM_LIST_HTML]]", buildProblemListHtml(data.problems()));
        template = template.replace("[[REMAINING_COUNT_HTML]]", buildRemainingHtml(data));

        return template;
    }

    private String loadTemplate() {
        if (templateCache != null) {
            return templateCache;
        }
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
            templateCache = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            return templateCache;
        } catch (IOException e) {
            log.error("Failed to load email template from {}: {}", TEMPLATE_PATH, e.getMessage());
            throw new RuntimeException("Email template not found", e);
        }
    }

    /** For dev/testing: clears template cache so changes are picked up on next render. */
    public void clearTemplateCache() {
        templateCache = null;
    }

    // ── HTML fragment builders ──

    private String buildStatsPillsHtml(ReminderData data) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>");

        if (data.flaggedCount() > 0) {
            sb.append("<td style=\"padding-right: 10px;\">")
              .append("<span style=\"display:inline-block;background-color:#f3e8ff;color:#7c3aed;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;\">")
              .append("&#9873; ").append(data.flaggedCount()).append(" flagged")
              .append("</span></td>");
        }
        if (data.overdueCount() > 0) {
            sb.append("<td style=\"padding-right: 10px;\">")
              .append("<span style=\"display:inline-block;background-color:#fef2f2;color:#dc2626;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;\">")
              .append(data.overdueCount()).append(" overdue")
              .append("</span></td>");
        }
        if (data.dueTodayCount() > 0) {
            sb.append("<td>")
              .append("<span style=\"display:inline-block;background-color:#fffbeb;color:#d97706;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;\">")
              .append(data.dueTodayCount()).append(" due today")
              .append("</span></td>");
        }

        sb.append("</tr></table>");
        return sb.toString();
    }

    private String buildProblemListHtml(List<ReminderProblem> problems) {
        if (problems.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        sb.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");

        for (ReminderProblem p : problems) {
            String dotColor = p.isOverdue() ? "#ef4444" : "#f59e0b";

            sb.append("<tr>");

            // Dot column
            sb.append("<td width=\"22\" valign=\"top\" style=\"padding:12px 0;\">");
            sb.append("<div style=\"width:10px;height:10px;border-radius:50%;background-color:").append(dotColor).append(";margin-top:3px;\"></div>");
            sb.append("</td>");

            // Content column
            sb.append("<td style=\"padding:12px 0 12px 0;border-bottom:1px solid #f9fafb;\">");

            // Title + badge
            sb.append("<span style=\"font-size:14px;font-weight:600;color:#111827;\">").append(esc(p.title())).append("</span>");
            if (p.difficulty() != null && !p.difficulty().isBlank()) {
                String bgColor, textColor;
                switch (p.difficulty().toUpperCase()) {
                    case "EASY" -> { bgColor = "#dcfce7"; textColor = "#16a34a"; }
                    case "HARD" -> { bgColor = "#fee2e2"; textColor = "#dc2626"; }
                    default -> { bgColor = "#fef9c3"; textColor = "#ca8a04"; }
                }
                sb.append(" <span style=\"display:inline-block;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;background-color:")
                  .append(bgColor).append(";color:").append(textColor).append(";\">")
                  .append(esc(p.difficulty())).append("</span>");
            }

            // Meta line
            boolean hasTopic = p.topic() != null && !p.topic().isBlank();
            boolean hasOverdue = p.isOverdue() && p.daysOverdue() > 0;
            if (hasTopic || hasOverdue) {
                sb.append("<div style=\"font-size:12px;color:#9ca3af;margin-top:4px;\">");
                if (hasTopic) sb.append(esc(p.topic()));
                if (hasOverdue) {
                    if (hasTopic) sb.append(" &middot; ");
                    sb.append("<span style=\"color:#ef4444;\">").append(p.daysOverdue())
                      .append(" day").append(p.daysOverdue() > 1 ? "s" : "").append(" overdue</span>");
                }
                sb.append("</div>");
            }

            sb.append("</td></tr>");
        }

        sb.append("</table>");
        return sb.toString();
    }

    private String buildRemainingHtml(ReminderData data) {
        int totalCount = data.overdueCount() + data.dueTodayCount() + data.flaggedCount();
        int remaining = totalCount - data.problems().size();
        if (remaining <= 0) return "";

        return "<p style=\"margin:0;font-size:13px;color:#9ca3af;font-style:italic;\">+ "
                + remaining + " more problem" + (remaining > 1 ? "s" : "") + "</p>";
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    // ── Records ──

    public record ReminderProblem(String title, String difficulty, String topic, boolean isOverdue, int daysOverdue) {}

    public record ReminderData(String username, int overdueCount, int dueTodayCount, int flaggedCount,
                                List<ReminderProblem> problems) {}
}
