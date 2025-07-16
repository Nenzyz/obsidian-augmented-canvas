// Utility functions for handling AI JSON responses

/**
 * Cleans JSON response from markdown code blocks and other formatting
 */
export function cleanJsonResponse(text: string): string {
	// Remove markdown code blocks (```json ... ``` or ``` ... ```)
	let cleaned = text.trim();
	
	// Remove opening code block
	cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
	
	// Remove closing code block
	cleaned = cleaned.replace(/\n?```\s*$/i, '');
	
	// Remove any remaining backticks at start/end
	cleaned = cleaned.replace(/^`+|`+$/g, '');
	
	return cleaned.trim();
}

/**
 * Safely parses AI response that might be JSON string or already parsed object
 */
export function parseAIResponse(response: any): any {
	try {
		if (typeof response === 'string') {
			const cleanedJson = cleanJsonResponse(response);
			return JSON.parse(cleanedJson);
		}
		return response;
	} catch (error) {
		console.error('Failed to parse AI response:', response, error);
		throw error;
	}
}