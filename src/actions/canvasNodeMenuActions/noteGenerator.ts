import { TiktokenModel, encodingForModel } from "js-tiktoken";
import { App, ItemView, Notice } from "obsidian";
import { CanvasNode } from "../../obsidian/canvas-internal";
import {
	CanvasView,
	calcHeight,
	createNode,
} from "../../obsidian/canvas-patches";
import {
	AugmentedCanvasSettings,
	DEFAULT_SETTINGS,
} from "../../settings/AugmentedCanvasSettings";
// import { Logger } from "./util/logging";
import { visitNodeAndAncestors } from "../../obsidian/canvasUtil";
import { readNodeContent } from "../../obsidian/fileUtil";
import { getResponse, streamResponse, getAIService } from "../../utils/chatgpt";
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
const logDebug = (text: any) => null;

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

export function noteGenerator(
	app: App,
	settings: AugmentedCanvasSettings,
	fromNode?: CanvasNode,
	toNode?: CanvasNode
	// logDebug: Logger
) {
	const canCallAI = () => {
		try {
			const aiService = getAIService();
			const status = aiService.getCurrentProviderStatus();
			
			if (!status.available) {
				new Notice(status.error || "AI provider not configured");
				return false;
			}
			
			return true;
		} catch (error) {
			new Notice("AI service not available. Please check plugin settings.");
			return false;
		}
	};

	const getActiveCanvas = () => {
		const maybeCanvasView = app.workspace.getActiveViewOfType(
			ItemView
		) as CanvasView | null;
		return maybeCanvasView ? maybeCanvasView["canvas"] : null;
	};

	const isSystemPromptNode = (text: string) =>
		text.trim().startsWith("SYSTEM PROMPT");

	const getSystemPrompt = async (node: CanvasNode) => {
		// TODO
		let foundPrompt: string | null = null;

		await visitNodeAndAncestors(node, async (n: CanvasNode) => {
			const text = await readNodeContent(n);
			if (text && isSystemPromptNode(text)) {
				foundPrompt = text.replace("SYSTEM PROMPT", "").trim();
				return false;
			} else {
				return true;
			}
		});

		return foundPrompt || settings.systemPrompt;
	};

	const buildMessages = async (
		node: CanvasNode,
		{
			systemPrompt,
			prompt,
		}: {
			systemPrompt?: string;
			prompt?: string;
		} = {}
	) => {
		// return { messages: [], tokenCount: 0 };

		const encoding = encodingForModel(
			// (settings.apiModel || DEFAULT_SETTINGS.apiModel) as TiktokenModel
			"gpt-4"
		);

		const messages: any[] = [];
		let tokenCount = 0;

		// Note: We are not checking for system prompt longer than context window.
		// That scenario makes no sense, though.
		const systemPrompt2 = systemPrompt || (await getSystemPrompt(node));
		if (systemPrompt2) {
			tokenCount += encoding.encode(systemPrompt2).length;
		}

		const visit = async (
			node: CanvasNode,
			depth: number,
			edgeLabel?: string
		) => {
			if (settings.maxDepth && depth > settings.maxDepth) return false;

			const nodeData = node.getData();
			let nodeText = (await readNodeContent(node))?.trim() || "";
			const inputLimit = getTokenLimit(settings);

			let shouldContinue = true;

			if (nodeText) {
				if (isSystemPromptNode(nodeText)) return true;

				// Add context separator for connected nodes to improve AI understanding
				const contextSeparator = depth > 0 ? settings.contextSeparator : "";
				const nodeContentWithContext = `${contextSeparator}${nodeText}`;
				
				let nodeTokens = encoding.encode(nodeContentWithContext);
				let keptNodeTokens: number;

				if (tokenCount + nodeTokens.length > inputLimit) {
					// will exceed input limit

					shouldContinue = false;

					// Account for separator tokens when truncating
					const separatorTokens = encoding.encode(contextSeparator);
					const availableTokens = inputLimit - tokenCount - separatorTokens.length - 1;
					
					// Leaving one token margin, just in case
					const keepTokens = encoding.encode(nodeText).slice(0, availableTokens);
					const truncateTextTo = encoding.decode(keepTokens).length;
					logDebug(
						`Truncating node text from ${nodeText.length} to ${truncateTextTo} characters`
					);
					new Notice(
						`Truncating node text from ${nodeText.length} to ${truncateTextTo} characters`
					);
					nodeText = nodeText.slice(0, truncateTextTo);
					keptNodeTokens = separatorTokens.length + keepTokens.length;
				} else {
					keptNodeTokens = nodeTokens.length;
				}

				tokenCount += keptNodeTokens;

				const role: any =
					nodeData.chat_role === "assistant" ? "assistant" : "user";

				// Recalculate content with separator using potentially truncated nodeText
				const finalNodeContentWithContext = `${contextSeparator}${nodeText}`;

				if (edgeLabel) {
					messages.unshift({
						content: edgeLabel,
						role: "user",
					});
				}
				messages.unshift({
					content: finalNodeContentWithContext,
					role,
				});
			}

			return shouldContinue;
		};

		await visitNodeAndAncestors(node, visit);

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
	};

	const generateNote = async (question?: string) => {
		if (!canCallAI()) return;

		logDebug("Creating AI note");

		const canvas = getActiveCanvas();
		if (!canvas) {
			logDebug("No active canvas");
			return;
		}
		// console.log({ canvas });

		await canvas.requestFrame();

		let node: CanvasNode;
		if (!fromNode) {
			const selection = canvas.selection;
			if (selection?.size !== 1) return;
			const values = Array.from(selection.values());
			node = values[0];
		} else {
			node = fromNode;
		}

		if (node) {
			// Last typed characters might not be applied to note yet
			await canvas.requestSave();
			await sleep(200);

			const { messages, tokenCount } = await buildMessages(node, {
				prompt: question,
			});
			// console.log({ messages });
			if (!messages.length) return;

			let created: CanvasNode;
			if (!toNode) {
				created = createNode(
					canvas,
					{
						// text: "```loading...```",
						text: `\`\`\`Calling AI (${settings.apiModel})...\`\`\``,
						size: { height: placeholderNoteHeight },
					},
					node,
					{
						color: assistantColor,
						chat_role: "assistant",
					},
					question
				);
			} else {
				created = toNode;
				created.setText(
					`\`\`\`Calling AI (${settings.apiModel})...\`\`\``
				);
			}

			new Notice(
				`Sending ${messages.length} notes with ${tokenCount} tokens to GPT`
			);

			try {
				// logDebug("messages", messages);

				let firstDelta = true;
				await streamResponse(
					settings.apiKey,
					// settings.apiModel,
					messages,
					{
						model: settings.apiModel,
						max_tokens: settings.maxResponseTokens || undefined,
						// max_tokens: getTokenLimit(settings) - tokenCount - 1,
					},
					// {
					// 	max_tokens: settings.maxResponseTokens || undefined,
					// 	temperature: settings.temperature,
					// }
					(delta?: string) => {
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

						let newText: string;
						if (firstDelta) {
							newText = delta;
							firstDelta = false;

							created.moveAndResize({
								height: NOTE_MIN_HEIGHT,
								width: created.width,
								x: created.x,
								y: created.y,
							});
						} else {
							const height = calcHeight({
								text: created.text,
								// parentHeight: node.height,
							});
							if (height > created.height) {
								created.moveAndResize({
									height:
										created.height + NOTE_INCR_HEIGHT_STEP,
									width: created.width,
									x: created.x,
									y: created.y,
								});
							}
							newText = created.text + delta;
						}
						created.setText(newText);
					}
				);

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
			} catch (error) {
				new Notice(`Error calling GPT: ${error.message || error}`);
				if (!toNode) {
					canvas.removeNode(created);
				}
			}

			await canvas.requestSave();
		}
	};

	// return { nextNote, generateNote };
	return { generateNote, buildMessages };
}

export function getTokenLimit(settings: AugmentedCanvasSettings) {
	const model =
		chatModelByName(settings.apiModel) || CHAT_MODELS.GPT_4_1106_PREVIEW;
	const tokenLimit = settings.maxInputTokens
		? Math.min(settings.maxInputTokens, model.tokenLimit)
		: model.tokenLimit;

	// console.log({ settings, tokenLimit });
	return tokenLimit;
}
