import { App, setIcon, setTooltip } from "obsidian";
import { getTokenLimit, noteGenerator } from "./noteGenerator";
import { AugmentedCanvasSettings } from "../../settings/AugmentedCanvasSettings";
import { CanvasNode } from "../../obsidian/canvas-internal";
import { getResponse } from "../../utils/chatgpt";
import { getActiveCanvas, getActiveCanvasNodes } from "src/utils";
import { parseAIResponse } from "../../utils/jsonUtils";

const SYSTEM_PROMPT_QUESTIONS = `
You must respond ONLY with valid JSON in this exact format:
{
	"questions": ["Question 1?", "Question 2?", "Question 3?"]
}

Generate 3-5 follow-up questions based on the content. The questions must be in the same language as the content, default to English.

IMPORTANT: Return ONLY the JSON object, no other text before or after.
`.trim();

// Fallback function to extract questions from plain text
function extractQuestionsFromText(text: string): string[] {
	const questions: string[] = [];
	
	// Try to find questions in various formats
	const lines = text.split('\n').map(line => line.trim()).filter(line => line);
	
	for (const line of lines) {
		// Look for lines that end with '?' or start with question words
		if (line.endsWith('?') || 
			/^(what|how|why|when|where|who|which|could|would|should|can|will|is|are|do|does|did)/i.test(line)) {
			// Clean up the line (remove bullet points, numbers, etc.)
			const cleanQuestion = line.replace(/^[-*•\d+.\s]+/, '').trim();
			if (cleanQuestion.length > 10) { // Ignore very short "questions"
				questions.push(cleanQuestion);
			}
		}
	}
	
	// If no questions found, return a default set
	if (questions.length === 0) {
		return [
			"Can you explain this in more detail?",
			"What are the key takeaways?",
			"How does this relate to other concepts?"
		];
	}
	
	return questions.slice(0, 5); // Limit to 5 questions
}

export const addAskAIButton = async (
	app: App,
	settings: AugmentedCanvasSettings,
	menuEl: HTMLElement
) => {
	const buttonEl_AskAI = createEl("button", "clickable-icon gpt-menu-item");
	setTooltip(buttonEl_AskAI, "Ask AI", {
		placement: "top",
	});
	setIcon(buttonEl_AskAI, "lucide-sparkles");
	menuEl.appendChild(buttonEl_AskAI);

	buttonEl_AskAI.addEventListener("click", async () => {
		const { generateNote } = noteGenerator(app, settings);

		await generateNote();
	});
};

export const handleCallGPT_Question = async (
	app: App,
	settings: AugmentedCanvasSettings,
	node: CanvasNode,
	question: string
) => {
	if (node.unknownData.type === "group") {
		return;
	}

	const { generateNote } = noteGenerator(app, settings);
	await generateNote(question);
};

export const handleCallGPT_Questions = async (
	app: App,
	settings: AugmentedCanvasSettings,
	node: CanvasNode
) => {
	const { buildMessages } = noteGenerator(app, settings);
	const { messages, tokenCount } = await buildMessages(node, {
		systemPrompt: SYSTEM_PROMPT_QUESTIONS,
	});
	if (messages.length <= 1) return;

	const gptResponse = await getResponse(
		settings.apiKey,
		// settings.apiModel,
		messages,
		{
			model: settings.apiModel,
			max_tokens: settings.maxResponseTokens || undefined,
			// max_tokens: getTokenLimit(settings) - tokenCount - 1,
			temperature: settings.temperature,
			isJSON: true,
		}
	);

	try {
		const parsedResponse = parseAIResponse(gptResponse);
		if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
			return parsedResponse.questions;
		} else {
			console.error('Invalid response format:', parsedResponse);
			return [];
		}
	} catch (error) {
		console.error('Failed to parse JSON response:', gptResponse, error);
		// Try to extract questions from plain text response
		const textResponse = typeof gptResponse === 'string' ? gptResponse : JSON.stringify(gptResponse);
		const questions = extractQuestionsFromText(textResponse);
		return questions.length > 0 ? questions : [];
	}
};

const handleRegenerateResponse = async (
	app: App,
	settings: AugmentedCanvasSettings
) => {
	const activeNode = getActiveCanvasNodes(app)![0];

	// Extract the question from the edge label if it exists
	// @ts-expect-error
	const edgeLabel = activeNode.label;
	const question = edgeLabel && edgeLabel.trim() ? edgeLabel.trim() : undefined;

	const { generateNote } = noteGenerator(
		app,
		settings,
		// @ts-expect-error
		activeNode.from.node,
		// @ts-expect-error
		activeNode.to.node
	);

	// Pass the question when regenerating to maintain the original prompt
	await generateNote(question);
};

export const addRegenerateResponse = async (
	app: App,
	settings: AugmentedCanvasSettings,
	menuEl: HTMLElement
) => {
	const buttonEl_AskAI = createEl("button", "clickable-icon gpt-menu-item");
	setTooltip(buttonEl_AskAI, "Regenerate response", {
		placement: "top",
	});
	// TODO
	setIcon(buttonEl_AskAI, "lucide-rotate-cw");
	menuEl.appendChild(buttonEl_AskAI);

	buttonEl_AskAI.addEventListener("click", () =>
		handleRegenerateResponse(app, settings)
	);
};
