import { __awaiter } from "tslib";
import { createProvider } from "src/providers";
import { logDebug } from "src/logDebug";
export class AIService {
    constructor(settings) {
        this.providers = new Map();
        this.settings = settings;
        this.initializeProviders();
    }
    updateSettings(settings) {
        this.settings = settings;
        this.initializeProviders();
    }
    initializeProviders() {
        this.providers.clear();
        for (const [type, providerSettings] of Object.entries(this.settings.providers)) {
            try {
                const provider = createProvider(type, providerSettings.config);
                if (provider.validateConfig()) {
                    this.providers.set(type, provider);
                    logDebug(`Initialized ${type} provider`);
                }
                else {
                    logDebug(`Skipped ${type} provider - invalid config`);
                }
            }
            catch (error) {
                logDebug(`Failed to initialize ${type} provider:`, error);
            }
        }
    }
    getCurrentProvider() {
        return this.providers.get(this.settings.currentProvider) || null;
    }
    getProvider(type) {
        return this.providers.get(type) || null;
    }
    refreshModels(providerType) {
        return __awaiter(this, void 0, void 0, function* () {
            const providersToRefresh = providerType
                ? [providerType]
                : Array.from(this.providers.keys());
            for (const type of providersToRefresh) {
                const provider = this.providers.get(type);
                if (provider) {
                    try {
                        const models = yield provider.getModels();
                        this.settings.providers[type].models = models.map(m => ({
                            id: m.id,
                            name: m.name,
                        }));
                        logDebug(`Refreshed models for ${type}:`, models);
                    }
                    catch (error) {
                        logDebug(`Failed to refresh models for ${type}:`, error);
                    }
                }
            }
        });
    }
    generateResponse(messages, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this.getCurrentProvider();
            if (!provider) {
                throw new Error("No AI provider configured");
            }
            const mergedOptions = Object.assign({ temperature: this.settings.temperature, maxTokens: this.settings.maxResponseTokens || undefined }, options);
            return provider.generateResponse(messages, mergedOptions);
        });
    }
    streamResponse(messages, options, onChunk) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this.getCurrentProvider();
            if (!provider) {
                throw new Error("No AI provider configured");
            }
            const mergedOptions = Object.assign({ temperature: this.settings.temperature, maxTokens: this.settings.maxResponseTokens || undefined }, options);
            yield provider.streamResponse(messages, mergedOptions, (chunk) => {
                if (chunk.done) {
                    onChunk("");
                }
                else {
                    onChunk(chunk.content);
                }
            });
        });
    }
    generateImage(prompt, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this.getCurrentProvider();
            if (!provider) {
                throw new Error("No AI provider configured");
            }
            return provider.generateImage(prompt, options);
        });
    }
    getAvailableModels() {
        var _a;
        const provider = this.getCurrentProvider();
        if (!provider) {
            return [];
        }
        const providerType = this.settings.currentProvider;
        return ((_a = this.settings.providers[providerType]) === null || _a === void 0 ? void 0 : _a.models) || [];
    }
    getCurrentModel() {
        const models = this.getAvailableModels();
        return models.length > 0 ? models[0].id : this.settings.apiModel;
    }
    // Legacy compatibility methods
    legacyGenerateResponse(apiKey, messages, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const aiMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            return this.generateResponse(aiMessages, {
                model: options.model,
                maxTokens: options.max_tokens,
                temperature: options.temperature,
                isJSON: options.isJSON,
            });
        });
    }
    legacyStreamResponse(apiKey, messages, options = {}, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const aiMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            yield this.streamResponse(aiMessages, {
                model: options.model,
                maxTokens: options.max_tokens,
                temperature: options.temperature,
            }, callback);
        });
    }
    legacyCreateImage(apiKey, prompt, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.generateImage(prompt, {
                model: options.model,
                isVertical: options.isVertical,
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxPQUFPLEVBQUUsY0FBYyxFQUE4RSxNQUFNLGVBQWUsQ0FBQztBQUMzSCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXhDLE1BQU0sT0FBTyxTQUFTO0lBSXJCLFlBQVksUUFBaUM7UUFIckMsY0FBUyxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBSTVELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxjQUFjLENBQUMsUUFBaUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLG1CQUFtQjtRQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXZCLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMvRSxJQUFJO2dCQUNILE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxJQUFvQixFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLFFBQVEsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDbkQsUUFBUSxDQUFDLGVBQWUsSUFBSSxXQUFXLENBQUMsQ0FBQztpQkFDekM7cUJBQU07b0JBQ04sUUFBUSxDQUFDLFdBQVcsSUFBSSw0QkFBNEIsQ0FBQyxDQUFDO2lCQUN0RDthQUNEO1lBQUMsT0FBTyxLQUFL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dWdtZW50ZWRDYW52YXNTZXR0aW5ncyB9IGZyb20gXCJzcmMvc2V0dGluZ3MvQXVnbWVudGVkQ2FudmFzU2V0dGluZ3NcIjtcbmltcG9ydCB7IGNyZWF0ZVByb3ZpZGVyLCBBSVByb3ZpZGVyLCBBSU1lc3NhZ2UsIEdlbmVyYXRlT3B0aW9ucywgSW1hZ2VHZW5lcmF0ZU9wdGlvbnMsIFByb3ZpZGVyVHlwZSB9IGZyb20gXCJzcmMvcHJvdmlkZXJzXCI7XG5pbXBvcnQgeyBsb2dEZWJ1ZyB9IGZyb20gXCJzcmMvbG9nRGVidWdcIjtcblxuZXhwb3J0IGNsYXNzIEFJU2VydmljZSB7XG5cdHByaXZhdGUgcHJvdmlkZXJzOiBNYXA8UHJvdmlkZXJUeXBlLCBBSVByb3ZpZGVyPiA9IG5ldyBNYXAoKTtcblx0cHJpdmF0ZSBzZXR0aW5nczogQXVnbWVudGVkQ2FudmFzU2V0dGluZ3M7XG5cblx0Y29uc3RydWN0b3Ioc2V0dGluZ3M6IEF1Z21lbnRlZENhbnZhc1NldHRpbmdzKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZVByb3ZpZGVycygpO1xuXHR9XG5cblx0dXBkYXRlU2V0dGluZ3Moc2V0dGluZ3M6IEF1Z21lbnRlZENhbnZhc1NldHRpbmdzKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZVByb3ZpZGVycygpO1xuXHR9XG5cblx0cHJpdmF0ZSBpbml0aWFsaXplUHJvdmlkZXJzKCkge1xuXHRcdHRoaXMucHJvdmlkZXJzLmNsZWFyKCk7XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBbdHlwZSwgcHJvdmlkZXJTZXR0aW5nc10gb2YgT2JqZWN0LmVudHJpZXModGhpcy5zZXR0aW5ncy5wcm92aWRlcnMpKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBwcm92aWRlciA9IGNyZWF0ZVByb3ZpZGVyKHR5cGUgYXMgUHJvdmlkZXJUeXBlLCBwcm92aWRlclNldHRpbmdzLmNvbmZpZyk7XG5cdFx0XHRcdGlmIChwcm92aWRlci52YWxpZGF0ZUNvbmZpZygpKSB7XG5cdFx0XHRcdFx0dGhpcy5wcm92aWRlcnMuc2V0KHR5cGUgYXMgUHJvdmlkZXJUeXBlLCBwcm92aWRlcik7XG5cdFx0XHRcdFx0bG9nRGVidWcoYEluaXRpYWxpemVkICR7dHlwZX0gcHJvdmlkZXJgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsb2dEZWJ1ZyhgU2tpcHBlZCAke3R5cGV9IHByb3ZpZGVyIC0gaW52YWxpZCBjb25maWdgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0bG9nRGVidWcoYEZhaWxlZCB0byBpbml0aWFsaXplICR7dHlwZX0gcHJvdmlkZXI6YCwgZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldEN1cnJlbnRQcm92aWRlcigpOiBBSVByb3ZpZGVyIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMucHJvdmlkZXJzLmdldCh0aGlzLnNldHRpbmdzLmN1cnJlbnRQcm92aWRlcikgfHwgbnVsbDtcblx0fVxuXG5cdGdldFByb3ZpZGVyKHR5cGU6IFByb3ZpZGVyVHlwZSk6IEFJUHJvdmlkZXIgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5wcm92aWRlcnMuZ2V0KHR5cGUpIHx8IG51bGw7XG5cdH1cblxuXHRhc3luYyByZWZyZXNoTW9kZWxzKHByb3ZpZGVyVHlwZT86IFByb3ZpZGVyVHlwZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHByb3ZpZGVyc1RvUmVmcmVzaCA9IHByb3ZpZGVyVHlwZSBcblx0XHRcdD8gW3Byb3ZpZGVyVHlwZV0gXG5cdFx0XHQ6IEFycmF5LmZyb20odGhpcy5wcm92aWRlcnMua2V5cygpKTtcblxuXHRcdGZvciAoY29uc3QgdHlwZSBvZiBwcm92aWRlcnNUb1JlZnJlc2gpIHtcblx0XHRcdGNvbnN0IHByb3ZpZGVyID0gdGhpcy5wcm92aWRlcnMuZ2V0KHR5cGUpO1xuXHRcdFx0aWYgKHByb3ZpZGVyKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgbW9kZWxzID0gYXdhaXQgcHJvdmlkZXIuZ2V0TW9kZWxzKCk7XG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5wcm92aWRlcnNbdHlwZV0ubW9kZWxzID0gbW9kZWxzLm1hcChtID0+ICh7XG5cdFx0XHRcdFx0XHRpZDogbS5pZCxcblx0XHRcdFx0XHRcdG5hbWU6IG0ubmFtZSxcblx0XHRcdFx0XHR9KSk7XG5cdFx0XHRcdFx0bG9nRGVidWcoYFJlZnJlc2hlZCBtb2RlbHMgZm9yICR7dHlwZX06YCwgbW9kZWxzKTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRsb2dEZWJ1ZyhgRmFpbGVkIHRvIHJlZnJlc2ggbW9kZWxzIGZvciAke3R5cGV9OmAsIGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGdlbmVyYXRlUmVzcG9uc2UoXG5cdFx0bWVzc2FnZXM6IEFJTWVzc2FnZVtdLCBcblx0XHRvcHRpb25zOiBHZW5lcmF0ZU9wdGlvbnMgPSB7fVxuXHQpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IHByb3ZpZGVyID0gdGhpcy5nZXRDdXJyZW50UHJvdmlkZXIoKTtcblx0XHRpZiAoIXByb3ZpZGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBBSSBwcm92aWRlciBjb25maWd1cmVkXCIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1lcmdlZE9wdGlvbnMgPSB7XG5cdFx0XHR0ZW1wZXJhdHVyZTogdGhpcy5zZXR0aW5ncy50ZW1wZXJhdHVyZSxcblx0XHRcdG1heFRva2VuczogdGhpcy5zZXR0aW5ncy5tYXhSZXNwb25zZVRva2VucyB8fCB1bmRlZmluZWQsXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gcHJvdmlkZXIuZ2VuZXJhdGVSZXNwb25zZShtZXNzYWdlcywgbWVyZ2VkT3B0aW9ucyk7XG5cdH1cblxuXHRhc3luYyBzdHJlYW1SZXNwb25zZShcblx0XHRtZXNzYWdlczogQUlNZXNzYWdlW10sIFxuXHRcdG9wdGlvbnM6IEdlbmVyYXRlT3B0aW9ucyxcblx0XHRvbkNodW5rOiAoY29udGVudDogc3RyaW5nKSA9PiB2b2lkXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHByb3ZpZGVyID0gdGhpcy5nZXRDdXJyZW50UHJvdmlkZXIoKTtcblx0XHRpZiAoIXByb3ZpZGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBBSSBwcm92aWRlciBjb25maWd1cmVkXCIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1lcmdlZE9wdGlvbnMgPSB7XG5cdFx0XHR0ZW1wZXJhdHVyZTogdGhpcy5zZXR0aW5ncy50ZW1wZXJhdHVyZSxcblx0XHRcdG1heFRva2VuczogdGhpcy5zZXR0aW5ncy5tYXhSZXNwb25zZVRva2VucyB8fCB1bmRlZmluZWQsXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdH07XG5cblx0XHRhd2FpdCBwcm92aWRlci5zdHJlYW1SZXNwb25zZShtZXNzYWdlcywgbWVyZ2VkT3B0aW9ucywgKGNodW5rKSA9PiB7XG5cdFx0XHRpZiAoY2h1bmsuZG9uZSkge1xuXHRcdFx0XHRvbkNodW5rKFwiXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b25DaHVuayhjaHVuay5jb250ZW50KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGFzeW5jIGdlbmVyYXRlSW1hZ2UoXG5cdFx0cHJvbXB0OiBzdHJpbmcsIFxuXHRcdG9wdGlvbnM6IEltYWdlR2VuZXJhdGVPcHRpb25zID0ge31cblx0KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCBwcm92aWRlciA9IHRoaXMuZ2V0Q3VycmVudFByb3ZpZGVyKCk7XG5cdFx0aWYgKCFwcm92aWRlcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gQUkgcHJvdmlkZXIgY29uZmlndXJlZFwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJvdmlkZXIuZ2VuZXJhdGVJbWFnZShwcm9tcHQsIG9wdGlvbnMpO1xuXHR9XG5cblx0Z2V0QXZhaWxhYmxlTW9kZWxzKCk6IHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXSB7XG5cdFx0Y29uc3QgcHJvdmlkZXIgPSB0aGlzLmdldEN1cnJlbnRQcm92aWRlcigpO1xuXHRcdGlmICghcHJvdmlkZXIpIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm92aWRlclR5cGUgPSB0aGlzLnNldHRpbmdzLmN1cnJlbnRQcm92aWRlcjtcblx0XHRyZXR1cm4gdGhpcy5zZXR0aW5ncy5wcm92aWRlcnNbcHJvdmlkZXJUeXBlXT8ubW9kZWxzIHx8IFtdO1xuXHR9XG5cblx0Z2V0Q3VycmVudE1vZGVsKCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgbW9kZWxzID0gdGhpcy5nZXRBdmFpbGFibGVNb2RlbHMoKTtcblx0XHRyZXR1cm4gbW9kZWxzLmxlbmd0aCA+IDAgPyBtb2RlbHNbMF0uaWQgOiB0aGlzLnNldHRpbmdzLmFwaU1vZGVsO1xuXHR9XG5cblx0Ly8gTGVnYWN5IGNvbXBhdGliaWxpdHkgbWV0aG9kc1xuXHRhc3luYyBsZWdhY3lHZW5lcmF0ZVJlc3BvbnNlKFxuXHRcdGFwaUtleTogc3RyaW5nLFxuXHRcdG1lc3NhZ2VzOiBhbnlbXSxcblx0XHRvcHRpb25zOiBhbnkgPSB7fVxuXHQpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IGFpTWVzc2FnZXM6IEFJTWVzc2FnZVtdID0gbWVzc2FnZXMubWFwKG1zZyA9PiAoe1xuXHRcdFx0cm9sZTogbXNnLnJvbGUsXG5cdFx0XHRjb250ZW50OiBtc2cuY29udGVudCxcblx0XHR9KSk7XG5cblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZVJlc3BvbnNlKGFpTWVzc2FnZXMsIHtcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsLFxuXHRcdFx0bWF4VG9rZW5zOiBvcHRpb25zLm1heF90b2tlbnMsXG5cdFx0XHR0ZW1wZXJhdHVyZTogb3B0aW9ucy50ZW1wZXJhdHVyZSxcblx0XHRcdGlzSlNPTjogb3B0aW9ucy5pc0pTT04sXG5cdFx0fSk7XG5cdH1cblxuXHRhc3luYyBsZWdhY3lTdHJlYW1SZXNwb25zZShcblx0XHRhcGlLZXk6IHN0cmluZyxcblx0XHRtZXNzYWdlczogYW55W10sXG5cdFx0b3B0aW9uczogYW55ID0ge30sXG5cdFx0Y2FsbGJhY2s6IChjb250ZW50OiBzdHJpbmcpID0+IHZvaWRcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgYWlNZXNzYWdlczogQUlNZXNzYWdlW10gPSBtZXNzYWdlcy5tYXAobXNnID0+ICh7XG5cdFx0XHRyb2xlOiBtc2cucm9sZSxcblx0XHRcdGNvbnRlbnQ6IG1zZy5jb250ZW50LFxuXHRcdH0pKTtcblxuXHRcdGF3YWl0IHRoaXMuc3RyZWFtUmVzcG9uc2UoYWlNZXNzYWdlcywge1xuXHRcdFx0bW9kZWw6IG9wdGlvbnMubW9kZWwsXG5cdFx0XHRtYXhUb2tlbnM6IG9wdGlvbnMubWF4X3Rva2Vucyxcblx0XHRcdHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXBlcmF0dXJlLFxuXHRcdH0sIGNhbGxiYWNrKTtcblx0fVxuXG5cdGFzeW5jIGxlZ2FjeUNyZWF0ZUltYWdlKFxuXHRcdGFwaUtleTogc3RyaW5nLFxuXHRcdHByb21wdDogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IGFueSA9IHt9XG5cdCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVJbWFnZShwcm9tcHQsIHtcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsLFxuXHRcdFx0aXNWZXJ0aWNhbDogb3B0aW9ucy5pc1ZlcnRpY2FsLFxuXHRcdH0pO1xuXHR9XG59Il19