export interface AIModel {
	id: string;
	name: string;
	tokenLimit?: number;
	supportsImages?: boolean;
	supportsStreaming?: boolean;
}

export interface AIProviderConfig {
	apiKey: string;
	baseUrl?: string;
	[key: string]: any;
}

export interface AIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface StreamChunk {
	content: string;
	done: boolean;
}

export interface GenerateOptions {
	model?: string;
	maxTokens?: number;
	temperature?: number;
	isJSON?: boolean;
}

export interface ImageGenerateOptions {
	model?: string;
	isVertical?: boolean;
	size?: string;
}

export abstract class AIProvider {
	protected config: AIProviderConfig;
	abstract name: string;
	
	constructor(config: AIProviderConfig) {
		this.config = config;
	}

	abstract getModels(): Promise<AIModel[]>;
	abstract getChatModels(): Promise<AIModel[]>;
	abstract getImageModels(): Promise<AIModel[]>;
	
	abstract generateResponse(
		messages: AIMessage[],
		options?: GenerateOptions
	): Promise<string>;
	
	abstract streamResponse(
		messages: AIMessage[],
		options: GenerateOptions,
		onChunk: (chunk: StreamChunk) => void
	): Promise<void>;
	
	abstract generateImage(
		prompt: string,
		options?: ImageGenerateOptions
	): Promise<string>;
	
	validateConfig(): boolean {
		return !!this.config.apiKey;
	}
}