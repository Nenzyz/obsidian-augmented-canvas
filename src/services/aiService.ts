import { AugmentedCanvasSettings } from "src/settings/AugmentedCanvasSettings";
import { createProvider, AIProvider, AIMessage, GenerateOptions, ImageGenerateOptions, ProviderType, getProviderInfo } from "src/providers";
import { logDebug } from "src/logDebug";

export class AIService {
	private providers: Map<ProviderType, AIProvider> = new Map();
	private settings: AugmentedCanvasSettings;

	constructor(settings: AugmentedCanvasSettings) {
		this.settings = settings;
		this.initializeProviders();
	}

	updateSettings(settings: AugmentedCanvasSettings) {
		this.settings = settings;
		this.initializeProviders();
	}

	private initializeProviders() {
		this.providers.clear();
		
		for (const [type, providerSettings] of Object.entries(this.settings.providers)) {
			try {
				const provider = createProvider(type as ProviderType, providerSettings.config);
				if (provider.validateConfig()) {
					this.providers.set(type as ProviderType, provider);
					logDebug(`Initialized ${type} provider`);
				} else {
					const providerInfo = getProviderInfo(type as ProviderType);
					const requirements = providerInfo.configFields
						.filter(field => field.required)
						.map(field => field.label);
					logDebug(`Skipped ${type} provider - missing required: ${requirements.join(', ')}`);
				}
			} catch (error) {
				logDebug(`Failed to initialize ${type} provider:`, error);
			}
		}
	}

	getCurrentProvider(): AIProvider | null {
		return this.providers.get(this.settings.currentProvider) || null;
	}

	getProvider(type: ProviderType): AIProvider | null {
		return this.providers.get(type) || null;
	}

	getCurrentProviderStatus(): { available: boolean; error?: string } {
		const currentProviderType = this.settings.currentProvider;
		const provider = this.providers.get(currentProviderType);
		
		if (provider) {
			return { available: true };
		}
		
		const providerConfig = this.settings.providers[currentProviderType];
		if (!providerConfig) {
			return { 
				available: false, 
				error: `Provider ${currentProviderType} is not configured.` 
			};
		}
		
		// Check what's missing
		const providerInfo = getProviderInfo(currentProviderType);
		const missingFields = providerInfo.configFields
			.filter(field => field.required && !providerConfig.config[field.key])
			.map(field => field.label);
		
		if (missingFields.length > 0) {
			return { 
				available: false, 
				error: `${providerInfo.name} is missing required configuration: ${missingFields.join(', ')}` 
			};
		}
		
		return { 
			available: false, 
			error: `${providerInfo.name} provider failed to initialize.` 
		};
	}

	async refreshModels(providerType?: ProviderType): Promise<void> {
		const providersToRefresh = providerType 
			? [providerType] 
			: Array.from(this.providers.keys());

		for (const type of providersToRefresh) {
			const provider = this.providers.get(type);
			if (provider) {
				try {
					const models = await provider.getModels();
					const modelData = models.map(m => ({
						id: m.id,
						name: m.name,
					}));
					
					// Update the settings with the new models
					if (!this.settings.providers[type]) {
						this.settings.providers[type] = {
							type,
							config: { apiKey: "" },
						};
					}
					this.settings.providers[type].models = modelData;
					
					logDebug(`Refreshed models for ${type}:`, modelData);
				} catch (error) {
					logDebug(`Failed to refresh models for ${type}:`, error);
					// Don't throw error, just log it - allows fallback to static models
				}
			}
		}
	}

	async generateResponse(
		messages: AIMessage[], 
		options: GenerateOptions = {}
	): Promise<string> {
		const provider = this.getCurrentProvider();
		if (!provider) {
			const status = this.getCurrentProviderStatus();
			throw new Error(status.error || "No AI provider configured");
		}

		const mergedOptions = {
			temperature: this.settings.temperature,
			maxTokens: this.settings.maxResponseTokens || undefined,
			...options,
		};

		return provider.generateResponse(messages, mergedOptions);
	}

