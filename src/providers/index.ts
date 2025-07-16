import { OpenAIProvider } from "./openai";
import { ClaudeProvider } from "./claude";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";
import { AIProvider, AIProviderConfig } from "./types";

export * from "./types";
export { OpenAIProvider, ClaudeProvider, GeminiProvider, OllamaProvider };

export type ProviderType = "openai" | "claude" | "gemini" | "ollama";

export interface ProviderInfo {
	id: ProviderType;
	name: string;
	supportsImageGeneration: boolean;
	requiresApiKey: boolean;
	configFields: {
		key: string;
		label: string;
		type: "text" | "password" | "url";
		required: boolean;
		placeholder?: string;
	}[];
}

export const PROVIDERS: Record<ProviderType, ProviderInfo> = {
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
				placeholder: "https://generativelanguage.googleapis.com/v1beta/models",
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

export function createProvider(type: ProviderType, config: AIProviderConfig): AIProvider {
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

export function getProviderInfo(type: ProviderType): ProviderInfo {
	return PROVIDERS[type];
}