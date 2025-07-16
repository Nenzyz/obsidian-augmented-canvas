import { __awaiter } from "tslib";
import { logDebug } from "src/logDebug";
import { AIProvider } from "./types";
export class GeminiProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.name = "Gemini";
        this.baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com";
    }
    getModels() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/v1/models?key=${this.config.apiKey}`);
                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.statusText}`);
                }
                const data = yield response.json();
                return data.models
                    .filter((model) => model.name.includes('gemini'))
                    .map((model) => ({
                    id: model.name.replace('models/', ''),
                    name: model.displayName || model.name,
                    tokenLimit: model.inputTokenLimit,
                    supportsStreaming: true,
                }));
            }
            catch (error) {
                logDebug("Failed to fetch Gemini models", error);
                return this.getStaticModels();
            }
        });
    }
    getChatModels() {
        return __awaiter(this, void 0, void 0, function* () {
            const models = yield this.getModels();
            return models.filter(model => !model.id.includes('vision') &&
                !model.id.includes('embedding'));
        });
    }
    getImageModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return []; // Gemini doesn't support image generation via API
        });
    }
    getStaticModels() {
        return [
            {
                id: "gemini-1.5-pro",
                name: "Gemini 1.5 Pro",
                tokenLimit: 2097152,
                supportsStreaming: true,
            },
            {
                id: "gemini-1.5-flash",
                name: "Gemini 1.5 Flash",
                tokenLimit: 1048576,
                supportsStreaming: true,
            },
            {
                id: "gemini-pro",
                name: "Gemini Pro",
                tokenLimit: 32768,
                supportsStreaming: true,
            },
        ];
    }
    generateResponse(messages, options = {}) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const systemMessage = messages.find(m => m.role === "system");
            const conversationMessages = messages.filter(m => m.role !== "system");
            // Convert messages to Gemini format
            const contents = conversationMessages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
            }));
            const requestBody = {
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
            const modelId = options.model || "gemini-1.5-pro";
            const response = yield fetch(`${this.baseUrl}/v1beta/models/${modelId}:generateContent?key=${this.config.apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }
            const data = yield response.json();
            logDebug("Gemini response", { data });
            if (data.candidates && ((_d = (_c = (_b = (_a = data.candidates[0]) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.parts) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text)) {
                return data.candidates[0].content.parts[0].text;
            }
            throw new Error("No response from Gemini");
        });
    }
    streamResponse(messages, options, onChunk) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const systemMessage = messages.find(m => m.role === "system");
            const conversationMessages = messages.filter(m => m.role !== "system");
            const contents = conversationMessages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
            }));
            const requestBody = {
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
            const modelId = options.model || "gemini-1.5-pro";
            const response = yield fetch(`${this.baseUrl}/v1beta/models/${modelId}:streamGenerateContent?key=${this.config.apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
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
                        if (line.trim() && line.startsWith("{")) {
                            try {
                                const data = JSON.parse(line);
                                if ((_f = (_e = (_d = (_c = (_b = data.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) {
                                    onChunk({
                                        content: data.candidates[0].content.parts[0].text,
                                        done: false
                                    });
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
            throw new Error("Gemini does not support image generation");
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VtaW5pLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2VtaW5pLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxVQUFVLEVBQTRGLE1BQU0sU0FBUyxDQUFDO0FBTS9ILE1BQU0sT0FBTyxjQUFlLFNBQVEsVUFBVTtJQUk3QyxZQUFZLE1BQW9CO1FBQy9CLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUpmLFNBQUksR0FBRyxRQUFRLENBQUM7UUFLZixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksMkNBQTJDLENBQUM7SUFDOUUsQ0FBQztJQUVLLFNBQVM7O1lBQ2QsSUFBSTtnQkFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGtCQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ3BGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFO29CQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztpQkFDNUQ7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25DLE9BQU8sSUFBSSxDQUFDLE1BQU07cUJBQ2hCLE1BQU0sQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ3JELEdBQUcsQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDckIsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7b0JBQ3JDLElBQUksRUFBRSxLQUFLLENBQUMsV0FBVyxJQUFJLEtB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QyxDQUFDLDBDQUFFLElBQUksRUFBRTtvQ0FDcEQsT0FBTyxDQUFDO3dDQUNQLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTt3Q0FDakQsSUFBSSxFQUFFLEtBQUs7cUNBQ1gsQ0FBQyxDQUFDO2lDQUNIOzZCQUNEOzRCQUFDLE9BQU8sQ0FBQyxFQUFFO2dDQUNYLG9CQUFvQjs2QkFDcEI7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtvQkFBUztnQkFDVCxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDckI7WUFFRCxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDOztLQUNyQztJQUVLLGFBQWEsQ0FBQyxNQUFjLEVBQUUsVUFBZ0MsRUFBRTs7WUFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTtDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9nRGVidWcgfSBmcm9tIFwic3JjL2xvZ0RlYnVnXCI7XG5pbXBvcnQgeyBBSVByb3ZpZGVyLCBBSU1vZGVsLCBBSU1lc3NhZ2UsIFN0cmVhbUNodW5rLCBHZW5lcmF0ZU9wdGlvbnMsIEltYWdlR2VuZXJhdGVPcHRpb25zLCBBSVByb3ZpZGVyQ29uZmlnIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBHZW1pbmlDb25maWcgZXh0ZW5kcyBBSVByb3ZpZGVyQ29uZmlnIHtcblx0YmFzZVVybD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEdlbWluaVByb3ZpZGVyIGV4dGVuZHMgQUlQcm92aWRlciB7XG5cdG5hbWUgPSBcIkdlbWluaVwiO1xuXHRwcml2YXRlIGJhc2VVcmw6IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihjb25maWc6IEdlbWluaUNvbmZpZykge1xuXHRcdHN1cGVyKGNvbmZpZyk7XG5cdFx0dGhpcy5iYXNlVXJsID0gY29uZmlnLmJhc2VVcmwgfHwgXCJodHRwczovL2dlbmVyYXRpdmVsYW5ndWFnZS5nb29nbGVhcGlzLmNvbVwiO1xuXHR9XG5cblx0YXN5bmMgZ2V0TW9kZWxzKCk6IFByb21pc2U8QUlNb2RlbFtdPiB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5iYXNlVXJsfS92MS9tb2RlbHM/a2V5PSR7dGhpcy5jb25maWcuYXBpS2V5fWApO1xuXHRcdFx0aWYgKCFyZXNwb25zZS5vaykge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEdlbWluaSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Y29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcblx0XHRcdHJldHVybiBkYXRhLm1vZGVsc1xuXHRcdFx0XHQuZmlsdGVyKChtb2RlbDogYW55KSA9PiBtb2RlbC5uYW1lLmluY2x1ZGVzKCdnZW1pbmknKSlcblx0XHRcdFx0Lm1hcCgobW9kZWw6IGFueSkgPT4gKHtcblx0XHRcdFx0XHRpZDogbW9kZWwubmFtZS5yZXBsYWNlKCdtb2RlbHMvJywgJycpLFxuXHRcdFx0XHRcdG5hbWU6IG1vZGVsLmRpc3BsYXlOYW1lIHx8IG1vZGVsLm5hbWUsXG5cdFx0XHRcdFx0dG9rZW5MaW1pdDogbW9kZWwuaW5wdXRUb2tlbkxpbWl0LFxuXHRcdFx0XHRcdHN1cHBvcnRzU3RyZWFtaW5nOiB0cnVlLFxuXHRcdFx0XHR9KSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGxvZ0RlYnVnKFwiRmFpbGVkIHRvIGZldGNoIEdlbWluaSBtb2RlbHNcIiwgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0U3RhdGljTW9kZWxzKCk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZ2V0Q2hhdE1vZGVscygpOiBQcm9taXNlPEFJTW9kZWxbXT4ge1xuXHRcdGNvbnN0IG1vZGVscyA9IGF3YWl0IHRoaXMuZ2V0TW9kZWxzKCk7XG5cdFx0cmV0dXJuIG1vZGVscy5maWx0ZXIobW9kZWwgPT4gXG5cdFx0XHQhbW9kZWwuaWQuaW5jbHVkZXMoJ3Zpc2lvbicpICYmIFxuXHRcdFx0IW1vZGVsLmlkLmluY2x1ZGVzKCdlbWJlZGRpbmcnKVxuXHRcdCk7XG5cdH1cblxuXHRhc3luYyBnZXRJbWFnZU1vZGVscygpOiBQcm9taXNlPEFJTW9kZWxbXT4ge1xuXHRcdHJldHVybiBbXTsgLy8gR2VtaW5pIGRvZXNuJ3Qgc3VwcG9ydCBpbWFnZSBnZW5lcmF0aW9uIHZpYSBBUElcblx0fVxuXG5cdHByaXZhdGUgZ2V0U3RhdGljTW9kZWxzKCk6IEFJTW9kZWxbXSB7XG5cdFx0cmV0dXJuIFtcblx0XHRcdHtcblx0XHRcdFx0aWQ6IFwiZ2VtaW5pLTEuNS1wcm9cIixcblx0XHRcdFx0bmFtZTogXCJHZW1pbmkgMS41IFByb1wiLFxuXHRcdFx0XHR0b2tlbkxpbWl0OiAyMDk3MTUyLFxuXHRcdFx0XHRzdXBwb3J0c1N0cmVhbWluZzogdHJ1ZSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiBcImdlbWluaS0xLjUtZmxhc2hcIixcblx0XHRcdFx0bmFtZTogXCJHZW1pbmkgMS41IEZsYXNoXCIsXG5cdFx0XHRcdHRva2VuTGltaXQ6IDEwNDg1NzYsXG5cdFx0XHRcdHN1cHBvcnRzU3RyZWFtaW5nOiB0cnVlLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0aWQ6IFwiZ2VtaW5pLXByb1wiLFxuXHRcdFx0XHRuYW1lOiBcIkdlbWluaSBQcm9cIixcblx0XHRcdFx0dG9rZW5MaW1pdDogMzI3NjgsXG5cdFx0XHRcdHN1cHBvcnRzU3RyZWFtaW5nOiB0cnVlLFxuXHRcdFx0fSxcblx0XHRdO1xuXHR9XG5cblx0YXN5bmMgZ2VuZXJhdGVSZXNwb25zZShtZXNzYWdlczogQUlNZXNzYWdlW10sIG9wdGlvbnM6IEdlbmVyYXRlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCBzeXN0ZW1NZXNzYWdlID0gbWVzc2FnZXMuZmluZChtID0+IG0ucm9sZSA9PT0gXCJzeXN0ZW1cIik7XG5cdFx0Y29uc3QgY29udmVyc2F0aW9uTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIobSA9PiBtLnJvbGUgIT09IFwic3lzdGVtXCIpO1xuXG5cdFx0Ly8gQ29udmVydCBtZXNzYWdlcyB0byBHZW1pbmkgZm9ybWF0XG5cdFx0Y29uc3QgY29udGVudHMgPSBjb252ZXJzYXRpb25NZXNzYWdlcy5tYXAobXNnID0+ICh7XG5cdFx0XHRyb2xlOiBtc2cucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiA/IFwibW9kZWxcIiA6IFwidXNlclwiLFxuXHRcdFx0cGFydHM6IFt7IHRleHQ6IG1zZy5jb250ZW50IH1dLFxuXHRcdH0pKTtcblxuXHRcdGNvbnN0IHJlcXVlc3RCb2R5OiBhbnkgPSB7XG5cdFx0XHRjb250ZW50cyxcblx0XHRcdGdlbmVyYXRpb25Db25maWc6IHtcblx0XHRcdFx0dGVtcGVyYXR1cmU6IG9wdGlvbnMudGVtcGVyYXR1cmUsXG5cdFx0XHRcdG1heE91dHB1dFRva2Vuczogb3B0aW9ucy5tYXhUb2tlbnMsXG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRpZiAoc3lzdGVtTWVzc2FnZSkge1xuXHRcdFx0cmVxdWVzdEJvZHkuc3lzdGVtSW5zdHJ1Y3Rpb24gPSB7XG5cdFx0XHRcdHBhcnRzOiBbeyB0ZXh0OiBzeXN0ZW1NZXNzYWdlLmNvbnRlbnQgfV0sXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGxvZ0RlYnVnKFwiQ2FsbGluZyBHZW1pbmk6XCIsIHtcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsLFxuXHRcdFx0cmVxdWVzdEJvZHksXG5cdFx0fSk7XG5cblx0XHRjb25zdCBtb2RlbElkID0gb3B0aW9ucy5tb2RlbCB8fCBcImdlbWluaS0xLjUtcHJvXCI7XG5cdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcblx0XHRcdGAke3RoaXMuYmFzZVVybH0vdjFiZXRhL21vZGVscy8ke21vZGVsSWR9OmdlbmVyYXRlQ29udGVudD9rZXk9JHt0aGlzLmNvbmZpZy5hcGlLZXl9YCxcblx0XHRcdHtcblx0XHRcdFx0bWV0aG9kOiBcIlBPU1RcIixcblx0XHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHRcdFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSksXG5cdFx0XHR9XG5cdFx0KTtcblxuXHRcdGlmICghcmVzcG9uc2Uub2spIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgR2VtaW5pIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cdFx0bG9nRGVidWcoXCJHZW1pbmkgcmVzcG9uc2VcIiwgeyBkYXRhIH0pO1xuXG5cdFx0aWYgKGRhdGEuY2FuZGlkYXRlcyAmJiBkYXRhLmNhbmRpZGF0ZXNbMF0/LmNvbnRlbnQ/LnBhcnRzPy5bMF0/LnRleHQpIHtcblx0XHRcdHJldHVybiBkYXRhLmNhbmRpZGF0ZXNbMF0uY29udGVudC5wYXJ0c1swXS50ZXh0O1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHJlc3BvbnNlIGZyb20gR2VtaW5pXCIpO1xuXHR9XG5cblx0YXN5bmMgc3RyZWFtUmVzcG9uc2UoXG5cdFx0bWVzc2FnZXM6IEFJTWVzc2FnZVtdLCBcblx0XHRvcHRpb25zOiBHZW5lcmF0ZU9wdGlvbnMsIFxuXHRcdG9uQ2h1bms6IChjaHVuazogU3RyZWFtQ2h1bmspID0+IHZvaWRcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgc3lzdGVtTWVzc2FnZSA9IG1lc3NhZ2VzLmZpbmQobSA9PiBtLnJvbGUgPT09IFwic3lzdGVtXCIpO1xuXHRcdGNvbnN0IGNvbnZlcnNhdGlvbk1lc3NhZ2VzID0gbWVzc2FnZXMuZmlsdGVyKG0gPT4gbS5yb2xlICE9PSBcInN5c3RlbVwiKTtcblxuXHRcdGNvbnN0IGNvbnRlbnRzID0gY29udmVyc2F0aW9uTWVzc2FnZXMubWFwKG1zZyA9PiAoe1xuXHRcdFx0cm9sZTogbXNnLnJvbGUgPT09IFwiYXNzaXN0YW50XCIgPyBcIm1vZGVsXCIgOiBcInVzZXJcIixcblx0XHRcdHBhcnRzOiBbeyB0ZXh0OiBtc2cuY29udGVudCB9XSxcblx0XHR9KSk7XG5cblx0XHRjb25zdCByZXF1ZXN0Qm9keTogYW55ID0ge1xuXHRcdFx0Y29udGVudHMsXG5cdFx0XHRnZW5lcmF0aW9uQ29uZmlnOiB7XG5cdFx0XHRcdHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXBlcmF0dXJlLFxuXHRcdFx0XHRtYXhPdXRwdXRUb2tlbnM6IG9wdGlvbnMubWF4VG9rZW5zLFxuXHRcdFx0fSxcblx0XHR9O1xuXG5cdFx0aWYgKHN5c3RlbU1lc3NhZ2UpIHtcblx0XHRcdHJlcXVlc3RCb2R5LnN5c3RlbUluc3RydWN0aW9uID0ge1xuXHRcdFx0XHRwYXJ0czogW3sgdGV4dDogc3lzdGVtTWVzc2FnZS5jb250ZW50IH1dLFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRsb2dEZWJ1ZyhcIkNhbGxpbmcgR2VtaW5pIHN0cmVhbTpcIiwge1xuXHRcdFx0bW9kZWw6IG9wdGlvbnMubW9kZWwsXG5cdFx0XHRyZXF1ZXN0Qm9keSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IG1vZGVsSWQgPSBvcHRpb25zLm1vZGVsIHx8IFwiZ2VtaW5pLTEuNS1wcm9cIjtcblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuXHRcdFx0YCR7dGhpcy5iYXNlVXJsfS92MWJldGEvbW9kZWxzLyR7bW9kZWxJZH06c3RyZWFtR2VuZXJhdGVDb250ZW50P2tleT0ke3RoaXMuY29uZmlnLmFwaUtleX1gLFxuXHRcdFx0e1xuXHRcdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxuXHRcdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFx0XCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3RCb2R5KSxcblx0XHRcdH1cblx0XHQpO1xuXG5cdFx0aWYgKCFyZXNwb25zZS5vaykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBHZW1pbmkgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keT8uZ2V0UmVhZGVyKCk7XG5cdFx0aWYgKCFyZWFkZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHJlc3BvbnNlIGJvZHlcIik7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXHRcdGxldCBidWZmZXIgPSBcIlwiO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRcdGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cdFx0XHRcdGlmIChkb25lKSBicmVhaztcblxuXHRcdFx0XHRidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuXHRcdFx0XHRjb25zdCBsaW5lcyA9IGJ1ZmZlci5zcGxpdChcIlxcblwiKTtcblx0XHRcdFx0YnVmZmVyID0gbGluZXMucG9wKCkgfHwgXCJcIjtcblxuXHRcdFx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcblx0XHRcdFx0XHRpZiAobGluZS50cmltKCkgJiYgbGluZS5zdGFydHNXaXRoKFwie1wiKSkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZGF0YSA9IEpTT04ucGFyc2UobGluZSk7XG5cdFx0XHRcdFx0XHRcdGlmIChkYXRhLmNhbmRpZGF0ZXM/LlswXT8uY29udGVudD8ucGFydHM/LlswXT8udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRcdG9uQ2h1bmsoeyBcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IGRhdGEuY2FuZGlkYXRlc1swXS5jb250ZW50LnBhcnRzWzBdLnRleHQsIFxuXHRcdFx0XHRcdFx0XHRcdFx0ZG9uZTogZmFsc2UgXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdFx0Ly8gU2tpcCBpbnZhbGlkIEpTT05cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0cmVhZGVyLnJlbGVhc2VMb2NrKCk7XG5cdFx0fVxuXG5cdFx0b25DaHVuayh7IGNvbnRlbnQ6IFwiXCIsIGRvbmU6IHRydWUgfSk7XG5cdH1cblxuXHRhc3luYyBnZW5lcmF0ZUltYWdlKHByb21wdDogc3RyaW5nLCBvcHRpb25zOiBJbWFnZUdlbmVyYXRlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJHZW1pbmkgZG9lcyBub3Qgc3VwcG9ydCBpbWFnZSBnZW5lcmF0aW9uXCIpO1xuXHR9XG59Il19