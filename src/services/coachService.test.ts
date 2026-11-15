import { describe, it, expect } from "vitest";
import { getInitialMessage, buildContext, exportConversation, CoachMessage } from "./coachService";

describe("getInitialMessage", () => {
  it("returns PNL anchor message for low stress without emojis", () => {
    // Arrange
    const stressLevel = "low";

    // Act
    const message = getInitialMessage(stressLevel);

    // Assert
    expect(message).toContain("Ancore");
    expect(message).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it("returns turnover message for moderate stress without emojis", () => {
    // Arrange
    const stressLevel = "moderate";

    // Act
    const message = getInitialMessage(stressLevel);

    // Assert
    expect(message).toContain("turnover");
    expect(message).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it("returns burnout alert for high stress without emojis", () => {
    // Arrange
    const stressLevel = "high";

    // Act
    const message = getInitialMessage(stressLevel);

    // Assert
    expect(message).toContain("burnout");
    expect(message).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it("returns scan prompt for unknown stress without emojis", () => {
    // Arrange
    const stressLevel = "unknown";

    // Act
    const message = getInitialMessage(stressLevel);

    // Assert
    expect(message).toContain("scan");
    expect(message).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});

describe("buildContext", () => {
  it("includes stress level", () => {
    const ctx = buildContext("high", "40");
    expect(ctx).toContain("high");
  });

  it("includes HRV value when valid", () => {
    const ctx = buildContext("low", "55");
    expect(ctx).toContain("55ms");
  });

  it("adds low HRV warning when < 30", () => {
    const ctx = buildContext("high", "20");
    expect(ctx).toContain("HRV baixa");
  });

  it("does not add warning when HRV >= 30", () => {
    const ctx = buildContext("low", "40");
    expect(ctx).not.toContain("HRV baixa");
  });

  it("handles non-numeric HRV gracefully", () => {
    const ctx = buildContext("low", "abc");
    expect(ctx).not.toContain("RMSSD");
  });
});

describe("exportConversation", () => {
  it("returns a Blob with text/plain type", () => {
    const messages: CoachMessage[] = [
      { role: "assistant", content: "Olá" },
      { role: "user", content: "Oi" },
    ];
    const blob = exportConversation(messages);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/plain");
  });

  it("formats messages with correct labels", async () => {
    const messages: CoachMessage[] = [
      { role: "assistant", content: "Hello" },
      { role: "user", content: "Hi" },
    ];
    const blob = exportConversation(messages);
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(blob);
    });
    expect(text).toContain("AstroAssist: Hello");
    expect(text).toContain("Você: Hi");
  });

  it("handles empty messages", () => {
    const blob = exportConversation([]);
    expect(blob.size).toBe(0);
  });
});
