import { request, RequestUrlParam } from "obsidian";
import { logDebug } from "src/logDebug";
import { AIProvider, AIModel, AIMessage, StreamChunk, GenerateOptions, ImageGenerateOptions, AIProviderConfig } from "./types";

export interface GeminiConfig extends AIProviderConfig {
	baseUrl?: string;
}

export class GeminiProvider extends AIProvider {
	name = "Gemini";
	private baseUrl: string;

	constructor(config: GeminiConfig) {
		super(config);
		this.baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models";
	}

	async getModels(): Promise<AIModel[]> {
		try {
			const url = `${this.baseUrl}?key=${this.config.apiKey}`;
			
			logDebug("Fetching Gemini models from:", url);
			
			const requestParam: RequestUrlParam = {
				url,
				method: 'GET'
			};
			
			const response = await request(requestParam);
			const data = JSON.parse(response);
			
			logDebug("Gemini models response:", data);
			
			if (data.error) {
				logDebug("Gemini API error:", data.error);
				throw new Error(`Gemini API error: ${data.error.message || data.error}`);
			}
			
			if (data.models) {
				return data.models
					.filter((model: any) => model.name.includes('gemini') && !model.name.includes('embedding'))
					.map((model: any) => ({
						id: model.name.replace('models/', ''),
						name: model.displayName || model.name.replace('models/', ''),
						tokenLimit: this.getTokenLimitForModel(model.name),
						supportsStreaming: true,
					}));
			}
			return this.getStaticModels();
		} catch (error) {
			logDebug("Failed to fetch Gemini models", error);
			// If it's an API key issue, throw a more specific error
			if (error.message && error.message.includes('400')) {
				throw new Error("Gemini API key may be invalid or missing. Please check your API key in settings.");
			}
			return this.getStaticModels();
		}
	}

	private getTokenLimitForModel(modelName: string): number {
		const baseName = modelName.replace('models/', '');
		
		if (baseName.includes('2.0-flash')) return 1048576;  // 1M tokens for Gemini 2.0 Flash
		if (baseName.includes('1.5-pro')) return 2097152;  // 2M tokens
		if (baseName.includes('1.5-flash-8b')) return 1048576;  // 1M tokens for 8B model
		if (baseName.includes('1.5-flash')) return 1048576;  // 1M tokens
		if (baseName.includes('pro-vision')) return 16384;
		if (baseName.includes('pro')) return 32768;
		return 1048576; // Default to 1M tokens for newer models
	}

	async getChatModels(): Promise<AIModel[]> {
		const models = await this.getModels();
		return models.filter(model => 
			!model.id.includes('vision') && 
			!model.id.includes('embedding')
		);
	}

	async getImageModels(): Promise<AIModel[]> {
		return []; // Gemini doesn't support image generation via API
	}

	private getStaticModels(): AIModel[] {
		return [
			{
				id: "gemini-2.0-flash-exp",
				name: "Gemini 2.0 Flash (Experimental)",
				tokenLimit: 1048576,
				supportsStreaming: true,
			},
			{
				id: "gemini-1.5-pro-002",
				name: "Gemini 1.5 Pro",
				tokenLimit: 2097152,
				supportsStreaming: true,
			},
			{
				id: "gemini-1.5-flash-002",
				name: "Gemini 1.5 Flash",
				tokenLimit: 1048576,
				supportsStreaming: true,
			},
			{
				id: "gemini-1.5-flash-8b",
				name: "Gemini 1.5 Flash 8B",
				tokenLimit: 1048576,
				supportsStreaming: true,
			},
		];
	}

	async generateResponse(messages: AIMessage[], options: GenerateOptions = {}): Promise<string> {
		const systemMessage = messages.find(m => m.role === "system");
		const conversationMessages = messages.filter(m => m.role !== "system");

		// Convert messages to Gemini format
		const contents = conversationMessages.map(msg => ({
			role: msg.role === "assistant" ? "model" : "user",
			parts: [{ text: msg.content }],
		}));

		const requestBody: any = {
			contents,
			generationConfig: {
				temperature: options.temperature,
				maxOutputTokens: options.maxTokens,
			},
		};

		if (systemMessage) {
			requestBody.systemInstruction = {
				parts: [{ text: systemMessage.content }],
			};
		}

		logDebug("Calling Gemini:", {
			model: options.model,
			requestBody,
		});

		const modelId = options.model || "gemini-1.5-pro-002";
		const url = `${this.baseUrl}/${modelId}:generateContent?key=${this.config.apiKey}`;

		const requestParam: RequestUrlParam = {
			url,
			method: 'POST',
			contentType: 'application/json',
			body: JSON.stringify(requestBody)
		};

		try {
			const response = await request(requestParam);
			const data = JSON.parse(response);
			
			logDebug("Gemini response", { data });

			if (data.error) {
				throw new Error(`Gemini API error: ${data.error.message}`);
			}

			const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
			if (!content) {
				throw new Error("No response from Gemini");
			}

			return content;
		} catch (err) {
			logDebug('Gemini API error:', err);
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

		const contents = conversationMessages.map(msg => ({
			role: msg.role === "assistant" ? "model" : "user",
			parts: [{ text: msg.content }],
		}));

		const requestBody: any = {
			contents,
			generationConfig: {
				temperature: options.temperature,
				maxOutputTokens: options.maxTokens,
			},
		};

		if (systemMessage) {
			requestBody.systemInstruction = {
				parts: [{ text: systemMessage.content }],
			};
		}

		logDebug("Calling Gemini stream:", {
			model: options.model,
			requestBody,
		});

		// For now, use regular generateContent and send all at once
		// TODO: Implement proper streaming with Obsidian's request API
		const content = await this.generateResponse(messages, options);
		onChunk({ content, done: false });
		onChunk({ content: "", done: true });
	}

	async generateImage(prompt: string, options: ImageGenerateOptions = {}): Promise<string> {
		throw new Error("Gemini does not support image generation");
	}
}