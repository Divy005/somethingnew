import { generateText } from "ai";

/**
 * Vercel AI Gateway example.
 *
 * The AI SDK reads AI_GATEWAY_API_KEY from the environment and routes the
 * `provider/model` string through the Gateway, so no provider SDK or explicit
 * client setup is needed here.
 *
 * Run it with:  npm run ai:example
 */
async function main() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    console.error(
      "AI_GATEWAY_API_KEY is not set.\n" +
        "Add it to .env.local (that file is git-ignored) and re-run.",
    );
    process.exit(1);
  }

  const { text } = await generateText({
    model: "openai/gpt-5.5",
    prompt: "Invent a new holiday and describe its traditions.",
  });

  console.log(text);
}

main().catch((error: unknown) => {
  // Log the message only — never the full error object, which can carry
  // request headers.
  console.error(
    "Request failed:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});
