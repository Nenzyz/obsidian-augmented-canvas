import { OpenAIProvider } from "./openai";
import { ClaudeProvider } from "./claude";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";
export * from "./types";
export { OpenAIProvider, ClaudeProvider, GeminiProvider, OllamaProvider };
export const PROVIDERS = {
    openai: {
        id: "openai",
        name: "OpenAI",
        supportsImageGeneration: true,
        requiresApiKey: true,
        configFields: [
            {
                key: "apiKey",
                label: "API Key",
                type: "password",
                required: true,
                placeholder: "sk-...",
            },
        ],
    },
    claude: {
        id: "claude",
        name: "Claude (Anthropic)",
        supportsImageGeneration: false,
        requiresApiKey: true,
        configFields: [
            {
                key: "apiKey",
                label: "API Key",
                type: "password",
                required: true,
                placeholder: "sk-ant-...",
            },
            {
                key: "baseUrl",
                label: "Base URL (optional)",
                type: "url",
                required: false,
                placeholder: "https://api.anthropic.com",
            },
        ],
    },
    gemini: {
        id: "gemini",
        name: "Gemini (Google)",
        supportsImageGeneration: false,
        requiresApiKey: true,
        configFields: [
            {
                key: "apiKey",
                label: "API Key",
                type: "password",
                required: true,
                placeholder: "AIza...",
            },
            {
                key: "baseUrl",
                label: "Base URL (optional)",
                type: "url",
                required: false,
                placeholder: "https://generativelanguage.googleapis.com",
            },
        ],
    },
    ollama: {
        id: "ollama",
        name: "Ollama (Local)",
        supportsImageGeneration: false,
        requiresApiKey: false,
        configFields: [
            {
                key: "baseUrl",
                label: "Base URL",
                type: "url",
                required: true,
                placeholder: "http://localhost:11434",
            },
        ],
    },
};
export function createProvider(type, config) {
    switch (type) {
        case "openai":
            return new OpenAIProvider(config);
        case "claude":
            return new ClaudeProvider(config);
        case "gemini":
            return new GeminiProvider(config);
        case "ollama":
            return new OllamaProvider(config);
        default:
            throw new Error(`Unknown provider type: ${type}`);
    }
}
export function getProviderInfo(type) {
    return PROVIDERS[type];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDMUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMxQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRzFDLGNBQWMsU0FBUyxDQUFDO0FBQ3hCLE9BQU8sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsQ0FBQztBQWtCMUUsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUF1QztJQUM1RCxNQUFNLEVBQUU7UUFDUCxFQUFFLEVBQUUsUUFBUTtRQUNaLElBQUksRUFBRSxRQUFRO1FBQ2QsdUJBQXVCLEVBQUUsSUFBSTtRQUM3QixjQUFjLEVBQUUsSUFBSTtRQUNwQixZQUFZLEVBQUU7WUFDYjtnQkFDQyxHQUFHLEVBQUUsUUFBUTtnQkFDYixLQUFLLEVBQUUsU0FBUztnQkFDaEIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFdBQVcsRUFBRSxRQUFRO2FBQ3JCO1NBQ0Q7S0FDRDtJQUNELE1BQU0sRUFBRTtRQUNQLEVBQUUsRUFBRSxRQUFRO1FBQ1osSUFBSSxFQUFFLG9CQUFvQjtRQUMxQix1QkFBdUIsRUFBRSxLQUFLO1FBQzlCLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLFlBQVksRUFBRTtZQUNiO2dCQUNDLEdBQUcsRUFBRSxRQUFRO2dCQUNiLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsV0FBVyxFQUFFLFlBQVk7YUFDekI7WUFDRDtnQkFDQyxHQUFHLEVBQUUsU0FBUztnQkFDZCxLQUFLLEVBQUUscUJBQXFCO2dCQUM1QixJQUFJLEVBQUUsS0FBSztnQkFDWCxRQUFRLEVBQUUsS0FBSztnQkFDZixXQUFXLEVBQUUsMkJBQTJCO2FBQ3hDO1NBQ0Q7S0FDRDtJQUNELE1BQU0sRUFBRTtRQUNQLEVBQUUsRUFBRSxRQUFRO1FBQ1osSUFBSSxFQUFFLGlCQUFpQjtRQUN2Qix1QkFBdUIsRUFBRSxLQUFLO1FBQzlCLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLFlBQVksRUFBRTtZQUNiO2dCQUNDLEdBQUcsRUFBRSxRQUFRO2dCQUNiLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsV0FBVyxFQUFFLFNBQVM7YUFDdEI7WUFDRDtnQkFDQyxHQUFHLEVBQUUsU0FBUztnQkFDZCxLQUFLLEVBQUUscUJBQXFCO2dCQUM1QixJQUFJLEVBQUUsS0FBSztnQkFDWCxRQUFRLEVBQUUsS0FBSztnQkFDZixXQUFXLEVBQUUsMkNBQTJDO2FBQ3hEO1NBQ0Q7S0FDRDtJQUNELE1BQU0sRUFBRTtRQUNQLEVBQUUsRUFBRSxRQUFRO1FBQ1osSUFBSSxFQUFFLGdCQUFnQjtRQUN0Qix1QkFBdUIsRUFBRSxLQUFLO1FBQzlCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLFlBQVksRUFBRTtZQUNiO2dCQUNDLEdBQUcsRUFBRSxTQUFTO2dCQUNkLEtBQUssRUFBRSxVQUFVO2dCQUNqQixJQUFJLEVBQUUsS0FBSztnQkFDWCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxXQUFXLEVBQUUsd0JBQXdCO2FBQ3JDO1NBQ0Q7S0FDRDtDQUNELENBQUM7QUFFRixNQUFNLFVBQVUsY0FBYyxDQUFDLElBQWtCLEVBQUUsTUFBd0I7SUFDMUUsUUFBUSxJQUFJLEVBQUU7UUFDYixLQUFLLFFBQVE7WUFDWixPQUFPLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLEtBQUssUUFBUTtZQUNaLE9BQU8sSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsS0FBSyxRQUFRO1lBQ1osT0FBTyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxLQUFLLFFBQVE7WUFDWixPQUFPLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DO1lBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUNuRDtBQUNGLENBQUM7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUFDLElBQWtCO0lBQ2pELE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcGVuQUlQcm92aWRlciB9IGZyb20gXCIuL29wZW5haVwiO1xuaW1wb3J0IHsgQ2xhdWRlUHJvdmlkZXIgfSBmcm9tIFwiLi9jbGF1ZGVcIjtcbmltcG9ydCB7IEdlbWluaVByb3ZpZGVyIH0gZnJvbSBcIi4vZ2VtaW5pXCI7XG5pbXBvcnQgeyBPbGxhbWFQcm92aWRlciB9IGZyb20gXCIuL29sbGFtYVwiO1xuaW1wb3J0IHsgQUlQcm92aWRlciwgQUlQcm92aWRlckNvbmZpZyB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzXCI7XG5leHBvcnQgeyBPcGVuQUlQcm92aWRlciwgQ2xhdWRlUHJvdmlkZXIsIEdlbWluaVByb3ZpZGVyLCBPbGxhbWFQcm92aWRlciB9O1xuXG5leHBvcnQgdHlwZSBQcm92aWRlclR5cGUgPSBcIm9wZW5haVwiIHwgXCJjbGF1ZGVcIiB8IFwiZ2VtaW5pXCIgfCBcIm9sbGFtYVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb3ZpZGVySW5mbyB7XG5cdGlkOiBQcm92aWRlclR5cGU7XG5cdG5hbWU6IHN0cmluZztcblx0c3VwcG9ydHNJbWFnZUdlbmVyYXRpb246IGJvb2xlYW47XG5cdHJlcXVpcmVzQXBpS2V5OiBib29sZWFuO1xuXHRjb25maWdGaWVsZHM6IHtcblx0XHRrZXk6IHN0cmluZztcblx0XHRsYWJlbDogc3RyaW5nO1xuXHRcdHR5cGU6IFwidGV4dFwiIHwgXCJwYXNzd29yZFwiIHwgXCJ1cmxcIjtcblx0XHRyZXF1aXJlZDogYm9vbGVhbjtcblx0XHRwbGFjZWhvbGRlcj86IHN0cmluZztcblx0fVtdO1xufVxuXG5leHBvcnQgY29uc3QgUFJPVklERVJTOiBSZWNvcmQ8UHJvdmlkZXJUeXBlLCBQcm92aWRlckluZm8+ID0ge1xuXHRvcGVuYWk6IHtcblx0XHRpZDogXCJvcGVuYWlcIixcblx0XHRuYW1lOiBcIk9wZW5BSVwiLFxuXHRcdHN1cHBvcnRzSW1hZ2VHZW5lcmF0aW9uOiB0cnVlLFxuXHRcdHJlcXVpcmVzQXBpS2V5OiB0cnVlLFxuXHRcdGNvbmZpZ0ZpZWxkczogW1xuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IFwiYXBpS2V5XCIsXG5cdFx0XHRcdGxhYmVsOiBcIkFQSSBLZXlcIixcblx0XHRcdFx0dHlwZTogXCJwYXNzd29yZFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRcdFx0cGxhY2Vob2xkZXI6IFwic2stLi4uXCIsXG5cdFx0XHR9LFxuXHRcdF0sXG5cdH0sXG5cdGNsYXVkZToge1xuXHRcdGlkOiBcImNsYXVkZVwiLFxuXHRcdG5hbWU6IFwiQ2xhdWRlIChBbnRocm9waWMpXCIsXG5cdFx0c3VwcG9ydHNJbWFnZUdlbmVyYXRpb246IGZhbHNlLFxuXHRcdHJlcXVpcmVzQXBpS2V5OiB0cnVlLFxuXHRcdGNvbmZpZ0ZpZWxkczogW1xuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IFwiYXBpS2V5XCIsXG5cdFx0XHRcdGxhYmVsOiBcIkFQSSBLZXlcIixcblx0XHRcdFx0dHlwZTogXCJwYXNzd29yZFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRcdFx0cGxhY2Vob2xkZXI6IFwic2stYW50LS4uLlwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBcImJhc2VVcmxcIixcblx0XHRcdFx0bGFiZWw6IFwiQmFzZSBVUkwgKG9wdGlvbmFsKVwiLFxuXHRcdFx0XHR0eXBlOiBcInVybFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogZmFsc2UsXG5cdFx0XHRcdHBsYWNlaG9sZGVyOiBcImh0dHBzOi8vYXBpLmFudGhyb3BpYy5jb21cIixcblx0XHRcdH0sXG5cdFx0XSxcblx0fSxcblx0Z2VtaW5pOiB7XG5cdFx0aWQ6IFwiZ2VtaW5pXCIsXG5cdFx0bmFtZTogXCJHZW1pbmkgKEdvb2dsZSlcIixcblx0XHRzdXBwb3J0c0ltYWdlR2VuZXJhdGlvbjogZmFsc2UsXG5cdFx0cmVxdWlyZXNBcGlLZXk6IHRydWUsXG5cdFx0Y29uZmlnRmllbGRzOiBbXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogXCJhcGlLZXlcIixcblx0XHRcdFx0bGFiZWw6IFwiQVBJIEtleVwiLFxuXHRcdFx0XHR0eXBlOiBcInBhc3N3b3JkXCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdFx0XHRwbGFjZWhvbGRlcjogXCJBSXphLi4uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IFwiYmFzZVVybFwiLFxuXHRcdFx0XHRsYWJlbDogXCJCYXNlIFVSTCAob3B0aW9uYWwpXCIsXG5cdFx0XHRcdHR5cGU6IFwidXJsXCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZSxcblx0XHRcdFx0cGxhY2Vob2xkZXI6IFwiaHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb21cIixcblx0XHRcdH0sXG5cdFx0XSxcblx0fSxcblx0b2xsYW1hOiB7XG5cdFx0aWQ6IFwib2xsYW1hXCIsXG5cdFx0bmFtZTogXCJPbGxhbWEgKExvY2FsKVwiLFxuXHRcdHN1cHBvcnRzSW1hZ2VHZW5lcmF0aW9uOiBmYWxzZSxcblx0XHRyZXF1aXJlc0FwaUtleTogZmFsc2UsXG5cdFx0Y29uZmlnRmllbGRzOiBbXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogXCJiYXNlVXJsXCIsXG5cdFx0XHRcdGxhYmVsOiBcIkJhc2UgVVJMXCIsXG5cdFx0XHRcdHR5cGU6IFwidXJsXCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdFx0XHRwbGFjZWhvbGRlcjogXCJodHRwOi8vbG9jYWxob3N0OjExNDM0XCIsXG5cdFx0XHR9LFxuXHRcdF0sXG5cdH0sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvdmlkZXIodHlwZTogUHJvdmlkZXJUeXBlLCBjb25maWc6IEFJUHJvdmlkZXJDb25maWcpOiBBSVByb3ZpZGVyIHtcblx0c3dpdGNoICh0eXBlKSB7XG5cdFx0Y2FzZSBcIm9wZW5haVwiOlxuXHRcdFx0cmV0dXJuIG5ldyBPcGVuQUlQcm92aWRlcihjb25maWcpO1xuXHRcdGNhc2UgXCJjbGF1ZGVcIjpcblx0XHRcdHJldHVybiBuZXcgQ2xhdWRlUHJvdmlkZXIoY29uZmlnKTtcblx0XHRjYXNlIFwiZ2VtaW5pXCI6XG5cdFx0XHRyZXR1cm4gbmV3IEdlbWluaVByb3ZpZGVyKGNvbmZpZyk7XG5cdFx0Y2FzZSBcIm9sbGFtYVwiOlxuXHRcdFx0cmV0dXJuIG5ldyBPbGxhbWFQcm92aWRlcihjb25maWcpO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvdmlkZXIgdHlwZTogJHt0eXBlfWApO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm92aWRlckluZm8odHlwZTogUHJvdmlkZXJUeXBlKTogUHJvdmlkZXJJbmZvIHtcblx0cmV0dXJuIFBST1ZJREVSU1t0eXBlXTtcbn0iXX0=