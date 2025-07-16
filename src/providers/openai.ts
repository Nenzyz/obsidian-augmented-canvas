import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { logDebug } from "src/logDebug";
import { AIProvider, AIModel, AIMessage, StreamChunk, GenerateOptions, ImageGenerateOptions, AIProviderConfig } from "./types";

export class OpenAIProvider extends AIProvider {
	name = "OpenAI";
	private client: OpenAI;

	constructor(config: AIProviderConfig) {
		super(config);
		this.client = new OpenAI({
			apiKey: config.apiKey,
			dangerouslyAllowBrowser: true,
		});
	}

	async getModels(): Promise<AIModel[]> {
		try {
			const response = await this.client.models.list();
			return response.data.map(model => ({
				id: model.id,
				name: model.id,
				supportsStreaming: true,
			}));
		} catch (error) {
			logDebug("Failed to fetch OpenAI models", error);
			return this.getStaticModels();
		}
	}

	async getChatModels(): Promise<AIModel[]> {
		const models = await this.getModels();
		return models.filter(model => 
			model.id.includes('gpt') && 
			!model.id.includes('instruct')
		);
	}

	async getImageModels(): Promise<AIModel[]> {
		return [
			{
				id: "dall-e-2",
				name: "DALL-E 2",
				supportsImages: true,
			},
			{
				id: "dall-e-3",
				name: "DALL-E 3",
				supportsImages: true,
			},
		];
	}

	private getStaticModels(): AIModel[] {
		return [
			{
				id: "gpt-4o",
				name: "GPT-4o",
				tokenLimit: 128000,
				supportsStreaming: true,
			},
			{
				id: "gpt-4o-mini",
				name: "GPT-4o Mini",
				tokenLimit: 128000,
				supportsStreaming: true,
			},
			{
				id: "gpt-4-1106-preview",
				name: "GPT-4 Turbo Preview",
				tokenLimit: 128000,
				supportsStreaming: true,
			},
		];
	}

	async generateResponse(messages: AIMessage[], options: GenerateOptions = {}): Promise<string> {
		const openaiMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
			role: msg.role,
			content: msg.content,
		}));

		logDebug("Calling OpenAI:", {
			messages: openaiMessages,
			model: options.model,
			max_tokens: options.maxTokens,
			temperature: options.temperature,
			isJSON: options.isJSON,
		});

		const completion = await this.client.chat.completions.create({
			model: options.model || "gpt-4-1106-preview",
			messages: openaiMessages,
			max_tokens: options.maxTokens,
			temperature: options.temperature,
			response_format: { type: options.isJSON ? "json_object" : "text" },
		});

		logDebug("OpenAI response", { completion });
		
		const content = completion.choices[0].message!.content!;
		return options.isJSON ? JSON.parse(content) : content;
	}

	async streamResponse(
		messages: AIMessage[], 
		options: GenerateOptions, 
		onChunk: (chunk: StreamChunk) => void
	): Promise<void> {
		const openaiMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
			role: msg.role,
			content: msg.content,
		}));

		logDebug("Calling OpenAI stream:", {
			messages: openaiMessages,
			model: options.model,
			max_tokens: options.maxTokens,
			temperature: options.temperature,
		});

		const stream = await this.client.chat.completions.create({
			model: options.model || "gpt-4",
			messages: openaiMessages,
			stream: true,
			max_tokens: options.maxTokens,
			temperature: options.temperature,
		});

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || "";
			logDebug("OpenAI chunk", { chunk });
			onChunk({ content, done: false });
		}
		
		onChunk({ content: "", done: true });
	}

	async generateImage(prompt: string, options: ImageGenerateOptions = {}): Promise<string> {
		logDebug("Calling OpenAI image generation:", {
			prompt,
			model: options.model,
		});

		const size = options.size || (options.isVertical ? "1024x1792" : "1792x1024");
		const validSizes = ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"] as const;
		const imageSize = validSizes.includes(size as any) ? size as typeof validSizes[number] : "1024x1024";

		const response = await this.client.images.generate({
			model: options.model || "dall-e-3",
			prompt,
			n: 1,
			size: imageSize,
			response_format: "b64_json",
		});

		logDebug("OpenAI image response", { response });
		return response.data[0].b64_json!;
	}
}