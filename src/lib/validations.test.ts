import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  coachMessageSchema,
  getSignupSchema,
  getLoginSchema,
  getProfileSchema,
  getPasswordSchema,
  getCoachMessageSchema,
} from "./validations";
import { translate } from "@/i18n";

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

  it("rejects invalid email with default Portuguese error", () => {
    const result = signupSchema.safeParse({
      email: "invalid-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email inválido");
    }
  });

  it("rejects short password with default Portuguese error", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senha deve ter no mínimo 6 caracteres");
    }
  });

  it("rejects too long email", () => {
    const longEmail = "a".repeat(250) + "@test.com";
    const result = signupSchema.safeParse({
      email: longEmail,
      password: "123456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email muito longo");
    }
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

  it("rejects empty password with default Portuguese error", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senha obrigatória");
    }
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email inválido");
    }
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
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Pelo menos uma mensagem é necessária");
    }
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
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Mensagem muito longa");
    }
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

describe("i18n translated schemas", () => {
  const enT = (key: string, vars?: Record<string, string | number>) => translate('en', key, vars);
  const ptT = (key: string, vars?: Record<string, string | number>) => translate('pt', key, vars);

  it("produces English validation errors for getSignupSchema", () => {
    const schemaEn = getSignupSchema(enT);
    const result = schemaEn.safeParse({
      email: "invalid-email",
      password: "123",
      fullName: "a".repeat(101),
      preferredName: "b".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      expect(messages).toContain("Invalid email");
      expect(messages).toContain("Password must be at least 6 characters");
      expect(messages).toContain("Name too long");
      expect(messages).toContain("Preferred name too long");
    }
  });

  it("produces Portuguese validation errors for getSignupSchema", () => {
    const schemaPt = getSignupSchema(ptT);
    const result = schemaPt.safeParse({
      email: "invalid-email",
      password: "123",
      fullName: "a".repeat(101),
      preferredName: "b".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      expect(messages).toContain("Email inválido");
      expect(messages).toContain("Senha deve ter no mínimo 6 caracteres");
      expect(messages).toContain("Nome muito longo");
      expect(messages).toContain("Apelido muito longo");
    }
  });

  it("produces English validation errors for getLoginSchema", () => {
    const schemaEn = getLoginSchema(enT);
    const result = schemaEn.safeParse({
      email: "invalid-email",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      expect(messages).toContain("Invalid email");
      expect(messages).toContain("Password is required");
    }
  });

  it("produces English validation errors for getProfileSchema", () => {
    const schemaEn = getProfileSchema(enT);
    const result = schemaEn.safeParse({
      fullName: "a".repeat(101),
      preferredName: "b".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      expect(messages).toContain("Name too long");
      expect(messages).toContain("Preferred name too long");
    }
  });

  it("produces English validation errors for getPasswordSchema", () => {
    const schemaEn = getPasswordSchema(enT);
    const resultShort = schemaEn.safeParse({
      password: "123",
      confirmPassword: "123",
    });
    expect(resultShort.success).toBe(false);
    if (!resultShort.success) {
      expect(resultShort.error.issues[0].message).toBe("Password must be at least 6 characters");
    }

    const resultMismatch = schemaEn.safeParse({
      password: "password123",
      confirmPassword: "password456",
    });
    expect(resultMismatch.success).toBe(false);
    if (!resultMismatch.success) {
      expect(resultMismatch.error.issues[0].message).toBe("Passwords do not match");
    }
  });

  it("produces English validation errors for getCoachMessageSchema", () => {
    const schemaEn = getCoachMessageSchema(enT);
    const resultEmpty = schemaEn.safeParse({
      messages: [],
      stressLevel: "low",
    });
    expect(resultEmpty.success).toBe(false);
    if (!resultEmpty.success) {
      expect(resultEmpty.error.issues[0].message).toBe("At least one message is required");
    }

    const resultEmptyContent = schemaEn.safeParse({
      messages: [{ role: "user", content: "" }],
      stressLevel: "low",
    });
    expect(resultEmptyContent.success).toBe(false);
    if (!resultEmptyContent.success) {
      expect(resultEmptyContent.error.issues[0].message).toBe("Message cannot be empty");
    }
  });
});
