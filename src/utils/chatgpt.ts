import { ChatCompletionMessageParam } from "openai/resources";
import { AIService } from "src/services/aiService";

export type Message = {
	role: string;
	content: string;
};

// Global AI service instance - will be initialized by the plugin
let aiService: AIService | null = null;

export function setAIService(service: AIService) {
	aiService = service;
}

export function getAIService(): AIService {
	if (!aiService) {
		throw new Error("AI service not initialized. Make sure the plugin is loaded.");
	}
	return aiService;
}

export const streamResponse = async (
	apiKey: string,
	messages: ChatCompletionMessageParam[],
	{
		max_tokens,
		model,
		temperature,
	}: {
		max_tokens?: number;
		model?: string;
		temperature?: number;
	} = {},
	cb: any
) => {
	const service = getAIService();
	await service.legacyStreamResponse(apiKey, messages, {
		max_tokens,
		model,
		temperature,
	}, cb);
};

export const getResponse = async (
	apiKey: string,
	messages: ChatCompletionMessageParam[],
	{
		model,
		max_tokens,
		temperature,
		isJSON,
	}: {
		model?: string;
		max_tokens?: number;
		temperature?: number;
		isJSON?: boolean;
	} = {}
) => {
	const service = getAIService();
	return service.legacyGenerateResponse(apiKey, messages, {
		model,
		max_tokens,
		temperature,
		isJSON,
	});
};

let count = 0;
export const createImage = async (
	apiKey: string,
	prompt: string,
	{
		isVertical = false,
		model,
	}: {
		isVertical?: boolean;
		model?: string;
	}
) => {
	count++;
	const service = getAIService();
	return service.legacyCreateImage(apiKey, prompt, {
		isVertical,
		model,
	});
};
