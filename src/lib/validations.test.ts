import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema, coachMessageSchema } from "./validations";

describe("signupSchema", () => {
  it("validates correct signup data", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "123456",
      fullName: "João Silva",
      preferredName: "João",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({
      email: "invalid-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too long email", () => {
    const longEmail = "a".repeat(250) + "@test.com";
    const result = signupSchema.safeParse({
      email: longEmail,
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty optional fields", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("validates correct login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "mypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });
});

describe("coachMessageSchema", () => {
  it("validates correct message payload", () => {
    const result = coachMessageSchema.safeParse({
      messages: [{ role: "user", content: "Olá" }],
      stressLevel: "low",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages array", () => {
    const result = coachMessageSchema.safeParse({
      messages: [],
      stressLevel: "low",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid stress level", () => {
    const result = coachMessageSchema.safeParse({
      messages: [{ role: "user", content: "Test" }],
      stressLevel: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message content too long", () => {
    const result = coachMessageSchema.safeParse({
      messages: [{ role: "user", content: "a".repeat(2001) }],
      stressLevel: "moderate",
    });
    expect(result.success).toBe(false);
  });

  it("validates optional hrvValue within range", () => {
    const result = coachMessageSchema.safeParse({
      messages: [{ role: "assistant", content: "Resposta" }],
      stressLevel: "high",
      hrvValue: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects hrvValue out of range", () => {
    const result = coachMessageSchema.safeParse({
      messages: [{ role: "user", content: "Test" }],
      stressLevel: "low",
      hrvValue: 250,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = coachMessageSchema.safeParse({
      messages: [{ role: "system", content: "Test" }],
      stressLevel: "low",
    });
    expect(result.success).toBe(false);
  });
});
