package com.campusfinds.springboot_backend;

import com.campusfinds.springboot_backend.model.ClaimStatus;
import com.campusfinds.springboot_backend.model.Item;
import com.campusfinds.springboot_backend.model.ItemClaim;
import com.campusfinds.springboot_backend.model.ItemStatus;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.model.UserStatus;
import com.campusfinds.springboot_backend.repository.ActivityLogRepository;
import com.campusfinds.springboot_backend.repository.ItemClaimRepository;
import com.campusfinds.springboot_backend.repository.ItemRepository;
import com.campusfinds.springboot_backend.repository.NotificationRepository;
import com.campusfinds.springboot_backend.repository.UserRepository;
import com.campusfinds.springboot_backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CampusFindApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemClaimRepository claimRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void cleanDatabase() {
        notificationRepository.deleteAllInBatch();
        activityLogRepository.deleteAllInBatch();
        claimRepository.deleteAllInBatch();
        itemRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    void healthRegistrationLoginAndMeWork() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.database").value("connected"));

        String registration = """
                {
                  "student_id":"2026-0001",
                  "fullname":"New Student",
                  "email":"new.student@campusfind.edu",
                  "password":"safe-password"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.student_id").value("2026-0001"))
                .andExpect(jsonPath("$.user.status").value("ACTIVE"))
                .andExpect(jsonPath("$.user.password").doesNotExist());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new.student@campusfind.edu","password":"safe-password"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        User user = userRepository.findByEmail("new.student@campusfind.edu").orElseThrow();
        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(user.getUserId()));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication is required."));
    }

    @Test
    void itemCrudStatusDashboardAndInvalidIdsWork() throws Exception {
        User reporter = createUser("student-1", "Reporter", "reporter@campusfind.edu", "student");
        String eventDate = LocalDate.now().toString();

        mockMvc.perform(post("/api/items")
                        .header("Authorization", bearer(reporter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(itemJson("Black wallet", "LOST", eventDate, null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.item.report_type").value("LOST"))
                .andExpect(jsonPath("$.item.status").value("OPEN"));

        Item item = itemRepository.findAll().get(0);
        mockMvc.perform(get("/api/items/{id}", item.getItemId())
                        .header("Authorization", bearer(reporter)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.item_name").value("Black wallet"));

        mockMvc.perform(put("/api/items/{id}", item.getItemId())
                        .header("Authorization", bearer(reporter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(itemJson("Black leather wallet", "LOST", eventDate, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.item_name").value("Black leather wallet"));

        mockMvc.perform(put("/api/items/{id}/status", item.getItemId())
                        .header("Authorization", bearer(reporter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));

        mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", bearer(reporter)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total_lost_items").value(1))
                .andExpect(jsonPath("$.recent_items[0].item_id").value(item.getItemId()));

        mockMvc.perform(delete("/api/items/{id}", item.getItemId())
                        .header("Authorization", bearer(reporter)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/items/{id}", item.getItemId())
                        .header("Authorization", bearer(reporter)))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/items")
                        .header("Authorization", bearer(reporter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"item_name":"X","category":"Other","description":"too short",
                                "location":"Library","event_date":"2026-01-01","report_type":"LOST"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.description").exists());
    }

    @Test
    void claimsPreventInvalidSubmissionsAndApprovalRejectsCompetitors() throws Exception {
        User finder = createUser("finder", "Finder", "finder@campusfind.edu", "student");
        User firstClaimant = createUser("claimant-1", "First Claimant", "claimant1@campusfind.edu", "student");
        User secondClaimant = createUser("claimant-2", "Second Claimant", "claimant2@campusfind.edu", "student");
        User lateClaimant = createUser("claimant-3", "Late Claimant", "claimant3@campusfind.edu", "student");
        User admin = createUser("admin", "Administrator", "admin@campusfind.edu", "admin");

        mockMvc.perform(post("/api/items/found")
                        .header("Authorization", bearer(finder))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(itemJson("Silver phone", null, LocalDate.now().toString(), "Good")))
                .andExpect(status().isCreated());
        Item item = itemRepository.findAll().get(0);

        mockMvc.perform(post("/api/claims")
                        .header("Authorization", bearer(finder))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(claimJson(item.getItemId(), "I reported this found item myself.")))
                .andExpect(status().isConflict());

        mockMvc.perform(post("/api/claims")
                        .header("Authorization", bearer(firstClaimant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(claimJson(item.getItemId(), "The lock screen has my dog and the case is cracked.")))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/claims")
                        .header("Authorization", bearer(secondClaimant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(claimJson(item.getItemId(), "I can identify the serial number and pairing account.")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/claims")
                        .header("Authorization", bearer(firstClaimant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(claimJson(item.getItemId(), "This duplicate claim must not be accepted.")))
                .andExpect(status().isConflict());

        ItemClaim selected = claimRepository.findAll().stream()
                .filter(claim -> claim.getClaimant().getUserId().equals(firstClaimant.getUserId()))
                .findFirst().orElseThrow();

        mockMvc.perform(put("/api/claims/{id}/approve", selected.getClaimId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"moderator_remarks\":\"Ownership details verified.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        assertThat(itemRepository.findById(item.getItemId()).orElseThrow().getStatus())
                .isEqualTo(ItemStatus.CLAIMED);
        assertThat(claimRepository.findAll()).extracting(ItemClaim::getStatus)
                .containsExactlyInAnyOrder(ClaimStatus.APPROVED, ClaimStatus.REJECTED);

        mockMvc.perform(post("/api/claims")
                        .header("Authorization", bearer(lateClaimant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(claimJson(item.getItemId(), "This item has already been awarded to someone.")))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/claims").header("Authorization", bearer(firstClaimant)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/claims").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].claim_id").exists());

        Long notificationId = notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(firstClaimant.getUserId()).get(0).getNotificationId();
        mockMvc.perform(patch("/api/notifications/{id}/read", notificationId)
                        .header("Authorization", bearer(firstClaimant)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));

        mockMvc.perform(get("/api/dashboard/summary").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pending_claims").value(0))
                .andExpect(jsonPath("$.approved_claims").value(1))
                .andExpect(jsonPath("$.rejected_claims").value(1));
    }

    @Test
    void adminUserRoutesAndItemOwnershipAreEnforced() throws Exception {
        User student = createUser("student", "Student", "student@campusfind.edu", "student");
        User otherStudent = createUser("other", "Other Student", "other@campusfind.edu", "student");
        User admin = createUser("admin", "Administrator", "admin@campusfind.edu", "admin");

        mockMvc.perform(get("/api/users").header("Authorization", bearer(student)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/users").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist());

        mockMvc.perform(post("/api/items/lost")
                        .header("Authorization", bearer(student))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(itemJson("Blue umbrella", null, LocalDate.now().toString(), null)))
                .andExpect(status().isCreated());
        Item item = itemRepository.findAll().get(0);

        mockMvc.perform(delete("/api/items/{id}", item.getItemId())
                        .header("Authorization", bearer(otherStudent)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/items/{id}", item.getItemId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isNoContent());
    }

    private User createUser(String studentId, String fullname, String email, String role) {
        User user = new User(studentId, fullname, email, "unused-test-password", role);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.saveAndFlush(user);
    }

    private String bearer(User user) {
        return "Bearer " + jwtUtil.generateToken(user);
    }

    private static String itemJson(String name, String reportType, String eventDate, String condition) {
        String typeField = reportType == null ? "" : ",\"report_type\":\"" + reportType + "\"";
        String foundFields = condition == null ? "" : ",\"condition\":\"" + condition
                + "\",\"storage_location\":\"Student Affairs desk\"";
        return "{\"item_name\":\"" + name + "\",\"category\":\"General\","
                + "\"description\":\"A detailed description long enough for reliable identification.\","
                + "\"location\":\"Campus library\",\"event_date\":\"" + eventDate + "\""
                + typeField + foundFields + "}";
    }

    private static String claimJson(Long itemId, String reason) {
        return "{\"item_id\":" + itemId + ",\"reason\":\"" + reason + "\"}";
    }
}
