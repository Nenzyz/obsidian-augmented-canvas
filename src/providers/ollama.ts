import { request, RequestUrlParam } from "obsidian";
import { logDebug } from "src/logDebug";
import { AIProvider, AIModel, AIMessage, StreamChunk, GenerateOptions, ImageGenerateOptions, AIProviderConfig } from "./types";

export interface OllamaConfig extends AIProviderConfig {
	baseUrl?: string;
}

export class OllamaProvider extends AIProvider {
	name = "Ollama";
	private baseUrl: string;

	constructor(config: OllamaConfig) {
		super(config);
		this.baseUrl = config.baseUrl || "http://localhost:11434";
	}

	async getModels(): Promise<AIModel[]> {
		try {
			const requestParam: RequestUrlParam = {
				url: `${this.baseUrl}/api/tags`,
				method: 'GET'
			};
			
			const response = await request(requestParam);
			const data = JSON.parse(response);
			
			return data.models.map((model: any) => ({
				id: model.name,
				name: model.name,
				tokenLimit: model.details?.parameter_size ? undefined : 4096,
				supportsStreaming: true,
			}));
		} catch (error) {
			logDebug("Failed to fetch Ollama models", error);
			return this.getStaticModels();
		}
	}

	async getChatModels(): Promise<AIModel[]> {
		return this.getModels();
	}

	async getImageModels(): Promise<AIModel[]> {
		return []; // Ollama doesn't support image generation
	}

	private getStaticModels(): AIModel[] {
		return [
			{
				id: "llama3.2",
				name: "Llama 3.2",
				supportsStreaming: true,
			},
			{
				id: "llama3.1",
				name: "Llama 3.1",
				supportsStreaming: true,
			},
			{
				id: "codellama",
				name: "Code Llama",
				supportsStreaming: true,
			},
			{
				id: "mistral",
				name: "Mistral",
				supportsStreaming: true,
			},
		];
	}

	validateConfig(): boolean {
		// Ollama doesn't require an API key if running locally
		return true;
	}

	async generateResponse(messages: AIMessage[], options: GenerateOptions = {}): Promise<string> {
		const systemMessage = messages.find(m => m.role === "system");
		const conversationMessages = messages.filter(m => m.role !== "system");

		const requestBody: any = {
			model: options.model || "llama3.2",
			messages: conversationMessages,
			stream: false,
			options: {
				temperature: options.temperature,
				num_predict: options.maxTokens,
			},
		};

		if (systemMessage) {
			requestBody.messages.unshift({
				role: "system",
				content: systemMessage.content,
			});
		}

		logDebug("Calling Ollama:", {
			model: options.model,
			requestBody,
		});

		const requestParam: RequestUrlParam = {
			url: `${this.baseUrl}/api/chat`,
			method: 'POST',
			contentType: 'application/json',
			body: JSON.stringify(requestBody)
		};

		try {
			const response = await request(requestParam);
			const data = JSON.parse(response);
			
			logDebug("Ollama response", { data });
			return data.message?.content || "";
		} catch (err) {
			logDebug('Ollama API error:', err);
			throw err;
		}
	}

	async streamResponse(
		messages: AIMessage[], 
		options: GenerateOptions, 
		onChunk: (chunk: StreamChunk) => void
	): Promise<void> {
		const systemMessage = messages.find(m => m.role === "system");
		const conversationMessages = messages.filter(m => m.role !== "system");

		const requestBody: any = {
			model: options.model || "llama3.2",
			messages: conversationMessages,
			stream: true,
			options: {
				temperature: options.temperature,
				num_predict: options.maxTokens,
			},
		};

		if (systemMessage) {
			requestBody.messages.unshift({
				role: "system",
				content: systemMessage.content,
			});
		}

		logDebug("Calling Ollama stream:", {
			model: options.model,
			requestBody,
		});

		const response = await fetch(`${this.baseUrl}/api/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.statusText}`);
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
					if (line.trim()) {
						try {
							const data = JSON.parse(line);
							if (data.message?.content) {
								onChunk({ content: data.message.content, done: false });
							}
							if (data.done) {
								onChunk({ content: "", done: true });
								return;
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
		throw new Error("Ollama does not support image generation");
	}
}