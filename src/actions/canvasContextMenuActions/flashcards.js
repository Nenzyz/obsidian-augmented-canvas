import { __awaiter } from "tslib";
import { Notice } from "obsidian";
import { getActiveCanvas } from "../../utils";
import { readNodeContent } from "../../obsidian/fileUtil";
import { getResponse } from "../../utils/chatgpt";
const FLASHCARDS_SYSTEM_PROMPT = `
You must respond in this JSON format: {
	"filename": The filename,
	"flashcards": {
		"front": string,
		"back": string
	}[]
}

You must respond in the language the user used, default to english.
`.trim();
export const createFlashcards = (app, settings) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const canvas = getActiveCanvas(app);
    if (!canvas)
        return;
    new Notice("Flashcard file being created...");
    const node = (_a = Array.from(canvas.selection)) === null || _a === void 0 ? void 0 : _a.first();
    const nodeText = ((_b = (yield readNodeContent(node))) === null || _b === void 0 ? void 0 : _b.trim()) || "";
    // TODO : respect token limit
    // const encoding = encodingForModel(
    // 	(settings.apiModel || DEFAULT_SETTINGS.apiModel) as TiktokenModel
    // );
    // const inputLimit = getTokenLimit(settings);
    // let nodeTokens = encoding.encode(nodeText);
    // const keepTokens = nodeTokens.slice(0, inputLimit - tokenCount - 1);
    // const truncateTextTo = encoding.decode(keepTokens).length;
    // // console.log(
    // // 	`Truncating node text from ${nodeText.length} to ${truncateTextTo} characters`
    // // );
    // nodeText = nodeText.slice(0, truncateTextTo);
    const gptResponse = yield getResponse(settings.apiKey, [
        {
            role: "system",
            content: `${FLASHCARDS_SYSTEM_PROMPT}

${settings.flashcardsSystemPrompt}`,
        },
        {
            role: "user",
            content: nodeText,
        },
    ], {
        model: settings.apiModel,
        max_tokens: settings.maxResponseTokens || undefined,
        temperature: settings.temperature,
        isJSON: true,
    });
    // console.log({ gptResponse });
    const content = `
${gptResponse.flashcards
        .map((flashcard) => `${flashcard.front}::${flashcard.back}`
    // 			`#Q
    // ${flashcard.front}::${flashcard.back}`
    )
        .join("\n\n")}
