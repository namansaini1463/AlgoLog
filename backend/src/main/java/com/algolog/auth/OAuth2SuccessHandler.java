package com.algolog.auth;

import com.algolog.user.User;
import com.algolog.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauthUser = oauthToken.getPrincipal();
            String provider = oauthToken.getAuthorizedClientRegistrationId(); // "google" or "github"

            String email = extractEmail(oauthUser, provider);
            String name = extractName(oauthUser, provider);
            String oauthId = extractOAuthId(oauthUser, provider);

            // Find or create user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createNewOAuthUser(email, name, provider, oauthId));

            // Update OAuth info if user exists but was created with local auth
            if (user.getOauthProvider() == null) {
                user.setOauthProvider(provider);
                user.setOauthId(oauthId);
                userRepository.save(user);
            }

            // Generate JWT token
            String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

            // Redirect to frontend with token
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                    .queryParam("token", token)
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            // Redirect to frontend with error
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                    .queryParam("error", e.getMessage())
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
    }

    private String extractEmail(OAuth2User oauthUser, String provider) {
        if ("google".equals(provider)) {
            return oauthUser.getAttribute("email");
        } else if ("github".equals(provider)) {
            String email = oauthUser.getAttribute("email");
            // GitHub emails can be null if private
            if (email == null) {
                throw new IllegalStateException("Your GitHub email is private. Please go to GitHub Settings > Emails and uncheck 'Keep my email addresses private' to continue.");
            }
            return email;
        }
        throw new IllegalStateException("Unsupported OAuth provider: " + provider);
    }

    private String extractName(OAuth2User oauthUser, String provider) {
        if ("google".equals(provider)) {
            return oauthUser.getAttribute("name");
        } else if ("github".equals(provider)) {
            String name = oauthUser.getAttribute("name");
            return name != null ? name : oauthUser.getAttribute("login");
        }
        return "User";
    }

    private String extractOAuthId(OAuth2User oauthUser, String provider) {
        if ("google".equals(provider)) {
            return oauthUser.getAttribute("sub");
        } else if ("github".equals(provider)) {
            Integer id = oauthUser.getAttribute("id");
            return id != null ? id.toString() : null;
        }
        return null;
    }

    private User createNewOAuthUser(String email, String name, String provider, String oauthId) {
        String role = email.equalsIgnoreCase(adminEmail) ? "ROLE_ADMIN" : "ROLE_USER";

        User user = User.builder()
                .email(email)
                .username(name)
                .passwordHash("") // No password for OAuth users
                .role(role)
                .oauthProvider(provider)
                .oauthId(oauthId)
                .build();

        return userRepository.save(user);
    }
}
