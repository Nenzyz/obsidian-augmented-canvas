import { __awaiter } from "tslib";
import { logDebug } from "src/logDebug";
import { AIProvider } from "./types";
export class ClaudeProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.name = "Claude";
        this.baseUrl = config.baseUrl || "https://api.anthropic.com";
    }
    getModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getStaticModels();
        });
    }
    getChatModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getStaticModels();
        });
    }
    getImageModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return []; // Claude doesn't support image generation
        });
    }
    getStaticModels() {
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
    generateResponse(messages, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const systemMessage = messages.find(m => m.role === "system");
            const userMessages = messages.filter(m => m.role !== "system");
            logDebug("Calling Claude:", {
                messages: userMessages,
                system: systemMessage === null || systemMessage === void 0 ? void 0 : systemMessage.content,
                model: options.model,
                max_tokens: options.maxTokens,
                temperature: options.temperature,
            });
            const response = yield fetch(`${this.baseUrl}/v1/messages`, {
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
                    system: systemMessage === null || systemMessage === void 0 ? void 0 : systemMessage.content,
                    messages: userMessages.map(msg => ({
                        role: msg.role === "assistant" ? "assistant" : "user",
                        content: msg.content,
                    })),
                }),
            });
            if (!response.ok) {
                throw new Error(`Claude API error: ${response.statusText}`);
            }
            const data = yield response.json();
            logDebug("Claude response", { data });
            return data.content[0].text;
        });
    }
    streamResponse(messages, options, onChunk) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const systemMessage = messages.find(m => m.role === "system");
            const userMessages = messages.filter(m => m.role !== "system");
            logDebug("Calling Claude stream:", {
                messages: userMessages,
                system: systemMessage === null || systemMessage === void 0 ? void 0 : systemMessage.content,
                model: options.model,
                max_tokens: options.maxTokens,
                temperature: options.temperature,
            });
            const response = yield fetch(`${this.baseUrl}/v1/messages`, {
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
                    system: systemMessage === null || systemMessage === void 0 ? void 0 : systemMessage.content,
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
            const reader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
            if (!reader) {
                throw new Error("No response body");
            }
            const decoder = new TextDecoder();
            let buffer = "";
            try {
                while (true) {
                    const { done, value } = yield reader.read();
                    if (done)
                        break;
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
                            }
                            catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
            onChunk({ content: "", done: true });
        });
    }
    generateImage(prompt, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Claude does not support image generation");
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhdWRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xhdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxVQUFVLEVBQTRGLE1BQU0sU0FBUyxDQUFDO0FBTS9ILE1BQU0sT0FBTyxjQUFlLFNBQVEsVUFBVTtJQUk3QyxZQUFZLE1BQW9CO1FBQy9CLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUpmLFNBQUksR0FBRyxRQUFRLENBQUM7UUFLZixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksMkJBQTJCLENBQUM7SUFDOUQsQ0FBQztJQUVLLFNBQVM7O1lBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUFBO0lBRUssYUFBYTs7WUFDbEIsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUFBO0lBRUssY0FBYzs7WUFDbkIsT0FBTyxFQUFFLENBQUMsQ0FBQywwQ0FBMEM7UUFDdEQsQ0FBQztLQUFBO0lBRU8sZUFBZTtRQUN0QixPQUFPO1lBQ047Z0JBQ0MsRUFBRSxFQUFFLDRCQUE0QjtnQkFDaEMsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsVUFBVSxFQUFFLE1BQU07Z0JBQ2xCLGlCQUFpQixFQUFFLElBQUk7YUFDdkI7WUFDRDtnQkFDQyxFQUFFLEVBQUUsMkJBQTJCO2dCQUMvQixJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixVQUFVLEVBQUUsTUFBTTtnQkFDbEIsaUJBQWlCLEVBQUUsSUFBSTthQUN2QjtZQUNEO2dCQUNDLEVBQUUsRUFBRSx3QkFBd0I7Z0JBQzVCLElBQUksRUFBRSxlQUFlO2dCQUNyQixVQUFVLEVBQUUsTUFBTTtnQkFDbEIsaUJBQWlCLEVBQUUsSUFBSTthQUN2QjtTQUNELENBQUM7SUFDSCxDQUFDO0lBRUssZ0JBQWdCLENB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cEI7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtvQkFBUztnQkFDVCxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDckI7WUFFRCxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDOztLQUNyQztJQUVLLGFBQWEsQ0FBQyxNQUFjLEVBQUUsVUFBZ0MsRUFBRTs7WUFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTtDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9nRGVidWcgfSBmcm9tIFwic3JjL2xvZ0RlYnVnXCI7XG5pbXBvcnQgeyBBSVByb3ZpZGVyLCBBSU1vZGVsLCBBSU1lc3NhZ2UsIFN0cmVhbUNodW5rLCBHZW5lcmF0ZU9wdGlvbnMsIEltYWdlR2VuZXJhdGVPcHRpb25zLCBBSVByb3ZpZGVyQ29uZmlnIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDbGF1ZGVDb25maWcgZXh0ZW5kcyBBSVByb3ZpZGVyQ29uZmlnIHtcblx0YmFzZVVybD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIENsYXVkZVByb3ZpZGVyIGV4dGVuZHMgQUlQcm92aWRlciB7XG5cdG5hbWUgPSBcIkNsYXVkZVwiO1xuXHRwcml2YXRlIGJhc2VVcmw6IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihjb25maWc6IENsYXVkZUNvbmZpZykge1xuXHRcdHN1cGVyKGNvbmZpZyk7XG5cdFx0dGhpcy5iYXNlVXJsID0gY29uZmlnLmJhc2VVcmwgfHwgXCJodHRwczovL2FwaS5hbnRocm9waWMuY29tXCI7XG5cdH1cblxuXHRhc3luYyBnZXRNb2RlbHMoKTogUHJvbWlzZTxBSU1vZGVsW10+IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRTdGF0aWNNb2RlbHMoKTtcblx0fVxuXG5cdGFzeW5jIGdldENoYXRNb2RlbHMoKTogUHJvbWlzZTxBSU1vZGVsW10+IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRTdGF0aWNNb2RlbHMoKTtcblx0fVxuXG5cdGFzeW5jIGdldEltYWdlTW9kZWxzKCk6IFByb21pc2U8QUlNb2RlbFtdPiB7XG5cdFx0cmV0dXJuIFtdOyAvLyBDbGF1ZGUgZG9lc24ndCBzdXBwb3J0IGltYWdlIGdlbmVyYXRpb25cblx0fVxuXG5cdHByaXZhdGUgZ2V0U3RhdGljTW9kZWxzKCk6IEFJTW9kZWxbXSB7XG5cdFx0cmV0dXJuIFtcblx0XHRcdHtcblx0XHRcdFx0aWQ6IFwiY2xhdWRlLTMtNS1zb25uZXQtMjAyNDEwMjJcIixcblx0XHRcdFx0bmFtZTogXCJDbGF1ZGUgMy41IFNvbm5ldFwiLFxuXHRcdFx0XHR0b2tlbkxpbWl0OiAyMDAwMDAsXG5cdFx0XHRcdHN1cHBvcnRzU3RyZWFtaW5nOiB0cnVlLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0aWQ6IFwiY2xhdWRlLTMtNS1oYWlrdS0yMDI0MTAyMlwiLFxuXHRcdFx0XHRuYW1lOiBcIkNsYXVkZSAzLjUgSGFpa3VcIixcblx0XHRcdFx0dG9rZW5MaW1pdDogMjAwMDAwLFxuXHRcdFx0XHRzdXBwb3J0c1N0cmVhbWluZzogdHJ1ZSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiBcImNsYXVkZS0zLW9wdXMtMjAyNDAyMjlcIixcblx0XHRcdFx0bmFtZTogXCJDbGF1ZGUgMyBPcHVzXCIsXG5cdFx0XHRcdHRva2VuTGltaXQ6IDIwMDAwMCxcblx0XHRcdFx0c3VwcG9ydHNTdHJlYW1pbmc6IHRydWUsXG5cdFx0XHR9LFxuXHRcdF07XG5cdH1cblxuXHRhc3luYyBnZW5lcmF0ZVJlc3BvbnNlKG1lc3NhZ2VzOiBBSU1lc3NhZ2VbXSwgb3B0aW9uczogR2VuZXJhdGVPcHRpb25zID0ge30pOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IHN5c3RlbU1lc3NhZ2UgPSBtZXNzYWdlcy5maW5kKG0gPT4gbS5yb2xlID09PSBcInN5c3RlbVwiKTtcblx0XHRjb25zdCB1c2VyTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIobSA9PiBtLnJvbGUgIT09IFwic3lzdGVtXCIpO1xuXG5cdFx0bG9nRGVidWcoXCJDYWxsaW5nIENsYXVkZTpcIiwge1xuXHRcdFx0bWVzc2FnZXM6IHVzZXJNZXNzYWdlcyxcblx0XHRcdHN5c3RlbTogc3lzdGVtTWVzc2FnZT8uY29udGVudCxcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsLFxuXHRcdFx0bWF4X3Rva2Vuczogb3B0aW9ucy5tYXhUb2tlbnMsXG5cdFx0XHR0ZW1wZXJhdHVyZTogb3B0aW9ucy50ZW1wZXJhdHVyZSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5iYXNlVXJsfS92MS9tZXNzYWdlc2AsIHtcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0XHRcIngtYXBpLWtleVwiOiB0aGlzLmNvbmZpZy5hcGlLZXksXG5cdFx0XHRcdFwiYW50aHJvcGljLXZlcnNpb25cIjogXCIyMDIzLTA2LTAxXCIsXG5cdFx0XHR9LFxuXHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRtb2RlbDogb3B0aW9ucy5tb2RlbCB8fCBcImNsYXVkZS0zLTUtc29ubmV0LTIwMjQxMDIyXCIsXG5cdFx0XHRcdG1heF90b2tlbnM6IG9wdGlvbnMubWF4VG9rZW5zIHx8IDQwOTYsXG5cdFx0XHRcdHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXBlcmF0dXJlLFxuXHRcdFx0XHRzeXN0ZW06IHN5c3RlbU1lc3NhZ2U/LmNvbnRlbnQsXG5cdFx0XHRcdG1lc3NhZ2VzOiB1c2VyTWVzc2FnZXMubWFwKG1zZyA9PiAoe1xuXHRcdFx0XHRcdHJvbGU6IG1zZy5yb2xlID09PSBcImFzc2lzdGFudFwiID8gXCJhc3Npc3RhbnRcIiA6IFwidXNlclwiLFxuXHRcdFx0XHRcdGNvbnRlbnQ6IG1zZy5jb250ZW50LFxuXHRcdFx0XHR9KSksXG5cdFx0XHR9KSxcblx0XHR9KTtcblxuXHRcdGlmICghcmVzcG9uc2Uub2spIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgQ2xhdWRlIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cdFx0bG9nRGVidWcoXCJDbGF1ZGUgcmVzcG9uc2VcIiwgeyBkYXRhIH0pO1xuXG5cdFx0cmV0dXJuIGRhdGEuY29udGVudFswXS50ZXh0O1xuXHR9XG5cblx0YXN5bmMgc3RyZWFtUmVzcG9uc2UoXG5cdFx0bWVzc2FnZXM6IEFJTWVzc2FnZVtdLCBcblx0XHRvcHRpb25zOiBHZW5lcmF0ZU9wdGlvbnMsIFxuXHRcdG9uQ2h1bms6IChjaHVuazogU3RyZWFtQ2h1bmspID0+IHZvaWRcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgc3lzdGVtTWVzc2FnZSA9IG1lc3NhZ2VzLmZpbmQobSA9PiBtLnJvbGUgPT09IFwic3lzdGVtXCIpO1xuXHRcdGNvbnN0IHVzZXJNZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihtID0+IG0ucm9sZSAhPT0gXCJzeXN0ZW1cIik7XG5cblx0XHRsb2dEZWJ1ZyhcIkNhbGxpbmcgQ2xhdWRlIHN0cmVhbTpcIiwge1xuXHRcdFx0bWVzc2FnZXM6IHVzZXJNZXNzYWdlcyxcblx0XHRcdHN5c3RlbTogc3lzdGVtTWVzc2FnZT8uY29udGVudCxcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsLFxuXHRcdFx0bWF4X3Rva2Vuczogb3B0aW9ucy5tYXhUb2tlbnMsXG5cdFx0XHR0ZW1wZXJhdHVyZTogb3B0aW9ucy50ZW1wZXJhdHVyZSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5iYXNlVXJsfS92MS9tZXNzYWdlc2AsIHtcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0XHRcIngtYXBpLWtleVwiOiB0aGlzLmNvbmZpZy5hcGlLZXksXG5cdFx0XHRcdFwiYW50aHJvcGljLXZlcnNpb25cIjogXCIyMDIzLTA2LTAxXCIsXG5cdFx0XHR9LFxuXHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRtb2RlbDogb3B0aW9ucy5tb2RlbCB8fCBcImNsYXVkZS0zLTUtc29ubmV0LTIwMjQxMDIyXCIsXG5cdFx0XHRcdG1heF90b2tlbnM6IG9wdGlvbnMubWF4VG9rZW5zIHx8IDQwOTYsXG5cdFx0XHRcdHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXBlcmF0dXJlLFxuXHRcdFx0XHRzeXN0ZW06IHN5c3RlbU1lc3NhZ2U/LmNvbnRlbnQsXG5cdFx0XHRcdG1lc3NhZ2VzOiB1c2VyTWVzc2FnZXMubWFwKG1zZyA9PiAoe1xuXHRcdFx0XHRcdHJvbGU6IG1zZy5yb2xlID09PSBcImFzc2lzdGFudFwiID8gXCJhc3Npc3RhbnRcIiA6IFwidXNlclwiLFxuXHRcdFx0XHRcdGNvbnRlbnQ6IG1zZy5jb250ZW50LFxuXHRcdFx0XHR9KSksXG5cdFx0XHRcdHN0cmVhbTogdHJ1ZSxcblx0XHRcdH0pLFxuXHRcdH0pO1xuXG5cdFx0aWYgKCFyZXNwb25zZS5vaykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDbGF1ZGUgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keT8uZ2V0UmVhZGVyKCk7XG5cdFx0aWYgKCFyZWFkZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHJlc3BvbnNlIGJvZHlcIik7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXHRcdGxldCBidWZmZXIgPSBcIlwiO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRcdGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cdFx0XHRcdGlmIChkb25lKSBicmVhaztcblxuXHRcdFx0XHRidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuXHRcdFx0XHRjb25zdCBsaW5lcyA9IGJ1ZmZlci5zcGxpdChcIlxcblwiKTtcblx0XHRcdFx0YnVmZmVyID0gbGluZXMucG9wKCkgfHwgXCJcIjtcblxuXHRcdFx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcblx0XHRcdFx0XHRpZiAobGluZS5zdGFydHNXaXRoKFwiZGF0YTogXCIpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBkYXRhID0gbGluZS5zbGljZSg2KTtcblx0XHRcdFx0XHRcdGlmIChkYXRhID09PSBcIltET05FXVwiKSB7XG5cdFx0XHRcdFx0XHRcdG9uQ2h1bmsoeyBjb250ZW50OiBcIlwiLCBkb25lOiB0cnVlIH0pO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSk7XG5cdFx0XHRcdFx0XHRcdGlmIChwYXJzZWQudHlwZSA9PT0gXCJjb250ZW50X2Jsb2NrX2RlbHRhXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRvbkNodW5rKHsgY29udGVudDogcGFyc2VkLmRlbHRhLnRleHQgfHwgXCJcIiwgZG9uZTogZmFsc2UgfSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdFx0Ly8gU2tpcCBpbnZhbGlkIEpTT05cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0cmVhZGVyLnJlbGVhc2VMb2NrKCk7XG5cdFx0fVxuXG5cdFx0b25DaHVuayh7IGNvbnRlbnQ6IFwiXCIsIGRvbmU6IHRydWUgfSk7XG5cdH1cblxuXHRhc3luYyBnZW5lcmF0ZUltYWdlKHByb21wdDogc3RyaW5nLCBvcHRpb25zOiBJbWFnZUdlbmVyYXRlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDbGF1ZGUgZG9lcyBub3Qgc3VwcG9ydCBpbWFnZSBnZW5lcmF0aW9uXCIpO1xuXHR9XG59Il19