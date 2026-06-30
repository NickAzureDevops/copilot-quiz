import { joinSession } from "@github/copilot-sdk/extension";

const CONTRACT_CONTEXT = [
    "You are working in pac-man-game, the event producer for pac-man-services.",
    "Only emit POST requests to http://localhost:3001/event.",
    "Allowed event types: scoreUpdated and achievementCandidate.",
    "Keep emitEvent fire-and-forget and swallow all network errors.",
    "Do not change gameplay, canvas rendering, controls, maze layout, or timing.",
].join(" ");

const session = await joinSession({
    hooks: {
        onSessionStart: async () => ({
            additionalContext: CONTRACT_CONTEXT,
        }),
        onUserPromptSubmitted: async (input) => {
            const prompt = input.prompt.toLowerCase();
            if (prompt.includes("pac-man-services") || prompt.includes("scoreupdated") || prompt.includes("achievementcandidate")) {
                return { additionalContext: CONTRACT_CONTEXT };
            }
        },
    },
    tools: [
        {
            name: "pac_man_services_contract",
            description: "Summarizes the Pac-Man event contract for pac-man-services.",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false,
            },
            handler: async () => CONTRACT_CONTEXT,
        },
    ],
});
