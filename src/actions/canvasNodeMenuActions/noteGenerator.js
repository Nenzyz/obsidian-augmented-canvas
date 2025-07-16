import { __awaiter } from "tslib";
import { encodingForModel } from "js-tiktoken";
import { ItemView, Notice } from "obsidian";
import { calcHeight, createNode, } from "../../obsidian/canvas-patches";
// import { Logger } from "./util/logging";
import { visitNodeAndAncestors } from "../../obsidian/canvasUtil";
import { readNodeContent } from "../../obsidian/fileUtil";
import { streamResponse } from "../../utils/chatgpt";
import { CHAT_MODELS, chatModelByName } from "../../openai/models";
/**
 * Color for assistant notes: 6 == purple
 */
const assistantColor = "6";
/**
 * Height to use for placeholder note
 */
const placeholderNoteHeight = 60;
/**
 * Height to use for new empty note
 */
const emptyNoteHeight = 100;
const NOTE_MAX_WIDTH = 400;
export const NOTE_MIN_HEIGHT = 400;
export const NOTE_INCR_HEIGHT_STEP = 150;
// TODO : remove
const logDebug = (text) => null;
// const SYSTEM_PROMPT2 = `
// You must respond in this JSON format: {
// 	"response": Your response, must be in markdown,
// 	"questions": Follow up questions the user could ask based on your response, must be an array
// }
// The response must be in the same language the user used.
// `.trim();
const SYSTEM_PROMPT = `
You must respond in markdown.
The response must be in the same language the user used.
`.trim();
export function noteGenerator(app, settings, fromNode, toNode
// logDebug: Logger
) {
    const canCallAI = () => {
        // return true;
        if (!settings.apiKey) {
            new Notice("Please set your OpenAI API key in the plugin settings");
            return false;
        }
        return true;
    };
    const getActiveCanvas = () => {
        const maybeCanvasView = app.workspace.getActiveViewOfType(ItemView);
        return maybeCanvasView ? maybeCanvasView["canvas"] : null;
    };
    const isSystemPromptNode = (text) => text.trim().startsWith("SYSTEM PROMPT");
    const getSystemPrompt = (node) => __awaiter(this, void 0, void 0, function* () {
        // TODO
        let foundPrompt = null;
        yield visitNodeAndAncestors(node, (n) => __awaiter(this, void 0, void 0, function* () {
            const text = yield readNodeContent(n);
            if (text && isSystemPromptNode(text)) {
                foundPrompt = text.replace("SYSTEM PROMPT", "").trim();
                return false;
            }
            else {
                return true;
            }
        }));
        return foundPrompt || settings.systemPrompt;
    });
    const buildMessages = (node, { systemPrompt, prompt, } = {}) => __awaiter(this, void 0, void 0, function* () {
        // return { messages: [], tokenCount: 0 };
        const encoding = encodingForModel(
        // (settings.apiModel || DEFAULT_SETTINGS.apiModel) as TiktokenModel
        "gpt-4");
        const messages = [];
        let tokenCount = 0;
        // Note: We are not checking for system prompt longer than context window.
        // That scenario makes no sense, though.
        const systemPrompt2 = systemPrompt || (yield getSystemPrompt(node));
        if (systemPrompt2) {
            tokenCount += encoding.encode(systemPrompt2).length;
        }
        const visit = (node, depth, edgeLabel) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (settings.maxDepth && depth > settings.maxDepth)
                return false;
            const nodeData = node.getData();
            let nodeText = ((_a = (yield readNodeContent(node))) === null || _a === void 0 ? void 0 : _a.trim()) || "";
            const inputLimit = getTokenLimit(settings);
            let shouldContinue = true;
            if (nodeText) {
                if (isSystemPromptNode(nodeText))
                    return true;
                let nodeTokens = encoding.encode(nodeText);
                let keptNodeTokens;
                if (tokenCount + nodeTokens.length > inputLimit) {
                    // will exceed input limit
                    shouldContinue = false;
                    // Leaving one token margin, just in case
                    const keepTokens = nodeTokens.slice(0, inputLimit - tokenCount - 1
                    // * needed because very large context is a little above
                    // * should this be a number from settings.maxInput ?
                    // TODO
                    // (nodeTokens.length > 100000 ? 20 : 1)
                    );
                    const truncateTextTo = encoding.decode(keepTokens).length;
                    logDebug(`Truncating node text from ${nodeText.length} to ${truncateTextTo} characters`);
                    new Notice(`Truncating node text from ${nodeText.length} to ${truncateTextTo} characters`);
                    nodeText = nodeText.slice(0, truncateTextTo);
                    keptNodeTokens = keepTokens.length;
                }
                else {
                    keptNodeTokens = nodeTokens.length;
                }
                tokenCount += keptNodeTokens;
                const role = nodeData.chat_role === "assistant" ? "assistant" : "user";
                if (edgeLabel) {
                    messages.unshift({
                        content: edgeLabel,
                        role: "user",
                    });
                }
                messages.unshift({
                    content: nodeText,
                    role,
                });
            }
            return shouldContinue;
        });
        yield visitNodeAndAncestors(node, visit);
        // if (messages.length) {
        if (systemPrompt2)
            messages.unshift({
                role: "system",
                content: systemPrompt2,
            });
        // }
        if (prompt)
            messages.push({
                role: "user",
                content: prompt,
            });
        return { messages, tokenCount };
        // } else {
        // 	return { messages: [], tokenCount: 0 };
        // }
    });
    const generateNote = (question) => __awaiter(this, void 0, void 0, function* () {
        if (!canCallAI())
            return;
        logDebug("Creating AI note");
        const canvas = getActiveCanvas();
        if (!canvas) {
            logDebug("No active canvas");
            return;
        }
        // console.log({ canvas });
        yield canvas.requestFrame();
        let node;
        if (!fromNode) {
            const selection = canvas.selection;
            if ((selection === null || selection === void 0 ? void 0 : selection.size) !== 1)
                return;
            const values = Array.from(selection.values());
            node = values[0];
        }
        else {
            node = fromNode;
        }
        if (node) {
            // Last typed characters might not be applied to note yet
            yield canvas.requestSave();
            yield sleep(200);
            const { messages, tokenCount } = yield buildMessages(node, {
                prompt: question,
            });
            // console.log({ messages });
            if (!messages.length)
                return;
            let created;
            if (!toNode) {
                created = createNode(canvas, {
                    // text: "```loading...```",
                    text: `\`\`\`Calling AI (${settings.apiModel})...\`\`\``,
                    size: { height: placeholderNoteHeight },
                }, node, {
                    color: assistantColor,
                    chat_role: "assistant",
                }, question);
            }
            else {
                created = toNode;
                created.setText(`\`\`\`Calling AI (${settings.apiModel})...\`\`\``);
            }
            new Notice(`Sending ${messages.length} notes with ${tokenCount} tokens to GPT`);
            try {
                // logDebug("messages", messages);
                let firstDelta = true;
                yield streamResponse(settings.apiKey, 
                // settings.apiModel,
                messages, {
                    model: settings.apiModel,
                    max_tokens: settings.maxResponseTokens || undefined,
                    // max_tokens: getTokenLimit(settings) - tokenCount - 1,
                }, 
                // {
                // 	max_tokens: settings.maxResponseTokens || undefined,
                // 	temperature: settings.temperature,
                // }
                (delta) => {
                    // * Last call
                    if (!delta) {
                        // const height = calcHeight({
                        // 	text: created.text,
                        // 	parentHeight: node.height,
                        // });
                        // created.moveAndResize({
                        // 	height,
                        // 	width: created.width,
                        // 	x: created.x,
                        // 	y: created.y,
                        // });
                        return;
                    }
                    let newText;
                    if (firstDelta) {
                        newText = delta;
                        firstDelta = false;
                        created.moveAndResize({
                            height: NOTE_MIN_HEIGHT,
                            width: created.width,
                            x: created.x,
                            y: created.y,
                        });
                    }
                    else {
                        const height = calcHeight({
                            text: created.text,
                            // parentHeight: node.height,
                        });
                        if (height > created.height) {
                            created.moveAndResize({
                                height: created.height + NOTE_INCR_HEIGHT_STEP,
                                width: created.width,
                                x: created.x,
                                y: created.y,
                            });
                        }
                        newText = created.text + delta;
                    }
                    created.setText(newText);
                });
                // if (generated == null) {
                // 	new Notice(`Empty or unreadable response from GPT`);
                // 	canvas.removeNode(created);
                // 	return;
                // }
                // * Update Node
                // created.setText(generated.response);
                // const nodeData = created.getData();
                // created.setData({
                // 	...nodeData,
                // 	questions: generated.questions,
                // });
                // const height = calcHeight({
                // 	text: generated.response,
                // 	parentHeight: node.height,
                // });
                // created.moveAndResize({
                // 	height,
                // 	width: created.width,
                // 	x: created.x,
                // 	y: created.y,
                // });
                // const selectedNoteId =
                // 	canvas.selection?.size === 1
                // 		? Array.from(canvas.selection.values())?.[0]?.id
                // 		: undefined;
                // if (selectedNoteId === node?.id || selectedNoteId == null) {
                // 	// If the user has not changed selection, select the created node
                // 	canvas.selectOnly(created, false /* startEditing */);
                // }
            }
            catch (error) {
                new Notice(`Error calling GPT: ${error.message || error}`);
                if (!toNode) {
                    canvas.removeNode(created);
                }
            }
            yield canvas.requestSave();
        }
    });
    // return { nextNote, generateNote };
    return { generateNote, buildMessages };
}
export function getTokenLimit(settings) {
    const model = chatModelByName(settings.apiModel) || CHAT_MODELS.GPT_4_1106_PREVIEW;
    const tokenLimit = settings.maxInputTokens
        ? Math.min(settings.maxInputTokens, model.tokenLimit)
        : model.tokenLimit;
    // console.log({ settings, tokenLimit });
    return tokenLimit;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZUdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vdGVHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsZ0JBQWdCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDOUQsT0FBTyxFQUFPLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFakQsT0FBTyxFQUVOLFVBQVUsRUFDVixVQUFVLEdBQ1YsTUFBTSwrQkFBK0IsQ0FBQztBQUt2QywyQ0FBMkM7QUFDM0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBZSxjQUFjLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRW5FOztHQUVHO0FBQ0gsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBRTNCOztHQUVHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxFQUFFLENBQUM7QUFFakM7O0dBRUc7QUFDSCxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUM7QUFFNUIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBQzNCLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUM7QUFDbkMsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxDQUFDO0FBRXpDLGdCQUFnQjtBQUNoQixNQUFNLFFBQVEsR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBRXJDLDJCQUEyQjtBQUMzQiwwQ0FBMEM7QUFDMUMsbURBQW1EO0FBQ25ELGdHQUFnRztBQUNoRyxJQUFJO0FBQ0osMkRBQTJEO0FBQzNELFlBQVk7QUFFWixNQUFNLGFBQWEsR0FBRzs7O0NBR3JCLENBQUMsSUFBSSxFQUFFLENBQUM7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QUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUMzQjtJQUNGLENBQUMsQ0FBQSxDQUFDO0lBRUYscUNBQXFDO0lBQ3JDLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUM7QUFDeEMsQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsUUFBaUM7SUFDOUQsTUFBTSxLQUFLLEdBQ1YsZUFBZSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxXQUFXLENBQUMsa0JBQWtCLENBQUM7SUFDdEUsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWM7UUFDekMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDO1FBQ3JELENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0lBRXBCLHlDQUF5QztJQUN6QyxPQUFPLFVBQVUsQ0FBQztBQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGlrdG9rZW5Nb2RlbCwgZW5jb2RpbmdGb3JNb2RlbCB9IGZyb20gXCJqcy10aWt0b2tlblwiO1xuaW1wb3J0IHsgQXBwLCBJdGVtVmlldywgTm90aWNlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBDYW52YXNOb2RlIH0gZnJvbSBcIi4uLy4uL29ic2lkaWFuL2NhbnZhcy1pbnRlcm5hbFwiO1xuaW1wb3J0IHtcblx0Q2FudmFzVmlldyxcblx0Y2FsY0hlaWdodCxcblx0Y3JlYXRlTm9kZSxcbn0gZnJvbSBcIi4uLy4uL29ic2lkaWFuL2NhbnZhcy1wYXRjaGVzXCI7XG5pbXBvcnQge1xuXHRBdWdtZW50ZWRDYW52YXNTZXR0aW5ncyxcblx0REVGQVVMVF9TRVRUSU5HUyxcbn0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL0F1Z21lbnRlZENhbnZhc1NldHRpbmdzXCI7XG4vLyBpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi91dGlsL2xvZ2dpbmdcIjtcbmltcG9ydCB7IHZpc2l0Tm9kZUFuZEFuY2VzdG9ycyB9IGZyb20gXCIuLi8uLi9vYnNpZGlhbi9jYW52YXNVdGlsXCI7XG5pbXBvcnQgeyByZWFkTm9kZUNvbnRlbnQgfSBmcm9tIFwiLi4vLi4vb2JzaWRpYW4vZmlsZVV0aWxcIjtcbmltcG9ydCB7IGdldFJlc3BvbnNlLCBzdHJlYW1SZXNwb25zZSB9IGZyb20gXCIuLi8uLi91dGlscy9jaGF0Z3B0XCI7XG5pbXBvcnQgeyBDSEFUX01PREVMUywgY2hhdE1vZGVsQnlOYW1lIH0gZnJvbSBcIi4uLy4uL29wZW5haS9tb2RlbHNcIjtcblxuLyoqXG4gKiBDb2xvciBmb3IgYXNzaXN0YW50IG5vdGVzOiA2ID09IHB1cnBsZVxuICovXG5jb25zdCBhc3Npc3RhbnRDb2xvciA9IFwiNlwiO1xuXG4vKipcbiAqIEhlaWdodCB0byB1c2UgZm9yIHBsYWNlaG9sZGVyIG5vdGVcbiAqL1xuY29uc3QgcGxhY2Vob2xkZXJOb3RlSGVpZ2h0ID0gNjA7XG5cbi8qKlxuICogSGVpZ2h0IHRvIHVzZSBmb3IgbmV3IGVtcHR5IG5vdGVcbiAqL1xuY29uc3QgZW1wdHlOb3RlSGVpZ2h0ID0gMTAwO1xuXG5jb25zdCBOT1RFX01BWF9XSURUSCA9IDQwMDtcbmV4cG9ydCBjb25zdCBOT1RFX01JTl9IRUlHSFQgPSA0MDA7XG5leHBvcnQgY29uc3QgTk9URV9JTkNSX0hFSUdIVF9TVEVQID0gMTUwO1xuXG4vLyBUT0RPIDogcmVtb3ZlXG5jb25zdCBsb2dEZWJ1ZyA9ICh0ZXh0OiBhbnkpID0+IG51bGw7XG5cbi8vIGNvbnN0IFNZU1RFTV9QUk9NUFQyID0gYFxuLy8gWW91IG11c3QgcmVzcG9uZCBpbiB0aGlzIEpTT04gZm9ybWF0OiB7XG4vLyBcdFwicmVzcG9uc2VcIjogWW91ciByZXNwb25zZSwgbXVzdCBiZSBpbiBtYXJrZG93bixcbi8vIFx0XCJxdWVzdGlvbnNcIjogRm9sbG93IHVwIHF1ZXN0aW9ucyB0aGUgdXNlciBjb3VsZCBhc2sgYmFzZWQgb24geW91ciByZXNwb25zZSwgbXVzdCBiZSBhbiBhcnJheVxuLy8gfVxuLy8gVGhlIHJlc3BvbnNlIG11c3QgYmUgaW4gdGhlIHNhbWUgbGFuZ3VhZ2UgdGhlIHVzZXIgdXNlZC5cbi8vIGAudHJpbSgpO1xuXG5jb25zdCBTWVNURU1fUFJPTVBUID0gYFxuWW91IG11c3QgcmVzcG9uZCBpbiBtYXJrZG93bi5cblRoZSByZXNwb25zZSBtdXN0IGJlIGluIHRoZSBzYW1lIGxhbmd1YWdlIHRoZSB1c2VyIHVzZWQuXG5gLnRyaW0oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdGVHZW5lcmF0b3IoXG5cdGFwcDogQXBwLFxuXHRzZXR0aW5nczogQXVnbWVudGVkQ2FudmFzU2V0dGluZ3MsXG5cdGZyb21Ob2RlPzogQ2FudmFzTm9kZSxcblx0dG9Ob2RlPzogQ2FudmFzTm9kZVxuXHQvLyBsb2dEZWJ1ZzogTG9nZ2VyXG4pIHtcblx0Y29uc3QgY2FuQ2FsbEFJID0gKCkgPT4ge1xuXHRcdC8vIHJldHVybiB0cnVlO1xuXHRcdGlmICghc2V0dGluZ3MuYXBpS2V5KSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiUGxlYXNlIHNldCB5b3VyIE9wZW5BSSBBUEkga2V5IGluIHRoZSBwbHVnaW4gc2V0dGluZ3NcIik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblx0Y29uc3QgZ2V0QWN0aXZlQ2FudmFzID0gKCkgPT4ge1xuXHRcdGNvbnN0IG1heWJlQ2FudmFzVmlldyA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShcblx0XHRcdEl0ZW1WaWV3XG5cdFx0KSBhcyBDYW52YXNWaWV3IHwgbnVsbDtcblx0XHRyZXR1cm4gbWF5YmVDYW52YXNWaWV3ID8gbWF5YmVDYW52YXNWaWV3W1wiY2FudmFzXCJdIDogbnVsbDtcblx0fTtcblxuXHRjb25zdCBpc1N5c3RlbVByb21wdE5vZGUgPSAodGV4dDogc3RyaW5nKSA9PlxuXHRcdHRleHQudHJpbSgpLnN0YXJ0c1dpdGgoXCJTWVNURU0gUFJPTVBUXCIpO1xuXG5cdGNvbnN0IGdldFN5c3RlbVByb21wdCA9IGFzeW5jIChub2RlOiBDYW52YXNOb2RlKSA9PiB7XG5cdFx0Ly8gVE9ET1xuXHRcdGxldCBmb3VuZFByb21wdDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cblx0XHRhd2FpdCB2aXNpdE5vZGVBbmRBbmNlc3RvcnMobm9kZSwgYXN5bmMgKG46IENhbnZhc05vZGUpID0+IHtcblx0XHRcdGNvbnN0IHRleHQgPSBhd2FpdCByZWFkTm9kZUNvbnRlbnQobik7XG5cdFx0XHRpZiAodGV4dCAmJiBpc1N5c3RlbVByb21wdE5vZGUodGV4dCkpIHtcblx0XHRcdFx0Zm91bmRQcm9tcHQgPSB0ZXh0LnJlcGxhY2UoXCJTWVNURU0gUFJPTVBUXCIsIFwiXCIpLnRyaW0oKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZm91bmRQcm9tcHQgfHwgc2V0dGluZ3Muc3lzdGVtUHJvbXB0O1xuXHR9O1xuXG5cdGNvbnN0IGJ1aWxkTWVzc2FnZXMgPSBhc3luYyAoXG5cdFx0bm9kZTogQ2FudmFzTm9kZSxcblx0XHR7XG5cdFx0XHRzeXN0ZW1Qcm9tcHQsXG5cdFx0XHRwcm9tcHQsXG5cdFx0fToge1xuXHRcdFx0c3lzdGVtUHJvbXB0Pzogc3RyaW5nO1xuXHRcdFx0cHJvbXB0Pzogc3RyaW5nO1xuXHRcdH0gPSB7fVxuXHQpID0+IHtcblx0XHQvLyByZXR1cm4geyBtZXNzYWdlczogW10sIHRva2VuQ291bnQ6IDAgfTtcblxuXHRcdGNvbnN0IGVuY29kaW5nID0gZW5jb2RpbmdGb3JNb2RlbChcblx0XHRcdC8vIChzZXR0aW5ncy5hcGlNb2RlbCB8fCBERUZBVUxUX1NFVFRJTkdTLmFwaU1vZGVsKSBhcyBUaWt0b2tlbk1vZGVsXG5cdFx0XHRcImdwdC00XCJcblx0XHQpO1xuXG5cdFx0Y29uc3QgbWVzc2FnZXM6IGFueVtdID0gW107XG5cdFx0bGV0IHRva2VuQ291bnQgPSAwO1xuXG5cdFx0Ly8gTm90ZTogV2UgYXJlIG5vdCBjaGVja2luZyBmb3Igc3lzdGVtIHByb21wdCBsb25nZXIgdGhhbiBjb250ZXh0IHdpbmRvdy5cblx0XHQvLyBUaGF0IHNjZW5hcmlvIG1ha2VzIG5vIHNlbnNlLCB0aG91Z2guXG5cdFx0Y29uc3Qgc3lzdGVtUHJvbXB0MiA9IHN5c3RlbVByb21wdCB8fCAoYXdhaXQgZ2V0U3lzdGVtUHJvbXB0KG5vZGUpKTtcblx0XHRpZiAoc3lzdGVtUHJvbXB0Mikge1xuXHRcdFx0dG9rZW5Db3VudCArPSBlbmNvZGluZy5lbmNvZGUoc3lzdGVtUHJvbXB0MikubGVuZ3RoO1xuXHRcdH1cblxuXHRcdGNvbnN0IHZpc2l0ID0gYXN5bmMgKFxuXHRcdFx0bm9kZTogQ2FudmFzTm9kZSxcblx0XHRcdGRlcHRoOiBudW1iZXIsXG5cdFx0XHRlZGdlTGFiZWw/OiBzdHJpbmdcblx0XHQpID0+IHtcblx0XHRcdGlmIChzZXR0aW5ncy5tYXhEZXB0aCAmJiBkZXB0aCA+IHNldHRpbmdzLm1heERlcHRoKSByZXR1cm4gZmFsc2U7XG5cblx0XHRcdGNvbnN0IG5vZGVEYXRhID0gbm9kZS5nZXREYXRhKCk7XG5cdFx0XHRsZXQgbm9kZVRleHQgPSAoYXdhaXQgcmVhZE5vZGVDb250ZW50KG5vZGUpKT8udHJpbSgpIHx8IFwiXCI7XG5cdFx0XHRjb25zdCBpbnB1dExpbWl0ID0gZ2V0VG9rZW5MaW1pdChzZXR0aW5ncyk7XG5cblx0XHRcdGxldCBzaG91bGRDb250aW51ZSA9IHRydWU7XG5cblx0XHRcdGlmIChub2RlVGV4dCkge1xuXHRcdFx0XHRpZiAoaXNTeXN0ZW1Qcm9tcHROb2RlKG5vZGVUZXh0KSkgcmV0dXJuIHRydWU7XG5cblx0XHRcdFx0bGV0IG5vZGVUb2tlbnMgPSBlbmNvZGluZy5lbmNvZGUobm9kZVRleHQpO1xuXHRcdFx0XHRsZXQga2VwdE5vZGVUb2tlbnM6IG51bWJlcjtcblxuXHRcdFx0XHRpZiAodG9rZW5Db3VudCArIG5vZGVUb2tlbnMubGVuZ3RoID4gaW5wdXRMaW1pdCkge1xuXHRcdFx0XHRcdC8vIHdpbGwgZXhjZWVkIGlucHV0IGxpbWl0XG5cblx0XHRcdFx0XHRzaG91bGRDb250aW51ZSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0Ly8gTGVhdmluZyBvbmUgdG9rZW4gbWFyZ2luLCBqdXN0IGluIGNhc2Vcblx0XHRcdFx0XHRjb25zdCBrZWVwVG9rZW5zID0gbm9kZVRva2Vucy5zbGljZShcblx0XHRcdFx0XHRcdDAsXG5cdFx0XHRcdFx0XHRpbnB1dExpbWl0IC0gdG9rZW5Db3VudCAtIDFcblx0XHRcdFx0XHRcdC8vICogbmVlZGVkIGJlY2F1c2UgdmVyeSBsYXJnZSBjb250ZXh0IGlzIGEgbGl0dGxlIGFib3ZlXG5cdFx0XHRcdFx0XHQvLyAqIHNob3VsZCB0aGlzIGJlIGEgbnVtYmVyIGZyb20gc2V0dGluZ3MubWF4SW5wdXQgP1xuXHRcdFx0XHRcdFx0Ly8gVE9ET1xuXHRcdFx0XHRcdFx0Ly8gKG5vZGVUb2tlbnMubGVuZ3RoID4gMTAwMDAwID8gMjAgOiAxKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Y29uc3QgdHJ1bmNhdGVUZXh0VG8gPSBlbmNvZGluZy5kZWNvZGUoa2VlcFRva2VucykubGVuZ3RoO1xuXHRcdFx0XHRcdGxvZ0RlYnVnKFxuXHRcdFx0XHRcdFx0YFRydW5jYXRpbmcgbm9kZSB0ZXh0IGZyb20gJHtub2RlVGV4dC5sZW5ndGh9IHRvICR7dHJ1bmNhdGVUZXh0VG99IGNoYXJhY3RlcnNgXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRuZXcgTm90aWNlKFxuXHRcdFx0XHRcdFx0YFRydW5jYXRpbmcgbm9kZSB0ZXh0IGZyb20gJHtub2RlVGV4dC5sZW5ndGh9IHRvICR7dHJ1bmNhdGVUZXh0VG99IGNoYXJhY3RlcnNgXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRub2RlVGV4dCA9IG5vZGVUZXh0LnNsaWNlKDAsIHRydW5jYXRlVGV4dFRvKTtcblx0XHRcdFx0XHRrZXB0Tm9kZVRva2VucyA9IGtlZXBUb2tlbnMubGVuZ3RoO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGtlcHROb2RlVG9rZW5zID0gbm9kZVRva2Vucy5sZW5ndGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0b2tlbkNvdW50ICs9IGtlcHROb2RlVG9rZW5zO1xuXG5cdFx0XHRcdGNvbnN0IHJvbGU6IGFueSA9XG5cdFx0XHRcdFx0bm9kZURhdGEuY2hhdF9yb2xlID09PSBcImFzc2lzdGFudFwiID8gXCJhc3Npc3RhbnRcIiA6IFwidXNlclwiO1xuXG5cdFx0XHRcdGlmIChlZGdlTGFiZWwpIHtcblx0XHRcdFx0XHRtZXNzYWdlcy51bnNoaWZ0KHtcblx0XHRcdFx0XHRcdGNvbnRlbnQ6IGVkZ2VMYWJlbCxcblx0XHRcdFx0XHRcdHJvbGU6IFwidXNlclwiLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG1lc3NhZ2VzLnVuc2hpZnQoe1xuXHRcdFx0XHRcdGNvbnRlbnQ6IG5vZGVUZXh0LFxuXHRcdFx0XHRcdHJvbGUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gc2hvdWxkQ29udGludWU7XG5cdFx0fTtcblxuXHRcdGF3YWl0IHZpc2l0Tm9kZUFuZEFuY2VzdG9ycyhub2RlLCB2aXNpdCk7XG5cblx0XHQvLyBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0aWYgKHN5c3RlbVByb21wdDIpXG5cdFx0XHRtZXNzYWdlcy51bnNoaWZ0KHtcblx0XHRcdFx0cm9sZTogXCJzeXN0ZW1cIixcblx0XHRcdFx0Y29udGVudDogc3lzdGVtUHJvbXB0Mixcblx0XHRcdH0pO1xuXHRcdC8vIH1cblxuXHRcdGlmIChwcm9tcHQpXG5cdFx0XHRtZXNzYWdlcy5wdXNoKHtcblx0XHRcdFx0cm9sZTogXCJ1c2VyXCIsXG5cdFx0XHRcdGNvbnRlbnQ6IHByb21wdCxcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHsgbWVzc2FnZXMsIHRva2VuQ291bnQgfTtcblx0XHQvLyB9IGVsc2Uge1xuXHRcdC8vIFx0cmV0dXJuIHsgbWVzc2FnZXM6IFtdLCB0b2tlbkNvdW50OiAwIH07XG5cdFx0Ly8gfVxuXHR9O1xuXG5cdGNvbnN0IGdlbmVyYXRlTm90ZSA9IGFzeW5jIChxdWVzdGlvbj86IHN0cmluZykgPT4ge1xuXHRcdGlmICghY2FuQ2FsbEFJKCkpIHJldHVybjtcblxuXHRcdGxvZ0RlYnVnKFwiQ3JlYXRpbmcgQUkgbm90ZVwiKTtcblxuXHRcdGNvbnN0IGNhbnZhcyA9IGdldEFjdGl2ZUNhbnZhcygpO1xuXHRcdGlmICghY2FudmFzKSB7XG5cdFx0XHRsb2dEZWJ1ZyhcIk5vIGFjdGl2ZSBjYW52YXNcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIGNvbnNvbGUubG9nKHsgY2FudmFzIH0pO1xuXG5cdFx0YXdhaXQgY2FudmFzLnJlcXVlc3RGcmFtZSgpO1xuXG5cdFx0bGV0IG5vZGU6IENhbnZhc05vZGU7XG5cdFx0aWYgKCFmcm9tTm9kZSkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0aW9uID0gY2FudmFzLnNlbGVjdGlvbjtcblx0XHRcdGlmIChzZWxlY3Rpb24/LnNpemUgIT09IDEpIHJldHVybjtcblx0XHRcdGNvbnN0IHZhbHVlcyA9IEFycmF5LmZyb20oc2VsZWN0aW9uLnZhbHVlcygpKTtcblx0XHRcdG5vZGUgPSB2YWx1ZXNbMF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUgPSBmcm9tTm9kZTtcblx0XHR9XG5cblx0XHRpZiAobm9kZSkge1xuXHRcdFx0Ly8gTGFzdCB0eXBlZCBjaGFyYWN0ZXJzIG1pZ2h0IG5vdCBiZSBhcHBsaWVkIHRvIG5vdGUgeWV0XG5cdFx0XHRhd2FpdCBjYW52YXMucmVxdWVzdFNhdmUoKTtcblx0XHRcdGF3YWl0IHNsZWVwKDIwMCk7XG5cblx0XHRcdGNvbnN0IHsgbWVzc2FnZXMsIHRva2VuQ291bnQgfSA9IGF3YWl0IGJ1aWxkTWVzc2FnZXMobm9kZSwge1xuXHRcdFx0XHRwcm9tcHQ6IHF1ZXN0aW9uLFxuXHRcdFx0fSk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyh7IG1lc3NhZ2VzIH0pO1xuXHRcdFx0aWYgKCFtZXNzYWdlcy5sZW5ndGgpIHJldHVybjtcblxuXHRcdFx0bGV0IGNyZWF0ZWQ6IENhbnZhc05vZGU7XG5cdFx0XHRpZiAoIXRvTm9kZSkge1xuXHRcdFx0XHRjcmVhdGVkID0gY3JlYXRlTm9kZShcblx0XHRcdFx0XHRjYW52YXMsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gdGV4dDogXCJgYGBsb2FkaW5nLi4uYGBgXCIsXG5cdFx0XHRcdFx0XHR0ZXh0OiBgXFxgXFxgXFxgQ2FsbGluZyBBSSAoJHtzZXR0aW5ncy5hcGlNb2RlbH0pLi4uXFxgXFxgXFxgYCxcblx0XHRcdFx0XHRcdHNpemU6IHsgaGVpZ2h0OiBwbGFjZWhvbGRlck5vdGVIZWlnaHQgfSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG5vZGUsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29sb3I6IGFzc2lzdGFudENvbG9yLFxuXHRcdFx0XHRcdFx0Y2hhdF9yb2xlOiBcImFzc2lzdGFudFwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cXVlc3Rpb25cblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNyZWF0ZWQgPSB0b05vZGU7XG5cdFx0XHRcdGNyZWF0ZWQuc2V0VGV4dChcblx0XHRcdFx0XHRgXFxgXFxgXFxgQ2FsbGluZyBBSSAoJHtzZXR0aW5ncy5hcGlNb2RlbH0pLi4uXFxgXFxgXFxgYFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRuZXcgTm90aWNlKFxuXHRcdFx0XHRgU2VuZGluZyAke21lc3NhZ2VzLmxlbmd0aH0gbm90ZXMgd2l0aCAke3Rva2VuQ291bnR9IHRva2VucyB0byBHUFRgXG5cdFx0XHQpO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvLyBsb2dEZWJ1ZyhcIm1lc3NhZ2VzXCIsIG1lc3NhZ2VzKTtcblxuXHRcdFx0XHRsZXQgZmlyc3REZWx0YSA9IHRydWU7XG5cdFx0XHRcdGF3YWl0IHN0cmVhbVJlc3BvbnNlKFxuXHRcdFx0XHRcdHNldHRpbmdzLmFwaUtleSxcblx0XHRcdFx0XHQvLyBzZXR0aW5ncy5hcGlNb2RlbCxcblx0XHRcdFx0XHRtZXNzYWdlcyxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRtb2RlbDogc2V0dGluZ3MuYXBpTW9kZWwsXG5cdFx0XHRcdFx0XHRtYXhfdG9rZW5zOiBzZXR0aW5ncy5tYXhSZXNwb25zZVRva2VucyB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHQvLyBtYXhfdG9rZW5zOiBnZXRUb2tlbkxpbWl0KHNldHRpbmdzKSAtIHRva2VuQ291bnQgLSAxLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8ge1xuXHRcdFx0XHRcdC8vIFx0bWF4X3Rva2Vuczogc2V0dGluZ3MubWF4UmVzcG9uc2VUb2tlbnMgfHwgdW5kZWZpbmVkLFxuXHRcdFx0XHRcdC8vIFx0dGVtcGVyYXR1cmU6IHNldHRpbmdzLnRlbXBlcmF0dXJlLFxuXHRcdFx0XHRcdC8vIH1cblx0XHRcdFx0XHQoZGVsdGE/OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdC8vICogTGFzdCBjYWxsXG5cdFx0XHRcdFx0XHRpZiAoIWRlbHRhKSB7XG5cdFx0XHRcdFx0XHRcdC8vIGNvbnN0IGhlaWdodCA9IGNhbGNIZWlnaHQoe1xuXHRcdFx0XHRcdFx0XHQvLyBcdHRleHQ6IGNyZWF0ZWQudGV4dCxcblx0XHRcdFx0XHRcdFx0Ly8gXHRwYXJlbnRIZWlnaHQ6IG5vZGUuaGVpZ2h0LFxuXHRcdFx0XHRcdFx0XHQvLyB9KTtcblx0XHRcdFx0XHRcdFx0Ly8gY3JlYXRlZC5tb3ZlQW5kUmVzaXplKHtcblx0XHRcdFx0XHRcdFx0Ly8gXHRoZWlnaHQsXG5cdFx0XHRcdFx0XHRcdC8vIFx0d2lkdGg6IGNyZWF0ZWQud2lkdGgsXG5cdFx0XHRcdFx0XHRcdC8vIFx0eDogY3JlYXRlZC54LFxuXHRcdFx0XHRcdFx0XHQvLyBcdHk6IGNyZWF0ZWQueSxcblx0XHRcdFx0XHRcdFx0Ly8gfSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IG5ld1RleHQ7XG5cdFx0XHRcdFx0XHRpZiAoZmlyc3REZWx0YSkge1xuXHRcdFx0XHRcdFx0XHRuZXdUZXh0ID0gZGVsdGE7XG5cdFx0XHRcdFx0XHRcdGZpcnN0RGVsdGEgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0XHRjcmVhdGVkLm1vdmVBbmRSZXNpemUoe1xuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDogTk9URV9NSU5fSEVJR0hULFxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBjcmVhdGVkLndpZHRoLFxuXHRcdFx0XHRcdFx0XHRcdHg6IGNyZWF0ZWQueCxcblx0XHRcdFx0XHRcdFx0XHR5OiBjcmVhdGVkLnksXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgaGVpZ2h0ID0gY2FsY0hlaWdodCh7XG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogY3JlYXRlZC50ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdC8vIHBhcmVudEhlaWdodDogbm9kZS5oZWlnaHQsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoaGVpZ2h0ID4gY3JlYXRlZC5oZWlnaHQpIHtcblx0XHRcdFx0XHRcdFx0XHRjcmVhdGVkLm1vdmVBbmRSZXNpemUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjcmVhdGVkLmhlaWdodCArIE5PVEVfSU5DUl9IRUlHSFRfU1RFUCxcblx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBjcmVhdGVkLndpZHRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0eDogY3JlYXRlZC54LFxuXHRcdFx0XHRcdFx0XHRcdFx0eTogY3JlYXRlZC55LFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG5ld1RleHQgPSBjcmVhdGVkLnRleHQgKyBkZWx0YTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNyZWF0ZWQuc2V0VGV4dChuZXdUZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0Ly8gaWYgKGdlbmVyYXRlZCA9PSBudWxsKSB7XG5cdFx0XHRcdC8vIFx0bmV3IE5vdGljZShgRW1wdHkgb3IgdW5yZWFkYWJsZSByZXNwb25zZSBmcm9tIEdQVGApO1xuXHRcdFx0XHQvLyBcdGNhbnZhcy5yZW1vdmVOb2RlKGNyZWF0ZWQpO1xuXHRcdFx0XHQvLyBcdHJldHVybjtcblx0XHRcdFx0Ly8gfVxuXG5cdFx0XHRcdC8vICogVXBkYXRlIE5vZGVcblx0XHRcdFx0Ly8gY3JlYXRlZC5zZXRUZXh0KGdlbmVyYXRlZC5yZXNwb25zZSk7XG5cdFx0XHRcdC8vIGNvbnN0IG5vZGVEYXRhID0gY3JlYXRlZC5nZXREYXRhKCk7XG5cdFx0XHRcdC8vIGNyZWF0ZWQuc2V0RGF0YSh7XG5cdFx0XHRcdC8vIFx0Li4ubm9kZURhdGEsXG5cdFx0XHRcdC8vIFx0cXVlc3Rpb25zOiBnZW5lcmF0ZWQucXVlc3Rpb25zLFxuXHRcdFx0XHQvLyB9KTtcblx0XHRcdFx0Ly8gY29uc3QgaGVpZ2h0ID0gY2FsY0hlaWdodCh7XG5cdFx0XHRcdC8vIFx0dGV4dDogZ2VuZXJhdGVkLnJlc3BvbnNlLFxuXHRcdFx0XHQvLyBcdHBhcmVudEhlaWdodDogbm9kZS5oZWlnaHQsXG5cdFx0XHRcdC8vIH0pO1xuXHRcdFx0XHQvLyBjcmVhdGVkLm1vdmVBbmRSZXNpemUoe1xuXHRcdFx0XHQvLyBcdGhlaWdodCxcblx0XHRcdFx0Ly8gXHR3aWR0aDogY3JlYXRlZC53aWR0aCxcblx0XHRcdFx0Ly8gXHR4OiBjcmVhdGVkLngsXG5cdFx0XHRcdC8vIFx0eTogY3JlYXRlZC55LFxuXHRcdFx0XHQvLyB9KTtcblxuXHRcdFx0XHQvLyBjb25zdCBzZWxlY3RlZE5vdGVJZCA9XG5cdFx0XHRcdC8vIFx0Y2FudmFzLnNlbGVjdGlvbj8uc2l6ZSA9PT0gMVxuXHRcdFx0XHQvLyBcdFx0PyBBcnJheS5mcm9tKGNhbnZhcy5zZWxlY3Rpb24udmFsdWVzKCkpPy5bMF0/LmlkXG5cdFx0XHRcdC8vIFx0XHQ6IHVuZGVmaW5lZDtcblxuXHRcdFx0XHQvLyBpZiAoc2VsZWN0ZWROb3RlSWQgPT09IG5vZGU/LmlkIHx8IHNlbGVjdGVkTm90ZUlkID09IG51bGwpIHtcblx0XHRcdFx0Ly8gXHQvLyBJZiB0aGUgdXNlciBoYXMgbm90IGNoYW5nZWQgc2VsZWN0aW9uLCBzZWxlY3QgdGhlIGNyZWF0ZWQgbm9kZVxuXHRcdFx0XHQvLyBcdGNhbnZhcy5zZWxlY3RPbmx5KGNyZWF0ZWQsIGZhbHNlIC8qIHN0YXJ0RWRpdGluZyAqLyk7XG5cdFx0XHRcdC8vIH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdG5ldyBOb3RpY2UoYEVycm9yIGNhbGxpbmcgR1BUOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCk7XG5cdFx0XHRcdGlmICghdG9Ob2RlKSB7XG5cdFx0XHRcdFx0Y2FudmFzLnJlbW92ZU5vZGUoY3JlYXRlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgY2FudmFzLnJlcXVlc3RTYXZlKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIHJldHVybiB7IG5leHROb3RlLCBnZW5lcmF0ZU5vdGUgfTtcblx0cmV0dXJuIHsgZ2VuZXJhdGVOb3RlLCBidWlsZE1lc3NhZ2VzIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbkxpbWl0KHNldHRpbmdzOiBBdWdtZW50ZWRDYW52YXNTZXR0aW5ncykge1xuXHRjb25zdCBtb2RlbCA9XG5cdFx0Y2hhdE1vZGVsQnlOYW1lKHNldHRpbmdzLmFwaU1vZGVsKSB8fCBDSEFUX01PREVMUy5HUFRfNF8xMTA2X1BSRVZJRVc7XG5cdGNvbnN0IHRva2VuTGltaXQgPSBzZXR0aW5ncy5tYXhJbnB1dFRva2Vuc1xuXHRcdD8gTWF0aC5taW4oc2V0dGluZ3MubWF4SW5wdXRUb2tlbnMsIG1vZGVsLnRva2VuTGltaXQpXG5cdFx0OiBtb2RlbC50b2tlbkxpbWl0O1xuXG5cdC8vIGNvbnNvbGUubG9nKHsgc2V0dGluZ3MsIHRva2VuTGltaXQgfSk7XG5cdHJldHVybiB0b2tlbkxpbWl0O1xufVxuIl19