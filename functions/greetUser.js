import { defineFlow } from "genkit";

export const greetUser = defineFlow("greetUser", async (input) => {
  const name = input?.name || "friend";
  return `Hello, ${name}! I'm your Genkit-powered agent.`;
});

