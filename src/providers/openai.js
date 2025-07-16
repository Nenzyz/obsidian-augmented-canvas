import { __asyncValues, __awaiter } from "tslib";
import OpenAI from "openai";
import { logDebug } from "src/logDebug";
import { AIProvider } from "./types";
export class OpenAIProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.name = "OpenAI";
        this.client = new OpenAI({
            apiKey: config.apiKey,
            dangerouslyAllowBrowser: true,
        });
    }
    getModels() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.models.list();
                return response.data.map(model => ({
                    id: model.id,
                    name: model.id,
                    supportsStreaming: true,
                }));
            }
            catch (error) {
                logDebug("Failed to fetch OpenAI models", error);
                return this.getStaticModels();
            }
        });
    }
    getChatModels() {
        return __awaiter(this, void 0, void 0, function* () {
            const models = yield this.getModels();
            return models.filter(model => model.id.includes('gpt') &&
                !model.id.includes('instruct'));
        });
    }
    getImageModels() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    getStaticModels() {
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
    generateResponse(messages, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const openaiMessages = messages.map(msg => ({
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
            const completion = yield this.client.chat.completions.create({
                model: options.model || "gpt-4-1106-preview",
                messages: openaiMessages,
                max_tokens: options.maxTokens,
                temperature: options.temperature,
                response_format: { type: options.isJSON ? "json_object" : "text" },
            });
            logDebug("OpenAI response", { completion });
            const content = completion.choices[0].message.content;
            return options.isJSON ? JSON.parse(content) : content;
        });
    }
    streamResponse(messages, options, onChunk) {
        var e_1, _a;
        var _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const openaiMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            logDebug("Calling OpenAI stream:", {
                messages: openaiMessages,
                model: options.model,
                max_tokens: options.maxTokens,
                temperature: options.temperature,
            });
            const stream = yield this.client.chat.completions.create({
                model: options.model || "gpt-4",
                messages: openaiMessages,
                stream: true,
                max_tokens: options.maxTokens,
                temperature: options.temperature,
            });
            try {
                for (var stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), !stream_1_1.done;) {
                    const chunk = stream_1_1.value;
                    const content = ((_c = (_b = chunk.choices[0]) === null || _b === void 0 ? void 0 : _b.delta) === null || _c === void 0 ? void 0 : _c.content) || "";
                    logDebug("OpenAI chunk", { chunk });
                    onChunk({ content, done: false });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (stream_1_1 && !stream_1_1.done && (_a = stream_1.return)) yield _a.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            onChunk({ content: "", done: true });
        });
    }
    generateImage(prompt, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            logDebug("Calling OpenAI image generation:", {
                prompt,
                model: options.model,
            });
            const response = yield this.client.images.generate({
                model: options.model || "dall-e-3",
                prompt,
                n: 1,
                size: options.size || (options.isVertical ? "1024x1792" : "1792x1024"),
                response_format: "b64_json",
            });
            logDebug("OpenAI image response", { response });
            return response.data[0].b64_json;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmFpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3BlbmFpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFFNUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN4QyxPQUFPLEVBQUUsVUFBVSxFQUE0RixNQUFNLFNBQVMsQ0FBQztBQUUvSCxNQUFNLE9BQU8sY0FBZSxTQUFRLFVBQVU7SUFJN0MsWUFBWSxNQUF3QjtRQUNuQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFKZixTQUFJLEdBQUcsUUFBUSxDQUFDO1FBS2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQztZQUN4QixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07WUFDckIsdUJBQXVCLEVBQUUsSUFBSTtTQUM3QixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUssU0FBUzs7WUFDZCxJQUFJO2dCQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2pELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ1osSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNkLGlCQUFpQixFQUFFLElBQUk7aUJBQ3ZCLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixRQUFRLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pELE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzlCO1FBQ0YsQ0FBQztLQUFBO0lBRUssYUFBYTs7WUFDbEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEMsT0FBTyxN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QUNOLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSzthQUNwQixDQUFDLENBQUM7WUFFSCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDbEQsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLElBQUksVUFBVTtnQkFDbEMsTUFBTTtnQkFDTixDQUFDLEVBQUUsQ0FBQztnQkFDSixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO2dCQUN0RSxlQUFlLEVBQUUsVUFBVTthQUMzQixDQUFDLENBQUM7WUFFSCxRQUFRLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFTLENBQUM7UUFDbkMsQ0FBQztLQUFBO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT3BlbkFJIGZyb20gXCJvcGVuYWlcIjtcbmltcG9ydCB7IENoYXRDb21wbGV0aW9uTWVzc2FnZVBhcmFtIH0gZnJvbSBcIm9wZW5haS9yZXNvdXJjZXNcIjtcbmltcG9ydCB7IGxvZ0RlYnVnIH0gZnJvbSBcInNyYy9sb2dEZWJ1Z1wiO1xuaW1wb3J0IHsgQUlQcm92aWRlciwgQUlNb2RlbCwgQUlNZXNzYWdlLCBTdHJlYW1DaHVuaywgR2VuZXJhdGVPcHRpb25zLCBJbWFnZUdlbmVyYXRlT3B0aW9ucywgQUlQcm92aWRlckNvbmZpZyB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBPcGVuQUlQcm92aWRlciBleHRlbmRzIEFJUHJvdmlkZXIge1xuXHRuYW1lID0gXCJPcGVuQUlcIjtcblx0cHJpdmF0ZSBjbGllbnQ6IE9wZW5BSTtcblxuXHRjb25zdHJ1Y3Rvcihjb25maWc6IEFJUHJvdmlkZXJDb25maWcpIHtcblx0XHRzdXBlcihjb25maWcpO1xuXHRcdHRoaXMuY2xpZW50ID0gbmV3IE9wZW5BSSh7XG5cdFx0XHRhcGlLZXk6IGNvbmZpZy5hcGlLZXksXG5cdFx0XHRkYW5nZXJvdXNseUFsbG93QnJvd3NlcjogdHJ1ZSxcblx0XHR9KTtcblx0fVxuXG5cdGFzeW5jIGdldE1vZGVscygpOiBQcm9taXNlPEFJTW9kZWxbXT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuY2xpZW50Lm1vZGVscy5saXN0KCk7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YS5tYXAobW9kZWwgPT4gKHtcblx0XHRcdFx0aWQ6IG1vZGVsLmlkLFxuXHRcdFx0XHRuYW1lOiBtb2RlbC5pZCxcblx0XHRcdFx0c3VwcG9ydHNTdHJlYW1pbmc6IHRydWUsXG5cdFx0XHR9KSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGxvZ0RlYnVnKFwiRmFpbGVkIHRvIGZldGNoIE9wZW5BSSBtb2RlbHNcIiwgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0U3RhdGljTW9kZWxzKCk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZ2V0Q2hhdE1vZGVscygpOiBQcm9taXNlPEFJTW9kZWxbXT4ge1xuXHRcdGNvbnN0IG1vZGVscyA9IGF3YWl0IHRoaXMuZ2V0TW9kZWxzKCk7XG5cdFx0cmV0dXJuIG1vZGVscy5maWx0ZXIobW9kZWwgPT4gXG5cdFx0XHRtb2RlbC5pZC5pbmNsdWRlcygnZ3B0JykgJiYgXG5cdFx0XHQhbW9kZWwuaWQuaW5jbHVkZXMoJ2luc3RydWN0Jylcblx0XHQpO1xuXHR9XG5cblx0YXN5bmMgZ2V0SW1hZ2VNb2RlbHMoKTogUHJvbWlzZTxBSU1vZGVsW10+IHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0e1xuXHRcdFx0XHRpZDogXCJkYWxsLWUtMlwiLFxuXHRcdFx0XHRuYW1lOiBcIkRBTEwtRSAyXCIsXG5cdFx0XHRcdHN1cHBvcnRzSW1hZ2VzOiB0cnVlLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0aWQ6IFwiZGFsbC1lLTNcIixcblx0XHRcdFx0bmFtZTogXCJEQUxMLUUgM1wiLFxuXHRcdFx0XHRzdXBwb3J0c0ltYWdlczogdHJ1ZSxcblx0XHRcdH0sXG5cdFx0XTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0U3RhdGljTW9kZWxzKCk6IEFJTW9kZWxbXSB7XG5cdFx0cmV0dXJuIFtcblx0XHRcdHtcblx0XHRcdFx0aWQ6IFwiZ3B0LTRvXCIsXG5cdFx0XHRcdG5hbWU6IFwiR1BULTRvXCIsXG5cdFx0XHRcdHRva2VuTGltaXQ6IDEyODAwMCxcblx0XHRcdFx0c3VwcG9ydHNTdHJlYW1pbmc6IHRydWUsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogXCJncHQtNG8tbWluaVwiLFxuXHRcdFx0XHRuYW1lOiBcIkdQVC00byBNaW5pXCIsXG5cdFx0XHRcdHRva2VuTGltaXQ6IDEyODAwMCxcblx0XHRcdFx0c3VwcG9ydHNTdHJlYW1pbmc6IHRydWUsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogXCJncHQtNC0xMTA2LXByZXZpZXdcIixcblx0XHRcdFx0bmFtZTogXCJHUFQtNCBUdXJibyBQcmV2aWV3XCIsXG5cdFx0XHRcdHRva2VuTGltaXQ6IDEyODAwMCxcblx0XHRcdFx0c3VwcG9ydHNTdHJlYW1pbmc6IHRydWUsXG5cdFx0XHR9LFxuXHRcdF07XG5cdH1cblxuXHRhc3luYyBnZW5lcmF0ZVJlc3BvbnNlKG1lc3NhZ2VzOiBBSU1lc3NhZ2VbXSwgb3B0aW9uczogR2VuZXJhdGVPcHRpb25zID0ge30pOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IG9wZW5haU1lc3NhZ2VzOiBDaGF0Q29tcGxldGlvbk1lc3NhZ2VQYXJhbVtdID0gbWVzc2FnZXMubWFwKG1zZyA9PiAoe1xuXHRcdFx0cm9sZTogbXNnLnJvbGUsXG5cdFx0XHRjb250ZW50OiBtc2cuY29udGVudCxcblx0XHR9KSk7XG5cblx0XHRsb2dEZWJ1ZyhcIkNhbGxpbmcgT3BlbkFJOlwiLCB7XG5cdFx0XHRtZXNzYWdlczogb3BlbmFpTWVzc2FnZXMsXG5cdFx0XHRtb2RlbDogb3B0aW9ucy5tb2RlbCxcblx0XHRcdG1heF90b2tlbnM6IG9wdGlvbnMubWF4VG9rZW5zLFxuXHRcdFx0dGVtcGVyYXR1cmU6IG9wdGlvbnMudGVtcGVyYXR1cmUsXG5cdFx0XHRpc0pTT046IG9wdGlvbnMuaXNKU09OLFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY29tcGxldGlvbiA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYXQuY29tcGxldGlvbnMuY3JlYXRlKHtcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsIHx8IFwiZ3B0LTQtMTEwNi1wcmV2aWV3XCIsXG5cdFx0XHRtZXNzYWdlczogb3BlbmFpTWVzc2FnZXMsXG5cdFx0XHRtYXhfdG9rZW5zOiBvcHRpb25zLm1heFRva2Vucyxcblx0XHRcdHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXBlcmF0dXJlLFxuXHRcdFx0cmVzcG9uc2VfZm9ybWF0OiB7IHR5cGU6IG9wdGlvbnMuaXNKU09OID8gXCJqc29uX29iamVjdFwiIDogXCJ0ZXh0XCIgfSxcblx0XHR9KTtcblxuXHRcdGxvZ0RlYnVnKFwiT3BlbkFJIHJlc3BvbnNlXCIsIHsgY29tcGxldGlvbiB9KTtcblx0XHRcblx0XHRjb25zdCBjb250ZW50ID0gY29tcGxldGlvbi5jaG9pY2VzWzBdLm1lc3NhZ2UhLmNvbnRlbnQhO1xuXHRcdHJldHVybiBvcHRpb25zLmlzSlNPTiA/IEpTT04ucGFyc2UoY29udGVudCkgOiBjb250ZW50O1xuXHR9XG5cblx0YXN5bmMgc3RyZWFtUmVzcG9uc2UoXG5cdFx0bWVzc2FnZXM6IEFJTWVzc2FnZVtdLCBcblx0XHRvcHRpb25zOiBHZW5lcmF0ZU9wdGlvbnMsIFxuXHRcdG9uQ2h1bms6IChjaHVuazogU3RyZWFtQ2h1bmspID0+IHZvaWRcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb3BlbmFpTWVzc2FnZXM6IENoYXRDb21wbGV0aW9uTWVzc2FnZVBhcmFtW10gPSBtZXNzYWdlcy5tYXAobXNnID0+ICh7XG5cdFx0XHRyb2xlOiBtc2cucm9sZSxcblx0XHRcdGNvbnRlbnQ6IG1zZy5jb250ZW50LFxuXHRcdH0pKTtcblxuXHRcdGxvZ0RlYnVnKFwiQ2FsbGluZyBPcGVuQUkgc3RyZWFtOlwiLCB7XG5cdFx0XHRtZXNzYWdlczogb3BlbmFpTWVzc2FnZXMsXG5cdFx0XHRtb2RlbDogb3B0aW9ucy5tb2RlbCxcblx0XHRcdG1heF90b2tlbnM6IG9wdGlvbnMubWF4VG9rZW5zLFxuXHRcdFx0dGVtcGVyYXR1cmU6IG9wdGlvbnMudGVtcGVyYXR1cmUsXG5cdFx0fSk7XG5cblx0XHRjb25zdCBzdHJlYW0gPSBhd2FpdCB0aGlzLmNsaWVudC5jaGF0LmNvbXBsZXRpb25zLmNyZWF0ZSh7XG5cdFx0XHRtb2RlbDogb3B0aW9ucy5tb2RlbCB8fCBcImdwdC00XCIsXG5cdFx0XHRtZXNzYWdlczogb3BlbmFpTWVzc2FnZXMsXG5cdFx0XHRzdHJlYW06IHRydWUsXG5cdFx0XHRtYXhfdG9rZW5zOiBvcHRpb25zLm1heFRva2Vucyxcblx0XHRcdHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXBlcmF0dXJlLFxuXHRcdH0pO1xuXG5cdFx0Zm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlYW0pIHtcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBjaHVuay5jaG9pY2VzWzBdPy5kZWx0YT8uY29udGVudCB8fCBcIlwiO1xuXHRcdFx0bG9nRGVidWcoXCJPcGVuQUkgY2h1bmtcIiwgeyBjaHVuayB9KTtcblx0XHRcdG9uQ2h1bmsoeyBjb250ZW50LCBkb25lOiBmYWxzZSB9KTtcblx0XHR9XG5cdFx0XG5cdFx0b25DaHVuayh7IGNvbnRlbnQ6IFwiXCIsIGRvbmU6IHRydWUgfSk7XG5cdH1cblxuXHRhc3luYyBnZW5lcmF0ZUltYWdlKHByb21wdDogc3RyaW5nLCBvcHRpb25zOiBJbWFnZUdlbmVyYXRlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRsb2dEZWJ1ZyhcIkNhbGxpbmcgT3BlbkFJIGltYWdlIGdlbmVyYXRpb246XCIsIHtcblx0XHRcdHByb21wdCxcblx0XHRcdG1vZGVsOiBvcHRpb25zLm1vZGVsLFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNsaWVudC5pbWFnZXMuZ2VuZXJhdGUoe1xuXHRcdFx0bW9kZWw6IG9wdGlvbnMubW9kZWwgfHwgXCJkYWxsLWUtM1wiLFxuXHRcdFx0cHJvbXB0LFxuXHRcdFx0bjogMSxcblx0XHRcdHNpemU6IG9wdGlvbnMuc2l6ZSB8fCAob3B0aW9ucy5pc1ZlcnRpY2FsID8gXCIxMDI0eDE3OTJcIiA6IFwiMTc5MngxMDI0XCIpLFxuXHRcdFx0cmVzcG9uc2VfZm9ybWF0OiBcImI2NF9qc29uXCIsXG5cdFx0fSk7XG5cblx0XHRsb2dEZWJ1ZyhcIk9wZW5BSSBpbWFnZSByZXNwb25zZVwiLCB7IHJlc3BvbnNlIH0pO1xuXHRcdHJldHVybiByZXNwb25zZS5kYXRhWzBdLmI2NF9qc29uITtcblx0fVxufSJdfQ==