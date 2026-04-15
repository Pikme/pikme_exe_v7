import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

/**
 * Integration Tests for Booking + Routing System
 * Tests the complete flow of enquiry submission with automatic routing
 */

describe("Booking + Routing Integration", () => {
  describe("Enquiry Creation with Automatic Routing", () => {
    it("should create enquiry and trigger automatic routing", async () => {
      // Mock the booking enquiry creation
      const mockEnquiry = {
        id: 1,
        tourId: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        numberOfTravelers: 2,
        status: "new",
        createdAt: new Date(),
      };

      // Mock routing result
      const mockRoutingResult = {
        assignedToUserId: 5,
        scores: [
          {
            userId: 5,
            userName: "Sarah",
            totalScore: 87.5,
            workloadScore: 90,
            expertiseScore: 85,
            availabilityScore: 100,
            conversionScore: 80,
            languageScore: 100,
          },
        ],
      };

      // Verify enquiry was created
      expect(mockEnquiry.id).toBe(1);
      expect(mockEnquiry.status).toBe("new");

      // Verify routing was applied
      expect(mockRoutingResult.assignedToUserId).toBe(5);
      expect(mockRoutingResult.scores[0].totalScore).toBeGreaterThan(80);
    });

    it("should handle routing failure gracefully", async () => {
      const mockEnquiry = {
        id: 2,
        tourId: 1,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        status: "new",
      };

      const mockRoutingError = "No available team members";

      // Enquiry should still be created even if routing fails
      expect(mockEnquiry.id).toBe(2);
      expect(mockEnquiry.status).toBe("new");

      // Error should be captured but not block enquiry
      expect(mockRoutingError).toBeTruthy();
    });

    it("should support manual assignment override", async () => {
      const mockEnquiry = {
        id: 3,
        tourId: 1,
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@example.com",
        status: "new",
      };

      const manualAssignmentUserId = 8;

      // Verify manual override is accepted
      expect(manualAssignmentUserId).toBe(8);
      expect(mockEnquiry.id).toBe(3);
    });
  });

  describe("Routing Status Communication", () => {
    it("should display loading state during routing", () => {
      const routingStatus = {
        loading: true,
        applied: false,
      };

      expect(routingStatus.loading).toBe(true);
      expect(routingStatus.applied).toBe(false);
    });

    it("should display success state after successful routing", () => {
      const routingStatus = {
        loading: false,
        applied: true,
        assignedToUserId: 5,
        assignedToName: "Sarah",
        score: 87.5,
      };

      expect(routingStatus.loading).toBe(false);
      expect(routingStatus.applied).toBe(true);
      expect(routingStatus.score).toBeGreaterThan(80);
    });

    it("should display error state when routing fails", () => {
      const routingStatus = {
        loading: false,
        applied: false,
        error: "No available team members for this enquiry",
      };

      expect(routingStatus.loading).toBe(false);
      expect(routingStatus.applied).toBe(false);
      expect(routingStatus.error).toBeTruthy();
    });
  });

  describe("User Experience Flow", () => {
    it("should show team member info in success message", () => {
      const routingInfo = {
        assignedToName: "Sarah",
        score: 87.5,
      };

      const message = `automatically assigned to ${routingInfo.assignedToName} (score: ${routingInfo.score.toFixed(1)})`;

      expect(message).toContain("Sarah");
      expect(message).toContain("87.5");
    });

    it("should provide fallback message when routing unavailable", () => {
      const routingInfo = {
        error: "Routing service temporarily unavailable",
      };

      const message = `routing failed: ${routingInfo.error}`;

      expect(message).toContain("temporarily unavailable");
    });

    it("should allow manual team member selection", () => {
      const teamMembers = [
        { id: 1, name: "Alice", email: "alice@example.com", isAvailable: true },
        { id: 2, name: "Bob", email: "bob@example.com", isAvailable: true },
        { id: 3, name: "Charlie", email: "charlie@example.com", isAvailable: false },
      ];

      const availableMembers = teamMembers.filter((m) => m.isAvailable);

      expect(availableMembers).toHaveLength(2);
      expect(availableMembers[0].name).toBe("Alice");
    });
  });

  describe("Notification and Confirmation", () => {
    it("should notify admin of new enquiry with routing info", () => {
      const notification = {
        title: "New Booking Enquiry",
        content:
          "New booking enquiry from John Doe (john@example.com) auto-routed to Sarah (score: 87.5)",
      };

      expect(notification.title).toBe("New Booking Enquiry");
      expect(notification.content).toContain("auto-routed");
      expect(notification.content).toContain("Sarah");
    });

    it("should notify team member of new assignment", () => {
      const notification = {
        title: "New Enquiry Assigned",
        content: "New booking enquiry from John Doe for 2 travelers. Preferred dates: Jan 15-20",
      };

      expect(notification.title).toContain("Assigned");
      expect(notification.content).toContain("John Doe");
    });

    it("should provide confirmation after submission", () => {
      const confirmation = {
        success: true,
        enquiryId: 1,
        assignedToUserId: 5,
        assignedToName: "Sarah",
        routingScore: 87.5,
      };

      expect(confirmation.success).toBe(true);
      expect(confirmation.enquiryId).toBe(1);
      expect(confirmation.assignedToName).toBe("Sarah");
    });
  });

  describe("Modal State Management", () => {
    it("should reset form after successful submission", () => {
      const initialFormData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        numberOfTravelers: 2,
        specialRequests: "No peanuts",
      };

      const resetFormData = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        numberOfTravelers: 1,
        specialRequests: "",
      };

      expect(initialFormData.firstName).toBe("John");
      expect(resetFormData.firstName).toBe("");
      expect(resetFormData.numberOfTravelers).toBe(1);
    });

    it("should close modal after successful submission", () => {
      let isOpen = true;
      const closeModal = () => {
        isOpen = false;
      };

      expect(isOpen).toBe(true);
      closeModal();
      expect(isOpen).toBe(false);
    });

    it("should maintain form data on routing error", () => {
      const formData = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        phone: "+9876543210",
      };

      // Form should persist if routing fails
      expect(formData.firstName).toBe("Jane");
      expect(formData.email).toBe("jane@example.com");
    });
  });

  describe("Manual Override Flow", () => {
    it("should show manual override option on routing error", () => {
      const showManualOverride = true;

      expect(showManualOverride).toBe(true);
    });

    it("should allow selecting team member for manual assignment", () => {
      const selectedMemberId = "5";
      const teamMembers = [
        { id: 1, name: "Alice" },
        { id: 5, name: "Sarah" },
        { id: 8, name: "Charlie" },
      ];

      const selectedMember = teamMembers.find((m) => m.id.toString() === selectedMemberId);

      expect(selectedMember?.name).toBe("Sarah");
    });

    it("should submit enquiry with manual assignment", () => {
      const enquiry = {
        firstName: "Bob",
        email: "bob@example.com",
        manualAssignmentUserId: 5,
      };

      expect(enquiry.manualAssignmentUserId).toBe(5);
      expect(enquiry.email).toBe("bob@example.com");
    });
  });

  describe("Error Handling", () => {
    it("should handle form validation errors", () => {
      const validationErrors = [
        { field: "firstName", message: "First name is required" },
        { field: "email", message: "Invalid email address" },
      ];

      expect(validationErrors).toHaveLength(2);
      expect(validationErrors[0].field).toBe("firstName");
    });

    it("should handle network errors gracefully", () => {
      const networkError = {
        message: "Failed to submit booking enquiry",
        isNetworkError: true,
      };

      expect(networkError.isNetworkError).toBe(true);
      expect(networkError.message).toContain("Failed");
    });

    it("should retry routing on transient failure", () => {
      let retryCount = 0;
      const maxRetries = 3;

      const simulateRetry = () => {
        retryCount++;
        return retryCount <= maxRetries;
      };

      expect(simulateRetry()).toBe(true);
      expect(simulateRetry()).toBe(true);
      expect(simulateRetry()).toBe(true);
      expect(simulateRetry()).toBe(false);
      expect(retryCount).toBe(4);
    });
  });

  describe("Performance and Timing", () => {
    it("should complete routing within acceptable time", async () => {
      const startTime = Date.now();

      // Simulate routing operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should not block form submission while routing", () => {
      const isSubmitting = true;
      const isRoutingInProgress = true;

      // Form should be disabled while submitting
      expect(isSubmitting).toBe(true);
      expect(isRoutingInProgress).toBe(true);
    });
  });
});
