import { z } from "zod";

export const sessionIdParamSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

const messageSchema = z.preprocess((value) => {
  // Already a string
  if (typeof value === "string") {
    return value;
  }

  // Handle objects coming from the frontend
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    // { message: "..." }
    if (typeof obj.message === "string") {
      return obj.message;
    }

    // { content: "..." }
    if (typeof obj.content === "string") {
      return obj.content;
    }

    // { text: "..." }
    if (typeof obj.text === "string") {
      return obj.text;
    }

    // { answer: "..." }
    if (typeof obj.answer === "string") {
      return obj.answer;
    }

    // Nested forms:
    // { message: { content: "..." } }
    // { message: { text: "..." } }
    if (obj.message && typeof obj.message === "object") {
      const nested = obj.message as Record<string, unknown>;

      if (typeof nested.content === "string") {
        return nested.content;
      }

      if (typeof nested.text === "string") {
        return nested.text;
      }

      if (typeof nested.message === "string") {
        return nested.message;
      }
    }
  }

  return value;
}, z.string().min(1, "message cannot be empty").max(5000, "message is too long"));

export const sendMessageSchema = z.object({
  questionId: z.string().min(1, "questionId is required"),
  message: messageSchema,
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;