	private getProviderRequirements(providerType: ProviderType): { name: string; requirements: string[] } {
		const providerInfo = getProviderInfo(providerType);
		const requirements = providerInfo.configFields
			.filter(field => field.required)
			.map(field => field.label);
		
		return { 
			name: providerInfo.name, 
			requirements: requirements.length > 0 ? requirements : ["Configuration"] 
		};
	}

	async streamResponse(
		messages: AIMessage[], 
		options: GenerateOptions,
		onChunk: (content: string) => void
	): Promise<void> {
		const provider = this.getCurrentProvider();
		if (!provider) {
			const status = this.getCurrentProviderStatus();
			throw new Error(status.error || "No AI provider configured");
		}

		const mergedOptions = {
			temperature: this.settings.temperature,
			maxTokens: this.settings.maxResponseTokens || undefined,
			...options,
		};

		await provider.streamResponse(messages, mergedOptions, (chunk) => {
			if (chunk.done) {
				onChunk("");
			} else {
				onChunk(chunk.content);
			}
		});
	}

	async generateImage(
		prompt: string, 
		options: ImageGenerateOptions = {}
	): Promise<string> {
		const provider = this.getCurrentProvider();
		if (!provider) {
			const status = this.getCurrentProviderStatus();
			throw new Error(status.error || "No AI provider configured");
		}

		return provider.generateImage(prompt, options);
	}

	getAvailableModels(): { id: string; name: string }[] {
		const provider = this.getCurrentProvider();
		if (!provider) {
			return [];
		}

		const providerType = this.settings.currentProvider;
		const cachedModels = this.settings.providers[providerType]?.models || [];
		
		// Return cached models if available, otherwise return empty array
		// Models should be loaded via refreshModels()
		return cachedModels;
	}

	async getAvailableModelsAsync(): Promise<{ id: string; name: string }[]> {
		const provider = this.getCurrentProvider();
		if (!provider) {
			return [];
		}

		const providerType = this.settings.currentProvider;
		let models = this.settings.providers[providerType]?.models || [];
		
		// If no cached models, try to fetch them
		if (models.length === 0) {
			try {
				await this.refreshModels(providerType);
				models = this.settings.providers[providerType]?.models || [];
			} catch (error) {
				logDebug(`Failed to fetch models for ${providerType}:`, error);
			}
		}
		
		return models;
	}

	async getAvailableImageModels(): Promise<{ id: string; name: string }[]> {
		const provider = this.getCurrentProvider();
		if (!provider) {
			return [];
		}

		try {
			const imageModels = await provider.getImageModels();
			return imageModels.map(m => ({
				id: m.id,
				name: m.name,
			}));
		} catch (error) {
			logDebug("Failed to get image models:", error);
			return [];
		}
	}

	getCurrentModel(): string {
		const models = this.getAvailableModels();
		return models.length > 0 ? models[0].id : this.settings.apiModel;
	}

	// Legacy compatibility methods
	async legacyGenerateResponse(
		apiKey: string,
		messages: any[],
		options: any = {}
	): Promise<string> {
		const aiMessages: AIMessage[] = messages.map(msg => ({
			role: msg.role,
			content: msg.content,
		}));

		return this.generateResponse(aiMessages, {
			model: options.model,
			maxTokens: options.max_tokens,
			temperature: options.temperature,
			isJSON: options.isJSON,
		});
	}

	async legacyStreamResponse(
		apiKey: string,
		messages: any[],
		options: any = {},
		callback: (content: string) => void
	): Promise<void> {
		const aiMessages: AIMessage[] = messages.map(msg => ({
			role: msg.role,
			content: msg.content,
		}));

		await this.streamResponse(aiMessages, {
			model: options.model,
			maxTokens: options.max_tokens,
			temperature: options.temperature,
		}, callback);
	}

	async legacyCreateImage(
		apiKey: string,
		prompt: string,
		options: any = {}
	): Promise<string> {
		return this.generateImage(prompt, {
			model: options.model,
			isVertical: options.isVertical,
		});
	}
}