`.trim();
    //  TODO : replace with settings value
    const FLASHCARDS_PATH = "Home/Flashcards";
    try {
        yield app.vault.createFolder(`${FLASHCARDS_PATH}/${gptResponse.filename}`);
    }
    catch (_c) { }
    yield app.vault.create(`${FLASHCARDS_PATH}/${gptResponse.filename}/${gptResponse.filename}.md`, content);
    new Notice(`Flashcard file "${gptResponse.filename}" created successfully`);
    // await app.workspace.openLinkText(
    // 	`Flashcards/${gptResponse.filename}.md`,
    // 	""
    // );
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhc2hjYXJkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZsYXNoY2FyZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLE9BQU8sRUFBTyxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdkMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM5QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFLMUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBR2xELE1BQU0sd0JBQXdCLEdBQUc7Ozs7Ozs7Ozs7Q0FVaEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUVULE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQy9CLEdBQVEsRUFDUixRQUFpQyxFQUNoQyxFQUFFOztJQUNILE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU87SUFFcEIsSUFBSSxNQUFNLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUU5QyxNQUFNLElBQUksR0FBZSxNQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywwQ0FBRSxLQUFLLEVBQUcsQ0FBQztJQUVoRSxNQUFNLFFBQVEsR0FBRyxDQUFBLE1BQUEsQ0FBQyxNQUFNLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQywwQ0FBRSxJQUFJLEVBQUUsS0FBSSxFQUFFLENBQUM7SUFFN0QsNkJBQTZCO0lBQzdCLHFDQUFxQztJQUNyQyxxRUFBcUU7SUFDckUsS0FBSztJQUVMLDhDQUE4QztJQUU5Qyw4Q0FBOEM7SUFFOUMsdUVBQXVFO0lBQ3ZFLDZEQUE2RDtJQUM3RCxrQkFBa0I7SUFDbEIscUZBQXFGO0lBQ3JGLFFBQVE7SUFDUixnREFBZ0Q7SUFFaEQsTUFBTSxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQ3BDLFFBQVEsQ0FBQyxNQUFNLEVBQ2Y7UUFDQztZQUNDLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLEdBQUcsd0JBQXdCOztFQUV0QyxRQUFRLENBQUMsc0JBQXNCLEVBQUU7U0FDL0I7UUFDRDtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLFFBQVE7U0FDakI7S0FDRCxFQUNEO1FBQ0MsS0FBSyxFQUFFLFFBQVEsQ0FBQyxRQUFRO1FBQ3hCLFVBQVUsRUFBRSxRQUFRLENBQUMsaUJBQWlCLElBQUksU0FBUztRQUNuRCxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVc7UUFDakMsTUFBTSxFQUFFLElBQUk7S0FDWixDQUNELENBQUM7SUFDRixnQ0FBZ0M7SUFFaEMsTUFBTSxPQUFPLEdBQUc7RUFDZixXQUFXLENBQUMsVUFBVTtTQUN0QixHQUFHLENBQ0gsQ0FBQyxTQUEwQyxFQUFFLEVBQUUsQ0FDOUMsR0FBRyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxJQUFJLEVBQUU7SUFDeEMsU0FBUztJQUNULHlDQUF5QztLQUN6QztTQUNBLElBQUksQ0FBQyxNQUFNLENBQUM7Q0FDYixDQUFDLElBQUksRUFBRSxDQUFDO0lBRVIsc0NBQXNDO0lBQ3RDLE1BQU0sZUFBZSxHQUFHLGlCQUFpQixDQUFDO0lBQzFDLElBQUk7UUFDSCxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUMzQixHQUFHLGVBQWUsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFLENBQzVDLENBQUM7S0FDRjtJQUFDLFdBQU0sR0FBRTtJQUNWLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQ3JCLEdBQUcsZUFBZSxJQUFJLFdBQVcsQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLFFBQVEsS0FBSyxFQUN2RSxPQUFPLENBQ1AsQ0FBQztJQUVGLElBQUksTUFBTSxDQUFDLG1CQUFtQixXQUFXLENBQUMsUUFBUSx3QkFBd0IsQ0FBQyxDQUFDO0lBRTVFLG9DQUFvQztJQUNwQyw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLEtBQUs7QUFDTixDQUFDLENBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vLi4vb2JzaWRpYW4vY2FudmFzLXBhdGNoZXNcIjtcbmltcG9ydCB7IENhbnZhc05vZGUgfSBmcm9tIFwiLi4vLi4vb2JzaWRpYW4vY2FudmFzLWludGVybmFsXCI7XG5pbXBvcnQgeyBBcHAsIE5vdGljZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgZ2V0QWN0aXZlQ2FudmFzIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5pbXBvcnQgeyByZWFkTm9kZUNvbnRlbnQgfSBmcm9tIFwiLi4vLi4vb2JzaWRpYW4vZmlsZVV0aWxcIjtcbmltcG9ydCB7XG5cdEF1Z21lbnRlZENhbnZhc1NldHRpbmdzLFxuXHRERUZBVUxUX1NFVFRJTkdTLFxufSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvQXVnbWVudGVkQ2FudmFzU2V0dGluZ3NcIjtcbmltcG9ydCB7IGdldFJlc3BvbnNlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NoYXRncHRcIjtcbmltcG9ydCB7IGdldFRva2VuTGltaXQgfSBmcm9tIFwiLi4vY2FudmFzTm9kZU1lbnVBY3Rpb25zL25vdGVHZW5lcmF0b3JcIjtcblxuY29uc3QgRkxBU0hDQVJEU19TWVNURU1fUFJPTVBUID0gYFxuWW91IG11c3QgcmVzcG9uZCBpbiB0aGlzIEpTT04gZm9ybWF0OiB7XG5cdFwiZmlsZW5hbWVcIjogVGhlIGZpbGVuYW1lLFxuXHRcImZsYXNoY2FyZHNcIjoge1xuXHRcdFwiZnJvbnRcIjogc3RyaW5nLFxuXHRcdFwiYmFja1wiOiBzdHJpbmdcblx0fVtdXG59XG5cbllvdSBtdXN0IHJlc3BvbmQgaW4gdGhlIGxhbmd1YWdlIHRoZSB1c2VyIHVzZWQsIGRlZmF1bHQgdG8gZW5nbGlzaC5cbmAudHJpbSgpO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRmxhc2hjYXJkcyA9IGFzeW5jIChcblx0YXBwOiBBcHAsXG5cdHNldHRpbmdzOiBBdWdtZW50ZWRDYW52YXNTZXR0aW5nc1xuKSA9PiB7XG5cdGNvbnN0IGNhbnZhcyA9IGdldEFjdGl2ZUNhbnZhcyhhcHApO1xuXHRpZiAoIWNhbnZhcykgcmV0dXJuO1xuXG5cdG5ldyBOb3RpY2UoXCJGbGFzaGNhcmQgZmlsZSBiZWluZyBjcmVhdGVkLi4uXCIpO1xuXG5cdGNvbnN0IG5vZGUgPSA8Q2FudmFzTm9kZT5BcnJheS5mcm9tKGNhbnZhcy5zZWxlY3Rpb24pPy5maXJzdCgpITtcblxuXHRjb25zdCBub2RlVGV4dCA9IChhd2FpdCByZWFkTm9kZUNvbnRlbnQobm9kZSkpPy50cmltKCkgfHwgXCJcIjtcblxuXHQvLyBUT0RPIDogcmVzcGVjdCB0b2tlbiBsaW1pdFxuXHQvLyBjb25zdCBlbmNvZGluZyA9IGVuY29kaW5nRm9yTW9kZWwoXG5cdC8vIFx0KHNldHRpbmdzLmFwaU1vZGVsIHx8IERFRkFVTFRfU0VUVElOR1MuYXBpTW9kZWwpIGFzIFRpa3Rva2VuTW9kZWxcblx0Ly8gKTtcblxuXHQvLyBjb25zdCBpbnB1dExpbWl0ID0gZ2V0VG9rZW5MaW1pdChzZXR0aW5ncyk7XG5cblx0Ly8gbGV0IG5vZGVUb2tlbnMgPSBlbmNvZGluZy5lbmNvZGUobm9kZVRleHQpO1xuXG5cdC8vIGNvbnN0IGtlZXBUb2tlbnMgPSBub2RlVG9rZW5zLnNsaWNlKDAsIGlucHV0TGltaXQgLSB0b2tlbkNvdW50IC0gMSk7XG5cdC8vIGNvbnN0IHRydW5jYXRlVGV4dFRvID0gZW5jb2RpbmcuZGVjb2RlKGtlZXBUb2tlbnMpLmxlbmd0aDtcblx0Ly8gLy8gY29uc29sZS5sb2coXG5cdC8vIC8vIFx0YFRydW5jYXRpbmcgbm9kZSB0ZXh0IGZyb20gJHtub2RlVGV4dC5sZW5ndGh9IHRvICR7dHJ1bmNhdGVUZXh0VG99IGNoYXJhY3RlcnNgXG5cdC8vIC8vICk7XG5cdC8vIG5vZGVUZXh0ID0gbm9kZVRleHQuc2xpY2UoMCwgdHJ1bmNhdGVUZXh0VG8pO1xuXG5cdGNvbnN0IGdwdFJlc3BvbnNlID0gYXdhaXQgZ2V0UmVzcG9uc2UoXG5cdFx0c2V0dGluZ3MuYXBpS2V5LFxuXHRcdFtcblx0XHRcdHtcblx0XHRcdFx0cm9sZTogXCJzeXN0ZW1cIixcblx0XHRcdFx0Y29udGVudDogYCR7RkxBU0hDQVJEU19TWVNURU1fUFJPTVBUfVxuXG4ke3NldHRpbmdzLmZsYXNoY2FyZHNTeXN0ZW1Qcm9tcHR9YCxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHJvbGU6IFwidXNlclwiLFxuXHRcdFx0XHRjb250ZW50OiBub2RlVGV4dCxcblx0XHRcdH0sXG5cdFx0XSxcblx0XHR7XG5cdFx0XHRtb2RlbDogc2V0dGluZ3MuYXBpTW9kZWwsXG5cdFx0XHRtYXhfdG9rZW5zOiBzZXR0aW5ncy5tYXhSZXNwb25zZVRva2VucyB8fCB1bmRlZmluZWQsXG5cdFx0XHR0ZW1wZXJhdHVyZTogc2V0dGluZ3MudGVtcGVyYXR1cmUsXG5cdFx0XHRpc0pTT046IHRydWUsXG5cdFx0fVxuXHQpO1xuXHQvLyBjb25zb2xlLmxvZyh7IGdwdFJlc3BvbnNlIH0pO1xuXG5cdGNvbnN0IGNvbnRlbnQgPSBgXG4ke2dwdFJlc3BvbnNlLmZsYXNoY2FyZHNcblx0Lm1hcChcblx0XHQoZmxhc2hjYXJkOiB7IGZyb250OiBzdHJpbmc7IGJhY2s6IHN0cmluZyB9KSA9PlxuXHRcdFx0YCR7Zmxhc2hjYXJkLmZyb250fTo6JHtmbGFzaGNhcmQuYmFja31gXG5cdFx0Ly8gXHRcdFx0YCNRXG5cdFx0Ly8gJHtmbGFzaGNhcmQuZnJvbnR9Ojoke2ZsYXNoY2FyZC5iYWNrfWBcblx0KVxuXHQuam9pbihcIlxcblxcblwiKX1cbmAudHJpbSgpO1xuXG5cdC8vICBUT0RPIDogcmVwbGFjZSB3aXRoIHNldHRpbmdzIHZhbHVlXG5cdGNvbnN0IEZMQVNIQ0FSRFNfUEFUSCA9IFwiSG9tZS9GbGFzaGNhcmRzXCI7XG5cdHRyeSB7XG5cdFx0YXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihcblx0XHRcdGAke0ZMQVNIQ0FSRFNfUEFUSH0vJHtncHRSZXNwb25zZS5maWxlbmFtZX1gXG5cdFx0KTtcblx0fSBjYXRjaCB7fVxuXHRhd2FpdCBhcHAudmF1bHQuY3JlYXRlKFxuXHRcdGAke0ZMQVNIQ0FSRFNfUEFUSH0vJHtncHRSZXNwb25zZS5maWxlbmFtZX0vJHtncHRSZXNwb25zZS5maWxlbmFtZX0ubWRgLFxuXHRcdGNvbnRlbnRcblx0KTtcblxuXHRuZXcgTm90aWNlKGBGbGFzaGNhcmQgZmlsZSBcIiR7Z3B0UmVzcG9uc2UuZmlsZW5hbWV9XCIgY3JlYXRlZCBzdWNjZXNzZnVsbHlgKTtcblxuXHQvLyBhd2FpdCBhcHAud29ya3NwYWNlLm9wZW5MaW5rVGV4dChcblx0Ly8gXHRgRmxhc2hjYXJkcy8ke2dwdFJlc3BvbnNlLmZpbGVuYW1lfS5tZGAsXG5cdC8vIFx0XCJcIlxuXHQvLyApO1xufTtcbiJdfQ==