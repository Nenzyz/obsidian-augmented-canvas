import { __awaiter } from "tslib";
import { logDebug } from "src/logDebug";
import { AIProvider } from "./types";
export class OllamaProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.name = "Ollama";
        this.baseUrl = config.baseUrl || "http://localhost:11434";
    }
    getModels() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/api/tags`);
                if (!response.ok) {
                    throw new Error(`Ollama API error: ${response.statusText}`);
                }
                const data = yield response.json();
                return data.models.map((model) => {
                    var _a;
                    return ({
                        id: model.name,
                        name: model.name,
                        tokenLimit: ((_a = model.details) === null || _a === void 0 ? void 0 : _a.parameter_size) ? undefined : 4096,
                        supportsStreaming: true,
                    });
                });
            }
            catch (error) {
                logDebug("Failed to fetch Ollama models", error);
                return this.getStaticModels();
            }
        });
    }
    getChatModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getModels();
        });
    }
    getImageModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return []; // Ollama doesn't support image generation
        });
    }
    getStaticModels() {
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
    validateConfig() {
        // Ollama doesn't require an API key if running locally
        return true;
    }
    generateResponse(messages, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const systemMessage = messages.find(m => m.role === "system");
            const conversationMessages = messages.filter(m => m.role !== "system");
            const requestBody = {
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
            const response = yield fetch(`${this.baseUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }
            const data = yield response.json();
            logDebug("Ollama response", { data });
            return ((_a = data.message) === null || _a === void 0 ? void 0 : _a.content) || "";
        });
    }
    streamResponse(messages, options, onChunk) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const systemMessage = messages.find(m => m.role === "system");
            const conversationMessages = messages.filter(m => m.role !== "system");
            const requestBody = {
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
            const response = yield fetch(`${this.baseUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
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
                        if (line.trim()) {
                            try {
                                const data = JSON.parse(line);
                                if ((_b = data.message) === null || _b === void 0 ? void 0 : _b.content) {
                                    onChunk({ content: data.message.content, done: false });
                                }
                                if (data.done) {
                                    onChunk({ content: "", done: true });
                                    return;
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
            throw new Error("Ollama does not support image generation");
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xsYW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib2xsYW1hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxVQUFVLEVBQTRGLE1BQU0sU0FBUyxDQUFDO0FBTS9ILE1BQU0sT0FBTyxjQUFlLFNBQVEsVUFBVTtJQUk3QyxZQUFZLE1BQW9CO1FBQy9CLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUpmLFNBQUksR0FBRyxRQUFRLENBQUM7UUFLZixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksd0JBQXdCLENBQUM7SUFDM0QsQ0FBQztJQUVLLFNBQVM7O1lBQ2QsSUFBSTtnQkFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLFdBQVcsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtvQkFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7aUJBQzVEO2dCQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNuQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7O29CQUFDLE9BQUEsQ0FBQzt3QkFDdkMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJO3dCQUNkLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTt3QkFDaEIsVUFBVSxFQUFFLENBQUEsTUFBQSxLQUFLLENBQUMsT0FBTywwQ0FBRSxjQUFjLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSTt3QkFDNUQsaUJBQWlCLEVBQUUsSUFBSTtxQkFDdkIsQ0FBQyxDQUFBO2lCQUFBLENBQUMsQ0FBQzthQUNKO1lB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QUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29DQUNyQyxPQUFPO2lDQUNQOzZCQUNEOzRCQUFDLE9BQU8sQ0FBQyxFQUFFO2dDQUNYLG9CQUFvQjs2QkFDcEI7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtvQkFBUztnQkFDVCxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDckI7WUFFRCxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDOztLQUNyQztJQUVLLGFBQWEsQ0FBQyxNQUFjLEVBQUUsVUFBZ0MsRUFBRTs7WUFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTtDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9nRGVidWcgfSBmcm9tIFwic3JjL2xvZ0RlYnVnXCI7XG5pbXBvcnQgeyBBSVByb3ZpZGVyLCBBSU1vZGVsLCBBSU1lc3NhZ2UsIFN0cmVhbUNodW5rLCBHZW5lcmF0ZU9wdGlvbnMsIEltYWdlR2VuZXJhdGVPcHRpb25zLCBBSVByb3ZpZGVyQ29uZmlnIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBPbGxhbWFDb25maWcgZXh0ZW5kcyBBSVByb3ZpZGVyQ29uZmlnIHtcblx0YmFzZVVybD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIE9sbGFtYVByb3ZpZGVyIGV4dGVuZHMgQUlQcm92aWRlciB7XG5cdG5hbWUgPSBcIk9sbGFtYVwiO1xuXHRwcml2YXRlIGJhc2VVcmw6IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihjb25maWc6IE9sbGFtYUNvbmZpZykge1xuXHRcdHN1cGVyKGNvbmZpZyk7XG5cdFx0dGhpcy5iYXNlVXJsID0gY29uZmlnLmJhc2VVcmwgfHwgXCJodHRwOi8vbG9jYWxob3N0OjExNDM0XCI7XG5cdH1cblxuXHRhc3luYyBnZXRNb2RlbHMoKTogUHJvbWlzZTxBSU1vZGVsW10+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt0aGlzLmJhc2VVcmx9L2FwaS90YWdzYCk7XG5cdFx0XHRpZiAoIXJlc3BvbnNlLm9rKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgT2xsYW1hIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuXHRcdFx0cmV0dXJuIGRhdGEubW9kZWxzLm1hcCgobW9kZWw6IGFueSkgPT4gKHtcblx0XHRcdFx0aWQ6IG1vZGVsLm5hbWUsXG5cdFx0XHRcdG5hbWU6IG1vZGVsLm5hbWUsXG5cdFx0XHRcdHRva2VuTGltaXQ6IG1vZGVsLmRldGFpbHM/LnBhcmFtZXRlcl9zaXplID8gdW5kZWZpbmVkIDogNDA5Nixcblx0XHRcdFx0c3VwcG9ydHNTdHJlYW1pbmc6IHRydWUsXG5cdFx0XHR9KSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGxvZ0RlYnVnKFwiRmFpbGVkIHRvIGZldGNoIE9sbGFtYSBtb2RlbHNcIiwgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0U3RhdGljTW9kZWxzKCk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZ2V0Q2hhdE1vZGVscygpOiBQcm9taXNlPEFJTW9kZWxbXT4ge1xuXHRcdHJldHVybiB0aGlzLmdldE1vZGVscygpO1xuXHR9XG5cblx0YXN5bmMgZ2V0SW1hZ2VNb2RlbHMoKTogUHJvbWlzZTxBSU1vZGVsW10+IHtcblx0XHRyZXR1cm4gW107IC8vIE9sbGFtYSBkb2Vzbid0IHN1cHBvcnQgaW1hZ2UgZ2VuZXJhdGlvblxuXHR9XG5cblx0cHJpdmF0ZSBnZXRTdGF0aWNNb2RlbHMoKTogQUlNb2RlbFtdIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0e1xuXHRcdFx0XHRpZDogXCJsbGFtYTMuMlwiLFxuXHRcdFx0XHRuYW1lOiBcIkxsYW1hIDMuMlwiLFxuXHRcdFx0XHRzdXBwb3J0c1N0cmVhbWluZzogdHJ1ZSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiBcImxsYW1hMy4xXCIsXG5cdFx0XHRcdG5hbWU6IFwiTGxhbWEgMy4xXCIsXG5cdFx0XHRcdHN1cHBvcnRzU3RyZWFtaW5nOiB0cnVlLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0aWQ6IFwiY29kZWxsYW1hXCIsXG5cdFx0XHRcdG5hbWU6IFwiQ29kZSBMbGFtYVwiLFxuXHRcdFx0XHRzdXBwb3J0c1N0cmVhbWluZzogdHJ1ZSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiBcIm1pc3RyYWxcIixcblx0XHRcdFx0bmFtZTogXCJNaXN0cmFsXCIsXG5cdFx0XHRcdHN1cHBvcnRzU3RyZWFtaW5nOiB0cnVlLFxuXHRcdFx0fSxcblx0XHRdO1xuXHR9XG5cblx0dmFsaWRhdGVDb25maWcoKTogYm9vbGVhbiB7XG5cdFx0Ly8gT2xsYW1hIGRvZXNuJ3QgcmVxdWlyZSBhbiBBUEkga2V5IGlmIHJ1bm5pbmcgbG9jYWxseVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0YXN5bmMgZ2VuZXJhdGVSZXNwb25zZShtZXNzYWdlczogQUlNZXNzYWdlW10sIG9wdGlvbnM6IEdlbmVyYXRlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCBzeXN0ZW1NZXNzYWdlID0gbWVzc2FnZXMuZmluZChtID0+IG0ucm9sZSA9PT0gXCJzeXN0ZW1cIik7XG5cdFx0Y29uc3QgY29udmVyc2F0aW9uTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIobSA9PiBtLnJvbGUgIT09IFwic3lzdGVtXCIpO1xuXG5cdFx0Y29uc3QgcmVxdWVzdEJvZHk6IGFueSA9IHtcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsIHx8IFwibGxhbWEzLjJcIixcblx0XHRcdG1lc3NhZ2VzOiBjb252ZXJzYXRpb25NZXNzYWdlcyxcblx0XHRcdHN0cmVhbTogZmFsc2UsXG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXBlcmF0dXJlLFxuXHRcdFx0XHRudW1fcHJlZGljdDogb3B0aW9ucy5tYXhUb2tlbnMsXG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRpZiAoc3lzdGVtTWVzc2FnZSkge1xuXHRcdFx0cmVxdWVzdEJvZHkubWVzc2FnZXMudW5zaGlmdCh7XG5cdFx0XHRcdHJvbGU6IFwic3lzdGVtXCIsXG5cdFx0XHRcdGNvbnRlbnQ6IHN5c3RlbU1lc3NhZ2UuY29udGVudCxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGxvZ0RlYnVnKFwiQ2FsbGluZyBPbGxhbWE6XCIsIHtcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsLFxuXHRcdFx0cmVxdWVzdEJvZHksXG5cdFx0fSk7XG5cblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3RoaXMuYmFzZVVybH0vYXBpL2NoYXRgLCB7XG5cdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxuXHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHRcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcblx0XHRcdH0sXG5cdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSksXG5cdFx0fSk7XG5cblx0XHRpZiAoIXJlc3BvbnNlLm9rKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYE9sbGFtYSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcblx0XHR9XG5cblx0XHRjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuXHRcdGxvZ0RlYnVnKFwiT2xsYW1hIHJlc3BvbnNlXCIsIHsgZGF0YSB9KTtcblxuXHRcdHJldHVybiBkYXRhLm1lc3NhZ2U/LmNvbnRlbnQgfHwgXCJcIjtcblx0fVxuXG5cdGFzeW5jIHN0cmVhbVJlc3BvbnNlKFxuXHRcdG1lc3NhZ2VzOiBBSU1lc3NhZ2VbXSwgXG5cdFx0b3B0aW9uczogR2VuZXJhdGVPcHRpb25zLCBcblx0XHRvbkNodW5rOiAoY2h1bms6IFN0cmVhbUNodW5rKSA9PiB2b2lkXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHN5c3RlbU1lc3NhZ2UgPSBtZXNzYWdlcy5maW5kKG0gPT4gbS5yb2xlID09PSBcInN5c3RlbVwiKTtcblx0XHRjb25zdCBjb252ZXJzYXRpb25NZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihtID0+IG0ucm9sZSAhPT0gXCJzeXN0ZW1cIik7XG5cblx0XHRjb25zdCByZXF1ZXN0Qm9keTogYW55ID0ge1xuXHRcdFx0bW9kZWw6IG9wdGlvbnMubW9kZWwgfHwgXCJsbGFtYTMuMlwiLFxuXHRcdFx0bWVzc2FnZXM6IGNvbnZlcnNhdGlvbk1lc3NhZ2VzLFxuXHRcdFx0c3RyZWFtOiB0cnVlLFxuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHR0ZW1wZXJhdHVyZTogb3B0aW9ucy50ZW1wZXJhdHVyZSxcblx0XHRcdFx0bnVtX3ByZWRpY3Q6IG9wdGlvbnMubWF4VG9rZW5zLFxuXHRcdFx0fSxcblx0XHR9O1xuXG5cdFx0aWYgKHN5c3RlbU1lc3NhZ2UpIHtcblx0XHRcdHJlcXVlc3RCb2R5Lm1lc3NhZ2VzLnVuc2hpZnQoe1xuXHRcdFx0XHRyb2xlOiBcInN5c3RlbVwiLFxuXHRcdFx0XHRjb250ZW50OiBzeXN0ZW1NZXNzYWdlLmNvbnRlbnQsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRsb2dEZWJ1ZyhcIkNhbGxpbmcgT2xsYW1hIHN0cmVhbTpcIiwge1xuXHRcdFx0bW9kZWw6IG9wdGlvbnMubW9kZWwsXG5cdFx0XHRyZXF1ZXN0Qm9keSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5iYXNlVXJsfS9hcGkvY2hhdGAsIHtcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0fSxcblx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3RCb2R5KSxcblx0XHR9KTtcblxuXHRcdGlmICghcmVzcG9uc2Uub2spIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgT2xsYW1hIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHk/LmdldFJlYWRlcigpO1xuXHRcdGlmICghcmVhZGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyByZXNwb25zZSBib2R5XCIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblx0XHRsZXQgYnVmZmVyID0gXCJcIjtcblxuXHRcdHRyeSB7XG5cdFx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0XHRjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuXHRcdFx0XHRpZiAoZG9uZSkgYnJlYWs7XG5cblx0XHRcdFx0YnVmZmVyICs9IGRlY29kZXIuZGVjb2RlKHZhbHVlLCB7IHN0cmVhbTogdHJ1ZSB9KTtcblx0XHRcdFx0Y29uc3QgbGluZXMgPSBidWZmZXIuc3BsaXQoXCJcXG5cIik7XG5cdFx0XHRcdGJ1ZmZlciA9IGxpbmVzLnBvcCgpIHx8IFwiXCI7XG5cblx0XHRcdFx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG5cdFx0XHRcdFx0aWYgKGxpbmUudHJpbSgpKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkYXRhID0gSlNPTi5wYXJzZShsaW5lKTtcblx0XHRcdFx0XHRcdFx0aWYgKGRhdGEubWVzc2FnZT8uY29udGVudCkge1xuXHRcdFx0XHRcdFx0XHRcdG9uQ2h1bmsoeyBjb250ZW50OiBkYXRhLm1lc3NhZ2UuY29udGVudCwgZG9uZTogZmFsc2UgfSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKGRhdGEuZG9uZSkge1xuXHRcdFx0XHRcdFx0XHRcdG9uQ2h1bmsoeyBjb250ZW50OiBcIlwiLCBkb25lOiB0cnVlIH0pO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0XHQvLyBTa2lwIGludmFsaWQgSlNPTlxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRyZWFkZXIucmVsZWFzZUxvY2soKTtcblx0XHR9XG5cblx0XHRvbkNodW5rKHsgY29udGVudDogXCJcIiwgZG9uZTogdHJ1ZSB9KTtcblx0fVxuXG5cdGFzeW5jIGdlbmVyYXRlSW1hZ2UocHJvbXB0OiBzdHJpbmcsIG9wdGlvbnM6IEltYWdlR2VuZXJhdGVPcHRpb25zID0ge30pOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIk9sbGFtYSBkb2VzIG5vdCBzdXBwb3J0IGltYWdlIGdlbmVyYXRpb25cIik7XG5cdH1cbn0iXX0=