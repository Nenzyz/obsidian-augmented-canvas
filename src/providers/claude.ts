import { request, RequestUrlParam } from "obsidian";
import { logDebug } from "src/logDebug";
import { AIProvider, AIModel, AIMessage, StreamChunk, GenerateOptions, ImageGenerateOptions, AIProviderConfig } from "./types";

export interface ClaudeConfig extends AIProviderConfig {
	baseUrl?: string;
}

export class ClaudeProvider extends AIProvider {
	name = "Claude";
	private baseUrl: string;

	constructor(config: ClaudeConfig) {
		super(config);
		this.baseUrl = config.baseUrl || "https://api.anthropic.com";
	}

	async getModels(): Promise<AIModel[]> {
		return this.getStaticModels();
	}

	async getChatModels(): Promise<AIModel[]> {
		return this.getStaticModels();
	}

	async getImageModels(): Promise<AIModel[]> {
		return []; // Claude doesn't support image generation
	}

	private getStaticModels(): AIModel[] {
		return [
			{
				id: "claude-3-5-sonnet-20241022",
				name: "Claude 3.5 Sonnet",
				tokenLimit: 200000,
				supportsStreaming: true,
			},
			{
				id: "claude-3-5-haiku-20241022",
				name: "Claude 3.5 Haiku",
				tokenLimit: 200000,
				supportsStreaming: true,
			},
			{
				id: "claude-3-opus-20240229",
				name: "Claude 3 Opus",
				tokenLimit: 200000,
				supportsStreaming: true,
			},
		];
	}

	async generateResponse(messages: AIMessage[], options: GenerateOptions = {}): Promise<string> {
		const systemMessage = messages.find(m => m.role === "system");
		const userMessages = messages.filter(m => m.role !== "system");

		logDebug("Calling Claude:", {
			messages: userMessages,
			system: systemMessage?.content,
			model: options.model,
			max_tokens: options.maxTokens,
			temperature: options.temperature,
		});

		const requestParam: RequestUrlParam = {
			url: `${this.baseUrl}/v1/messages`,
			method: "POST",
			contentType: "application/json",
			headers: {
				"x-api-key": this.config.apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: options.model || "claude-3-5-sonnet-20241022",
				max_tokens: options.maxTokens || 4096,
				temperature: options.temperature,
				system: systemMessage?.content,
				messages: userMessages.map(msg => ({
					role: msg.role === "assistant" ? "assistant" : "user",
					content: msg.content,
				})),
			}),
		};

		try {
			const response = await request(requestParam);
			const data = JSON.parse(response);
			
			if (data.error) {
				throw new Error(`Claude API error: ${data.error.message}`);
			}

			return data.content[0].text;
		} catch (err) {
			logDebug('Claude API error:', err);
			throw err;
		}
	}

	async streamResponse(
		messages: AIMessage[], 
		options: GenerateOptions, 
		onChunk: (chunk: StreamChunk) => void
	): Promise<void> {
		const systemMessage = messages.find(m => m.role === "system");
		const userMessages = messages.filter(m => m.role !== "system");

		logDebug("Calling Claude stream:", {
			messages: userMessages,
			system: systemMessage?.content,
			model: options.model,
			max_tokens: options.maxTokens,
			temperature: options.temperature,
		});

		const response = await fetch(`${this.baseUrl}/v1/messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.config.apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: options.model || "claude-3-5-sonnet-20241022",
				max_tokens: options.maxTokens || 4096,
				temperature: options.temperature,
				system: systemMessage?.content,
				messages: userMessages.map(msg => ({
					role: msg.role === "assistant" ? "assistant" : "user",
					content: msg.content,
				})),
				stream: true,
			}),
		});

		if (!response.ok) {
			throw new Error(`Claude API error: ${response.statusText}`);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("No response body");
		}

		const decoder = new TextDecoder();
		let buffer = "";

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						if (data === "[DONE]") {
							onChunk({ content: "", done: true });
							return;
						}

						try {
							const parsed = JSON.parse(data);
							if (parsed.type === "content_block_delta") {
								onChunk({ content: parsed.delta.text || "", done: false });
							}
						} catch (e) {
							// Skip invalid JSON
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}

		onChunk({ content: "", done: true });
	}

	async generateImage(prompt: string, options: ImageGenerateOptions = {}): Promise<string> {
		throw new Error("Claude does not support image generation");
	}
}