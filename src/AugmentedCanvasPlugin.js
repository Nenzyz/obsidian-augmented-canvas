import { __awaiter } from "tslib";
import { ItemView, Notice, Plugin, setIcon, setTooltip, } from "obsidian";
import { around } from "monkey-around";
import { addAskAIButton, addRegenerateResponse, handleCallGPT_Question, } from "./actions/canvasNodeMenuActions/advancedCanvas";
import { DEFAULT_SETTINGS, } from "./settings/AugmentedCanvasSettings";
import SettingsTab from "./settings/SettingsTab";
import { CustomQuestionModal } from "./modals/CustomQuestionModal";
import { handlePatchNoteMenu } from "./actions/menuPatches/noteMenuPatch";
import { getActiveCanvas } from "./utils";
import SystemPromptsModal from "./modals/SystemPromptsModal";
import { createFlashcards } from "./actions/canvasNodeContextMenuActions/flashcards";
import { setAIService } from "./utils/chatgpt";
import { AIService } from "./services/aiService";
import { parseCsv } from "./utils/csvUtils";
import { handleAddRelevantQuestions } from "./actions/commands/relevantQuestions";
import { handleGenerateImage } from "./actions/canvasNodeContextMenuActions/generateImage";
import { initLogDebug } from "./logDebug";
import FolderSuggestModal from "./modals/FolderSuggestModal";
import { insertSystemPrompt } from "./actions/commands/insertSystemPrompt";
import { runPromptFolder } from "./actions/commands/runPromptFolder";
// @ts-expect-error
import promptsCsvText from "./data/prompts.csv.txt";
export default class AugmentedCanvasPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.triggerByPlugin = false;
        this.patchSucceed = false;
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            // Initialize AI service
            this.aiService = new AIService(this.settings);
            setAIService(this.aiService);
            this.addSettingTab(new SettingsTab(this.app, this));
            // this.registerCommands();
            // this.registerCanvasEvents();
            // this.registerCustomIcons();
            // this.patchCanvas();
            this.app.workspace.onLayoutReady(() => {
                initLogDebug(this.settings);
                this.patchCanvasMenu();
                this.addCommands();
                this.patchNoteContextMenu();
                if (this.settings.systemPrompts.length === 0) {
                    this.fetchSystemPrompts();
                }
            });
            // this.patchCanvasInteraction();
            // this.patchCanvasNode();
            // const generator = noteGenerator(this.app, this.settings, this.logDebug)
            // const generator = noteGenerator(this.app);
            // this.addSettingTab(new SettingsTab(this.app, this))
            // this.addCommand({
            // 	id: "next-note",
            // 	name: "Create next note",
            // 	callback: () => {
            // 		generator.nextNote();
            // 	},
            // 	hotkeys: [
            // 		{
            // 			modifiers: ["Alt", "Shift"],
            // 			key: "N",
            // 		},
            // 	],
            // });
            // this.addCommand({
            // 	id: "generate-note",
            // 	name: "Generate AI note",
            // 	callback: () => {
            // 		generator.generateNote();
            // 	},
            // 	hotkeys: [
            // 		{
            // 			modifiers: ["Alt", "Shift"],
            // 			key: "G",
            // 		},
            // 	],
            // });
        });
    }
    onunload() {
        // refreshAllCanvasView(this.app);
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
            // Migration logic for backward compatibility
            this.migrateSettings();
        });
    }
    migrateSettings() {
        // If user has old settings with just apiKey, migrate to new provider structure
        if (this.settings.apiKey && !this.settings.providers.openai.config.apiKey) {
            this.settings.providers.openai.config.apiKey = this.settings.apiKey;
        }
        // Ensure currentProvider is set
        if (!this.settings.currentProvider) {
            this.settings.currentProvider = "openai";
        }
        // Ensure providers structure exists
        if (!this.settings.providers) {
            this.settings.providers = DEFAULT_SETTINGS.providers;
        }
        // Migrate any missing provider structures
        Object.keys(DEFAULT_SETTINGS.providers).forEach(providerType => {
            if (!this.settings.providers[providerType]) {
                this.settings.providers[providerType] =
                    DEFAULT_SETTINGS.providers[providerType];
            }
        });
    }
    patchCanvasMenu() {
        const app = this.app;
        const settings = this.settings;
        const patchMenu = () => {
            var _a, _b;
            const canvasView = (_a = this.app.workspace
                .getLeavesOfType("canvas")
                .first()) === null || _a === void 0 ? void 0 : _a.view;
            if (!canvasView)
                return false;
            // console.log("canvasView", canvasView);
            // TODO: check if this is working (not working in my vault, but works in the sample vault (no .canvas ...))
            const menu = (_b = canvasView === null || canvasView === void 0 ? void 0 : canvasView.canvas) === null || _b === void 0 ? void 0 : _b.menu;
            if (!menu)
                return false;
            const selection = menu.selection;
            if (!selection)
                return false;
            const menuUninstaller = around(menu.constructor.prototype, {
                render: (next) => function (...args) {
                    var _a, _b, _c;
                    const result = next.call(this, ...args);
                    // * If multi selection
                    const maybeCanvasView = app.workspace.getActiveViewOfType(ItemView);
                    if (!maybeCanvasView ||
                        ((_b = (_a = maybeCanvasView.canvas) === null || _a === void 0 ? void 0 : _a.selection) === null || _b === void 0 ? void 0 : _b.size) !== 1)
                        return result;
                    // // * If group
                    // if (node.unknownData.type === "group") return result;
                    if (this.menuEl.querySelector(".gpt-menu-item"))
                        return result;
                    // * If Edge
                    const selectedNode = Array.from((_c = maybeCanvasView.canvas) === null || _c === void 0 ? void 0 : _c.selection)[0];
                    if (
                    // @ts-expect-error
                    selectedNode.from) {
                        if (!selectedNode.unknownData.isGenerated)
                            return;
                        addRegenerateResponse(app, settings, this.menuEl);
                    }
                    else {
                        // * Handles "Call GPT" button
                        addAskAIButton(app, settings, this.menuEl);
                        // const node = <CanvasNode>(
                        // 	Array.from(this.canvas.selection)?.first()
                        // );
                        // if (!node?.unknownData.questions?.length) return;
                        // * Handles "Ask Question" button
                        // TODO: refactor (as above)
                        const buttonEl_AskQuestion = createEl("button", "clickable-icon gpt-menu-item");
                        setTooltip(buttonEl_AskQuestion, "Ask question with AI", {
                            placement: "top",
                        });
                        setIcon(buttonEl_AskQuestion, "lucide-help-circle");
                        this.menuEl.appendChild(buttonEl_AskQuestion);
                        buttonEl_AskQuestion.addEventListener("click", () => {
                            let modal = new CustomQuestionModal(app, (question2) => {
                                var _a;
                                handleCallGPT_Question(app, settings, ((_a = Array.from(this.canvas.selection)) === null || _a === void 0 ? void 0 : _a.first()), question2);
                                // Handle the input
                            });
                            modal.open();
                        });
                        // * Handles "AI Questions" button
                        const buttonEl_AIQuestions = createEl("button", "clickable-icon gpt-menu-item");
                        setTooltip(buttonEl_AIQuestions, "AI generated questions", {
                            placement: "top",
                        });
                        setIcon(buttonEl_AIQuestions, "lucide-file-question");
                        this.menuEl.appendChild(buttonEl_AIQuestions);
                        buttonEl_AIQuestions.addEventListener("click", () => handlePatchNoteMenu(buttonEl_AIQuestions, this.menuEl, {
                            app,
                            settings,
                            canvas: this.canvas,
                        }));
                    }
                    return result;
                },
            });
            this.register(menuUninstaller);
            this.app.workspace.trigger("collapse-node:patched-canvas");
            return true;
        };
        this.app.workspace.onLayoutReady(() => {
            if (!patchMenu()) {
                const evt = this.app.workspace.on("layout-change", () => {
                    patchMenu() && this.app.workspace.offref(evt);
                });
                this.registerEvent(evt);
            }
        });
    }
    fetchSystemPrompts() {
        return __awaiter(this, void 0, void 0, function* () {
            // const response = await fetch(
            // 	"https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv"
            // );
            // const text = await response.text();
            const parsedCsv = parseCsv(promptsCsvText);
            // console.log({ parsedCsv });
            const systemPrompts = parsedCsv
                .slice(1)
                .map((value, index) => ({
                id: index,
                act: value[0],
                prompt: value[1],
            }));
            // console.log({ systemPrompts });
            this.settings.systemPrompts = systemPrompts;
            this.saveSettings();
        });
    }
    patchNoteContextMenu() {
        const settings = this.settings;
        // * no event name to add to Canvas context menu ("canvas-menu" does not exist)
        this.registerEvent(this.app.workspace.on("canvas:node-menu", (menu) => {
            menu.addSeparator();
            menu.addItem((item) => {
                item.setTitle("Create flashcards")
                    .setIcon("lucide-wallet-cards")
                    .onClick(() => {
                    createFlashcards(this.app, settings);
                });
            });
            menu.addItem((item) => {
                item.setTitle("Generate image")
                    .setIcon("lucide-image")
                    .onClick(() => {
                    handleGenerateImage(this.app, settings);
                });
            });
        }));
    }
    addCommands() {
        const app = this.app;
        // * Website to MD
        // this.addCommand({
        // 	id: "insert-website-content",
        // 	name: "Insert the content of a website as markdown",
        // 	checkCallback: (checking: boolean) => {
        // 		if (checking) {
        // 			// console.log({ checkCallback: checking });
        // 			if (!getActiveCanvas(app)) return false;
        // 			return true;
        // 		}
        // 		new InputModal(
        // 			app,
        // 			{
        // 				label: "Enter a website url",
        // 				buttonLabel: "Get website content",
        // 			},
        // 			(videoUrl: string) => {
        // 				new Notice(`Scraping website content`);
        // 				insertWebsiteContent(app, this.settings, videoUrl);
        // 			}
        // 		).open();
        // 	},
        // 	// callback: () => {},
        // });
        // * Youtube captions
        // this.addCommand({
        // 	id: "insert-youtube-caption",
        // 	name: "Insert captions of a Youtube video",
        // 	checkCallback: (checking: boolean) => {
        // 		if (checking) {
        // 			// console.log({ checkCallback: checking });
        // 			if (!getActiveCanvas(app)) return false;
        // 			return true;
        // 		}
        // 		new InputModal(
        // 			app,
        // 			{
        // 				label: "Enter a youtube url",
        // 				buttonLabel: "Scrape captions",
        // 			},
        // 			(videoUrl: string) => {
        // 				new Notice(`Scraping captions of youtube video`);
        // 				runYoutubeCaptions(app, this.settings, videoUrl);
        // 			}
        // 		).open();
        // 	},
        // 	// callback: () => {},
        // });
        this.addCommand({
            id: "run-prompt-folder",
            name: "Run a system prompt on a folder",
            checkCallback: (checking) => {
                if (checking) {
                    // console.log({ checkCallback: checking });
                    if (!getActiveCanvas(app))
                        return false;
                    return true;
                }
                new SystemPromptsModal(app, this.settings, (systemPrompt) => {
                    new Notice(`Selected system prompt ${systemPrompt.act}`);
                    new FolderSuggestModal(app, (folder) => {
                        // new Notice(`Selected folder ${folder.path}`);
                        runPromptFolder(app, this.settings, systemPrompt, folder);
                    }).open();
                }).open();
            },
            // callback: () => {},
        });
        this.addCommand({
            id: "insert-system-prompt",
            name: "Insert system prompt",
            checkCallback: (checking) => {
                if (checking) {
                    // console.log({ checkCallback: checking });
                    if (!getActiveCanvas(app))
                        return false;
                    return true;
                }
                new SystemPromptsModal(app, this.settings, (systemPrompt) => insertSystemPrompt(app, systemPrompt)).open();
            },
            // callback: () => {},
        });
        this.addCommand({
            id: "insert-relevant-questions",
            name: "Insert relevant questions",
            checkCallback: (checking) => {
                if (checking) {
                    // console.log({ checkCallback: checking });
                    if (!getActiveCanvas(app))
                        return false;
                    return true;
                }
                // new SystemPromptsModal(this.app, this.settings).open();
                handleAddRelevantQuestions(app, this.settings);
            },
            // callback: async () => {},
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
            // Update AI service with new settings
            if (this.aiService) {
                this.aiService.updateSettings(this.settings);
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVnbWVudGVkQ2FudmFzUGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQXVnbWVudGVkQ2FudmFzUGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBR04sUUFBUSxFQUdSLE1BQU0sRUFDTixNQUFNLEVBRU4sT0FBTyxFQUNQLFVBQVUsR0FDVixNQUFNLFVBQVUsQ0FBQztBQUNsQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFDTixjQUFjLEVBQ2QscUJBQXFCLEVBQ3JCLHNCQUFzQixHQUN0QixNQUFNLGdEQUFnRCxDQUFDO0FBQ3hELE9BQU8sRUFFTixnQkFBZ0IsR0FFaEIsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1QyxPQUFPLFdBQVcsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVuRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUMxRSxPQUFPLEVBQXFCLGVBQWUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM3RCxPQUFPLGtCQUFrQixNQUFNLDZCQUE2QixDQUFDO0FBRTdELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBRXJGLE9BQU8sRUFBZSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFakQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDMUMsT0FBTyxrQkFBa0IsTUFBTSw2QkFBNkIsQ0FB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QUUsRUFBRTtnQkFDcEMsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsNENBQTRDO29CQUM1QyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQzt3QkFBRSxPQUFPLEtBQUssQ0FBQztvQkFDeEMsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsMERBQTBEO2dCQUMxRCwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFDRCw0QkFBNEI7U0FDNUIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVLLFlBQVk7O1lBQ2pCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkMsc0NBQXNDO1lBQ3RDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzdDO1FBQ0YsQ0FBQztLQUFBO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRDYW52YXMsXG5cdENhbnZhc1ZpZXcsXG5cdEl0ZW1WaWV3LFxuXHRNZW51LFxuXHRNZW51SXRlbSxcblx0Tm90aWNlLFxuXHRQbHVnaW4sXG5cdFRGb2xkZXIsXG5cdHNldEljb24sXG5cdHNldFRvb2x0aXAsXG59IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgYXJvdW5kIH0gZnJvbSBcIm1vbmtleS1hcm91bmRcIjtcbmltcG9ydCB7XG5cdGFkZEFza0FJQnV0dG9uLFxuXHRhZGRSZWdlbmVyYXRlUmVzcG9uc2UsXG5cdGhhbmRsZUNhbGxHUFRfUXVlc3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvY2FudmFzTm9kZU1lbnVBY3Rpb25zL2FkdmFuY2VkQ2FudmFzXCI7XG5pbXBvcnQge1xuXHRBdWdtZW50ZWRDYW52YXNTZXR0aW5ncyxcblx0REVGQVVMVF9TRVRUSU5HUyxcblx0U3lzdGVtUHJvbXB0LFxufSBmcm9tIFwiLi9zZXR0aW5ncy9BdWdtZW50ZWRDYW52YXNTZXR0aW5nc1wiO1xuaW1wb3J0IFNldHRpbmdzVGFiIGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdzVGFiXCI7XG5pbXBvcnQgeyBDdXN0b21RdWVzdGlvbk1vZGFsIH0gZnJvbSBcIi4vbW9kYWxzL0N1c3RvbVF1ZXN0aW9uTW9kYWxcIjtcbmltcG9ydCB7IENhbnZhc05vZGUgfSBmcm9tIFwiLi9vYnNpZGlhbi9jYW52YXMtaW50ZXJuYWxcIjtcbmltcG9ydCB7IGhhbmRsZVBhdGNoTm90ZU1lbnUgfSBmcm9tIFwiLi9hY3Rpb25zL21lbnVQYXRjaGVzL25vdGVNZW51UGF0Y2hcIjtcbmltcG9ydCB7IGNyZWF0ZUNhbnZhc0dyb3VwLCBnZXRBY3RpdmVDYW52YXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IFN5c3RlbVByb21wdHNNb2RhbCBmcm9tIFwiLi9tb2RhbHMvU3lzdGVtUHJvbXB0c01vZGFsXCI7XG5cbmltcG9ydCB7IGNyZWF0ZUZsYXNoY2FyZHMgfSBmcm9tIFwiLi9hY3Rpb25zL2NhbnZhc05vZGVDb250ZXh0TWVudUFjdGlvbnMvZmxhc2hjYXJkc1wiO1xuaW1wb3J0IHsgZ2V0RmlsZXNDb250ZW50IH0gZnJvbSBcIi4vb2JzaWRpYW4vZmlsZVV0aWxcIjtcbmltcG9ydCB7IGdldFJlc3BvbnNlLCBzZXRBSVNlcnZpY2UgfSBmcm9tIFwiLi91dGlscy9jaGF0Z3B0XCI7XG5pbXBvcnQgeyBBSVNlcnZpY2UgfSBmcm9tIFwiLi9zZXJ2aWNlcy9haVNlcnZpY2VcIjtcbmltcG9ydCB7IFByb3ZpZGVyVHlwZSB9IGZyb20gXCIuL3Byb3ZpZGVyc1wiO1xuaW1wb3J0IHsgcGFyc2VDc3YgfSBmcm9tIFwiLi91dGlscy9jc3ZVdGlsc1wiO1xuaW1wb3J0IHsgaGFuZGxlQWRkUmVsZXZhbnRRdWVzdGlvbnMgfSBmcm9tIFwiLi9hY3Rpb25zL2NvbW1hbmRzL3JlbGV2YW50UXVlc3Rpb25zXCI7XG5pbXBvcnQgeyBoYW5kbGVHZW5lcmF0ZUltYWdlIH0gZnJvbSBcIi4vYWN0aW9ucy9jYW52YXNOb2RlQ29udGV4dE1lbnVBY3Rpb25zL2dlbmVyYXRlSW1hZ2VcIjtcbmltcG9ydCB7IGluaXRMb2dEZWJ1ZyB9IGZyb20gXCIuL2xvZ0RlYnVnXCI7XG5pbXBvcnQgRm9sZGVyU3VnZ2VzdE1vZGFsIGZyb20gXCIuL21vZGFscy9Gb2xkZXJTdWdnZXN0TW9kYWxcIjtcbmltcG9ydCB7IGNhbGNIZWlnaHQsIGNyZWF0ZU5vZGUgfSBmcm9tIFwiLi9vYnNpZGlhbi9jYW52YXMtcGF0Y2hlc1wiO1xuaW1wb3J0IHsgaW5zZXJ0U3lzdGVtUHJvbXB0IH0gZnJvbSBcIi4vYWN0aW9ucy9jb21tYW5kcy9pbnNlcnRTeXN0ZW1Qcm9tcHRcIjtcbmltcG9ydCB7IHJ1blByb21wdEZvbGRlciB9IGZyb20gXCIuL2FjdGlvbnMvY29tbWFuZHMvcnVuUHJvbXB0Rm9sZGVyXCI7XG5pbXBvcnQgeyBJbnB1dE1vZGFsIH0gZnJvbSBcIi4vbW9kYWxzL0lucHV0TW9kYWxcIjtcbmltcG9ydCB7IHJ1bllvdXR1YmVDYXB0aW9ucyB9IGZyb20gXCIuL2FjdGlvbnMvY29tbWFuZHMveW91dHViZUNhcHRpb25zXCI7XG5pbXBvcnQgeyBpbnNlcnRXZWJzaXRlQ29udGVudCB9IGZyb20gXCIuL2FjdGlvbnMvY29tbWFuZHMvd2Vic2l0ZUNvbnRlbnRcIjtcblxuLy8gQHRzLWV4cGVjdC1lcnJvclxuaW1wb3J0IHByb21wdHNDc3ZUZXh0IGZyb20gXCIuL2RhdGEvcHJvbXB0cy5jc3YudHh0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1Z21lbnRlZENhbnZhc1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHRyaWdnZXJCeVBsdWdpbjogYm9vbGVhbiA9IGZhbHNlO1xuXHRwYXRjaFN1Y2NlZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRzZXR0aW5nczogQXVnbWVudGVkQ2FudmFzU2V0dGluZ3M7XG5cdGFpU2VydmljZTogQUlTZXJ2aWNlO1xuXG5cdGFzeW5jIG9ubG9hZCgpIHtcblx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXHRcdFxuXHRcdC8vIEluaXRpYWxpemUgQUkgc2VydmljZVxuXHRcdHRoaXMuYWlTZXJ2aWNlID0gbmV3IEFJU2VydmljZSh0aGlzLnNldHRpbmdzKTtcblx0XHRzZXRBSVNlcnZpY2UodGhpcy5haVNlcnZpY2UpO1xuXHRcdFxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgU2V0dGluZ3NUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuXHRcdC8vIHRoaXMucmVnaXN0ZXJDb21tYW5kcygpO1xuXHRcdC8vIHRoaXMucmVnaXN0ZXJDYW52YXNFdmVudHMoKTtcblx0XHQvLyB0aGlzLnJlZ2lzdGVyQ3VzdG9tSWNvbnMoKTtcblxuXHRcdC8vIHRoaXMucGF0Y2hDYW52YXMoKTtcblx0XHR0aGlzLmFwcC53b3Jrc3BhY2Uub25MYXlvdXRSZWFkeSgoKSA9PiB7XG5cdFx0XHRpbml0TG9nRGVidWcodGhpcy5zZXR0aW5ncyk7XG5cblx0XHRcdHRoaXMucGF0Y2hDYW52YXNNZW51KCk7XG5cdFx0XHR0aGlzLmFkZENvbW1hbmRzKCk7XG5cdFx0XHR0aGlzLnBhdGNoTm90ZUNvbnRleHRNZW51KCk7XG5cblx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnN5c3RlbVByb21wdHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHRoaXMuZmV0Y2hTeXN0ZW1Qcm9tcHRzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Ly8gdGhpcy5wYXRjaENhbnZhc0ludGVyYWN0aW9uKCk7XG5cdFx0Ly8gdGhpcy5wYXRjaENhbnZhc05vZGUoKTtcblxuXHRcdC8vIGNvbnN0IGdlbmVyYXRvciA9IG5vdGVHZW5lcmF0b3IodGhpcy5hcHAsIHRoaXMuc2V0dGluZ3MsIHRoaXMubG9nRGVidWcpXG5cdFx0Ly8gY29uc3QgZ2VuZXJhdG9yID0gbm90ZUdlbmVyYXRvcih0aGlzLmFwcCk7XG5cblx0XHQvLyB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNldHRpbmdzVGFiKHRoaXMuYXBwLCB0aGlzKSlcblxuXHRcdC8vIHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0Ly8gXHRpZDogXCJuZXh0LW5vdGVcIixcblx0XHQvLyBcdG5hbWU6IFwiQ3JlYXRlIG5leHQgbm90ZVwiLFxuXHRcdC8vIFx0Y2FsbGJhY2s6ICgpID0+IHtcblx0XHQvLyBcdFx0Z2VuZXJhdG9yLm5leHROb3RlKCk7XG5cdFx0Ly8gXHR9LFxuXHRcdC8vIFx0aG90a2V5czogW1xuXHRcdC8vIFx0XHR7XG5cdFx0Ly8gXHRcdFx0bW9kaWZpZXJzOiBbXCJBbHRcIiwgXCJTaGlmdFwiXSxcblx0XHQvLyBcdFx0XHRrZXk6IFwiTlwiLFxuXHRcdC8vIFx0XHR9LFxuXHRcdC8vIFx0XSxcblx0XHQvLyB9KTtcblxuXHRcdC8vIHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0Ly8gXHRpZDogXCJnZW5lcmF0ZS1ub3RlXCIsXG5cdFx0Ly8gXHRuYW1lOiBcIkdlbmVyYXRlIEFJIG5vdGVcIixcblx0XHQvLyBcdGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0Ly8gXHRcdGdlbmVyYXRvci5nZW5lcmF0ZU5vdGUoKTtcblx0XHQvLyBcdH0sXG5cdFx0Ly8gXHRob3RrZXlzOiBbXG5cdFx0Ly8gXHRcdHtcblx0XHQvLyBcdFx0XHRtb2RpZmllcnM6IFtcIkFsdFwiLCBcIlNoaWZ0XCJdLFxuXHRcdC8vIFx0XHRcdGtleTogXCJHXCIsXG5cdFx0Ly8gXHRcdH0sXG5cdFx0Ly8gXHRdLFxuXHRcdC8vIH0pO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0Ly8gcmVmcmVzaEFsbENhbnZhc1ZpZXcodGhpcy5hcHApO1xuXHR9XG5cblx0YXN5bmMgbG9hZFNldHRpbmdzKCkge1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0e30sXG5cdFx0XHRERUZBVUxUX1NFVFRJTkdTLFxuXHRcdFx0YXdhaXQgdGhpcy5sb2FkRGF0YSgpXG5cdFx0KTtcblx0XHRcblx0XHQvLyBNaWdyYXRpb24gbG9naWMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcblx0XHR0aGlzLm1pZ3JhdGVTZXR0aW5ncygpO1xuXHR9XG5cblx0cHJpdmF0ZSBtaWdyYXRlU2V0dGluZ3MoKSB7XG5cdFx0Ly8gSWYgdXNlciBoYXMgb2xkIHNldHRpbmdzIHdpdGgganVzdCBhcGlLZXksIG1pZ3JhdGUgdG8gbmV3IHByb3ZpZGVyIHN0cnVjdHVyZVxuXHRcdGlmICh0aGlzLnNldHRpbmdzLmFwaUtleSAmJiAhdGhpcy5zZXR0aW5ncy5wcm92aWRlcnMub3BlbmFpLmNvbmZpZy5hcGlLZXkpIHtcblx0XHRcdHRoaXMuc2V0dGluZ3MucHJvdmlkZXJzLm9wZW5haS5jb25maWcuYXBpS2V5ID0gdGhpcy5zZXR0aW5ncy5hcGlLZXk7XG5cdFx0fVxuXG5cdFx0Ly8gRW5zdXJlIGN1cnJlbnRQcm92aWRlciBpcyBzZXRcblx0XHRpZiAoIXRoaXMuc2V0dGluZ3MuY3VycmVudFByb3ZpZGVyKSB7XG5cdFx0XHR0aGlzLnNldHRpbmdzLmN1cnJlbnRQcm92aWRlciA9IFwib3BlbmFpXCI7XG5cdFx0fVxuXG5cdFx0Ly8gRW5zdXJlIHByb3ZpZGVycyBzdHJ1Y3R1cmUgZXhpc3RzXG5cdFx0aWYgKCF0aGlzLnNldHRpbmdzLnByb3ZpZGVycykge1xuXHRcdFx0dGhpcy5zZXR0aW5ncy5wcm92aWRlcnMgPSBERUZBVUxUX1NFVFRJTkdTLnByb3ZpZGVycztcblx0XHR9XG5cblx0XHQvLyBNaWdyYXRlIGFueSBtaXNzaW5nIHByb3ZpZGVyIHN0cnVjdHVyZXNcblx0XHRPYmplY3Qua2V5cyhERUZBVUxUX1NFVFRJTkdTLnByb3ZpZGVycykuZm9yRWFjaChwcm92aWRlclR5cGUgPT4ge1xuXHRcdFx0aWYgKCF0aGlzLnNldHRpbmdzLnByb3ZpZGVyc1twcm92aWRlclR5cGUgYXMgUHJvdmlkZXJUeXBlXSkge1xuXHRcdFx0XHR0aGlzLnNldHRpbmdzLnByb3ZpZGVyc1twcm92aWRlclR5cGUgYXMgUHJvdmlkZXJUeXBlXSA9IFxuXHRcdFx0XHRcdERFRkFVTFRfU0VUVElOR1MucHJvdmlkZXJzW3Byb3ZpZGVyVHlwZSBhcyBQcm92aWRlclR5cGVdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cGF0Y2hDYW52YXNNZW51KCkge1xuXHRcdGNvbnN0IGFwcCA9IHRoaXMuYXBwO1xuXHRcdGNvbnN0IHNldHRpbmdzID0gdGhpcy5zZXR0aW5ncztcblxuXHRcdGNvbnN0IHBhdGNoTWVudSA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNhbnZhc1ZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2Vcblx0XHRcdFx0LmdldExlYXZlc09mVHlwZShcImNhbnZhc1wiKVxuXHRcdFx0XHQuZmlyc3QoKT8udmlldztcblx0XHRcdGlmICghY2FudmFzVmlldykgcmV0dXJuIGZhbHNlO1xuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhcImNhbnZhc1ZpZXdcIiwgY2FudmFzVmlldyk7XG5cdFx0XHQvLyBUT0RPOiBjaGVjayBpZiB0aGlzIGlzIHdvcmtpbmcgKG5vdCB3b3JraW5nIGluIG15IHZhdWx0LCBidXQgd29ya3MgaW4gdGhlIHNhbXBsZSB2YXVsdCAobm8gLmNhbnZhcyAuLi4pKVxuXHRcdFx0Y29uc3QgbWVudSA9IChjYW52YXNWaWV3IGFzIENhbnZhc1ZpZXcpPy5jYW52YXM/Lm1lbnU7XG5cdFx0XHRpZiAoIW1lbnUpIHJldHVybiBmYWxzZTtcblxuXHRcdFx0Y29uc3Qgc2VsZWN0aW9uID0gbWVudS5zZWxlY3Rpb247XG5cdFx0XHRpZiAoIXNlbGVjdGlvbikgcmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRjb25zdCBtZW51VW5pbnN0YWxsZXIgPSBhcm91bmQobWVudS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHtcblx0XHRcdFx0cmVuZGVyOiAobmV4dDogYW55KSA9PlxuXHRcdFx0XHRcdGZ1bmN0aW9uICguLi5hcmdzOiBhbnkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IG5leHQuY2FsbCh0aGlzLCAuLi5hcmdzKTtcblxuXHRcdFx0XHRcdFx0Ly8gKiBJZiBtdWx0aSBzZWxlY3Rpb25cblx0XHRcdFx0XHRcdGNvbnN0IG1heWJlQ2FudmFzVmlldyA9XG5cdFx0XHRcdFx0XHRcdGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShcblx0XHRcdFx0XHRcdFx0XHRJdGVtVmlld1xuXHRcdFx0XHRcdFx0XHQpIGFzIENhbnZhc1ZpZXcgfCBudWxsO1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQhbWF5YmVDYW52YXNWaWV3IHx8XG5cdFx0XHRcdFx0XHRcdG1heWJlQ2FudmFzVmlldy5jYW52YXM/LnNlbGVjdGlvbj8uc2l6ZSAhPT0gMVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXG5cdFx0XHRcdFx0XHQvLyAvLyAqIElmIGdyb3VwXG5cdFx0XHRcdFx0XHQvLyBpZiAobm9kZS51bmtub3duRGF0YS50eXBlID09PSBcImdyb3VwXCIpIHJldHVybiByZXN1bHQ7XG5cblx0XHRcdFx0XHRcdGlmICh0aGlzLm1lbnVFbC5xdWVyeVNlbGVjdG9yKFwiLmdwdC1tZW51LWl0ZW1cIikpXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cblx0XHRcdFx0XHRcdC8vICogSWYgRWRnZVxuXHRcdFx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWROb2RlID0gQXJyYXkuZnJvbShcblx0XHRcdFx0XHRcdFx0bWF5YmVDYW52YXNWaWV3LmNhbnZhcz8uc2VsZWN0aW9uXG5cdFx0XHRcdFx0XHQpWzBdO1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGVkTm9kZS5mcm9tXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0aWYgKCFzZWxlY3RlZE5vZGUudW5rbm93bkRhdGEuaXNHZW5lcmF0ZWQpIHJldHVybjtcblx0XHRcdFx0XHRcdFx0YWRkUmVnZW5lcmF0ZVJlc3BvbnNlKGFwcCwgc2V0dGluZ3MsIHRoaXMubWVudUVsKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vICogSGFuZGxlcyBcIkNhbGwgR1BUXCIgYnV0dG9uXG5cblx0XHRcdFx0XHRcdFx0YWRkQXNrQUlCdXR0b24oYXBwLCBzZXR0aW5ncywgdGhpcy5tZW51RWwpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIGNvbnN0IG5vZGUgPSA8Q2FudmFzTm9kZT4oXG5cdFx0XHRcdFx0XHRcdC8vIFx0QXJyYXkuZnJvbSh0aGlzLmNhbnZhcy5zZWxlY3Rpb24pPy5maXJzdCgpXG5cdFx0XHRcdFx0XHRcdC8vICk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gaWYgKCFub2RlPy51bmtub3duRGF0YS5xdWVzdGlvbnM/Lmxlbmd0aCkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0XHRcdC8vICogSGFuZGxlcyBcIkFzayBRdWVzdGlvblwiIGJ1dHRvblxuXHRcdFx0XHRcdFx0XHQvLyBUT0RPOiByZWZhY3RvciAoYXMgYWJvdmUpXG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgYnV0dG9uRWxfQXNrUXVlc3Rpb24gPSBjcmVhdGVFbChcblx0XHRcdFx0XHRcdFx0XHRcImJ1dHRvblwiLFxuXHRcdFx0XHRcdFx0XHRcdFwiY2xpY2thYmxlLWljb24gZ3B0LW1lbnUtaXRlbVwiXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdHNldFRvb2x0aXAoXG5cdFx0XHRcdFx0XHRcdFx0YnV0dG9uRWxfQXNrUXVlc3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0XCJBc2sgcXVlc3Rpb24gd2l0aCBBSVwiLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHBsYWNlbWVudDogXCJ0b3BcIixcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdHNldEljb24oYnV0dG9uRWxfQXNrUXVlc3Rpb24sIFwibHVjaWRlLWhlbHAtY2lyY2xlXCIpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1lbnVFbC5hcHBlbmRDaGlsZChidXR0b25FbF9Bc2tRdWVzdGlvbik7XG5cdFx0XHRcdFx0XHRcdGJ1dHRvbkVsX0Fza1F1ZXN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdFx0XHRcdFx0XCJjbGlja1wiLFxuXHRcdFx0XHRcdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdGxldCBtb2RhbCA9IG5ldyBDdXN0b21RdWVzdGlvbk1vZGFsKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhcHAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdChxdWVzdGlvbjI6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGhhbmRsZUNhbGxHUFRfUXVlc3Rpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhcHAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzZXR0aW5ncyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxDYW52YXNOb2RlPihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QXJyYXkuZnJvbShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmNhbnZhcy5zZWxlY3Rpb25cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KT8uZmlyc3QoKSFcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRxdWVzdGlvbjJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEhhbmRsZSB0aGUgaW5wdXRcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdG1vZGFsLm9wZW4oKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gKiBIYW5kbGVzIFwiQUkgUXVlc3Rpb25zXCIgYnV0dG9uXG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgYnV0dG9uRWxfQUlRdWVzdGlvbnMgPSBjcmVhdGVFbChcblx0XHRcdFx0XHRcdFx0XHRcImJ1dHRvblwiLFxuXHRcdFx0XHRcdFx0XHRcdFwiY2xpY2thYmxlLWljb24gZ3B0LW1lbnUtaXRlbVwiXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdHNldFRvb2x0aXAoXG5cdFx0XHRcdFx0XHRcdFx0YnV0dG9uRWxfQUlRdWVzdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0XCJBSSBnZW5lcmF0ZWQgcXVlc3Rpb25zXCIsXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxhY2VtZW50OiBcInRvcFwiLFxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0c2V0SWNvbihcblx0XHRcdFx0XHRcdFx0XHRidXR0b25FbF9BSVF1ZXN0aW9ucyxcblx0XHRcdFx0XHRcdFx0XHRcImx1Y2lkZS1maWxlLXF1ZXN0aW9uXCJcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0dGhpcy5tZW51RWwuYXBwZW5kQ2hpbGQoYnV0dG9uRWxfQUlRdWVzdGlvbnMpO1xuXHRcdFx0XHRcdFx0XHRidXR0b25FbF9BSVF1ZXN0aW9ucy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRoYW5kbGVQYXRjaE5vdGVNZW51KFxuXHRcdFx0XHRcdFx0XHRcdFx0YnV0dG9uRWxfQUlRdWVzdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLm1lbnVFbCxcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXBwLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzZXR0aW5ncyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FudmFzOiB0aGlzLmNhbnZhcyxcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5yZWdpc3RlcihtZW51VW5pbnN0YWxsZXIpO1xuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLnRyaWdnZXIoXCJjb2xsYXBzZS1ub2RlOnBhdGNoZWQtY2FudmFzXCIpO1xuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4ge1xuXHRcdFx0aWYgKCFwYXRjaE1lbnUoKSkge1xuXHRcdFx0XHRjb25zdCBldnQgPSB0aGlzLmFwcC53b3Jrc3BhY2Uub24oXCJsYXlvdXQtY2hhbmdlXCIsICgpID0+IHtcblx0XHRcdFx0XHRwYXRjaE1lbnUoKSAmJiB0aGlzLmFwcC53b3Jrc3BhY2Uub2ZmcmVmKGV2dCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyRXZlbnQoZXZ0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGFzeW5jIGZldGNoU3lzdGVtUHJvbXB0cygpIHtcblx0XHQvLyBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuXHRcdC8vIFx0XCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZi9hd2Vzb21lLWNoYXRncHQtcHJvbXB0cy9tYWluL3Byb21wdHMuY3N2XCJcblx0XHQvLyApO1xuXHRcdC8vIGNvbnN0IHRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG5cdFx0Y29uc3QgcGFyc2VkQ3N2ID0gcGFyc2VDc3YocHJvbXB0c0NzdlRleHQpO1xuXHRcdC8vIGNvbnNvbGUubG9nKHsgcGFyc2VkQ3N2IH0pO1xuXG5cdFx0Y29uc3Qgc3lzdGVtUHJvbXB0czogU3lzdGVtUHJvbXB0W10gPSBwYXJzZWRDc3Zcblx0XHRcdC5zbGljZSgxKVxuXHRcdFx0Lm1hcCgodmFsdWU6IHN0cmluZ1tdLCBpbmRleDogbnVtYmVyKSA9PiAoe1xuXHRcdFx0XHRpZDogaW5kZXgsXG5cdFx0XHRcdGFjdDogdmFsdWVbMF0sXG5cdFx0XHRcdHByb21wdDogdmFsdWVbMV0sXG5cdFx0XHR9KSk7XG5cdFx0Ly8gY29uc29sZS5sb2coeyBzeXN0ZW1Qcm9tcHRzIH0pO1xuXG5cdFx0dGhpcy5zZXR0aW5ncy5zeXN0ZW1Qcm9tcHRzID0gc3lzdGVtUHJvbXB0cztcblxuXHRcdHRoaXMuc2F2ZVNldHRpbmdzKCk7XG5cdH1cblxuXHRwYXRjaE5vdGVDb250ZXh0TWVudSgpIHtcblx0XHRjb25zdCBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3M7XG5cdFx0Ly8gKiBubyBldmVudCBuYW1lIHRvIGFkZCB0byBDYW52YXMgY29udGV4dCBtZW51IChcImNhbnZhcy1tZW51XCIgZG9lcyBub3QgZXhpc3QpXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKFwiY2FudmFzOm5vZGUtbWVudVwiLCAobWVudSkgPT4ge1xuXHRcdFx0XHRtZW51LmFkZFNlcGFyYXRvcigpO1xuXHRcdFx0XHRtZW51LmFkZEl0ZW0oKGl0ZW0pID0+IHtcblx0XHRcdFx0XHRpdGVtLnNldFRpdGxlKFwiQ3JlYXRlIGZsYXNoY2FyZHNcIilcblx0XHRcdFx0XHRcdC5zZXRJY29uKFwibHVjaWRlLXdhbGxldC1jYXJkc1wiKVxuXHRcdFx0XHRcdFx0Lm9uQ2xpY2soKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRjcmVhdGVGbGFzaGNhcmRzKHRoaXMuYXBwLCBzZXR0aW5ncyk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG1lbnUuYWRkSXRlbSgoaXRlbSkgPT4ge1xuXHRcdFx0XHRcdGl0ZW0uc2V0VGl0bGUoXCJHZW5lcmF0ZSBpbWFnZVwiKVxuXHRcdFx0XHRcdFx0LnNldEljb24oXCJsdWNpZGUtaW1hZ2VcIilcblx0XHRcdFx0XHRcdC5vbkNsaWNrKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0aGFuZGxlR2VuZXJhdGVJbWFnZSh0aGlzLmFwcCwgc2V0dGluZ3MpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9XG5cblx0YWRkQ29tbWFuZHMoKSB7XG5cdFx0Y29uc3QgYXBwID0gdGhpcy5hcHA7XG5cblx0XHQvLyAqIFdlYnNpdGUgdG8gTURcblx0XHQvLyB0aGlzLmFkZENvbW1hbmQoe1xuXHRcdC8vIFx0aWQ6IFwiaW5zZXJ0LXdlYnNpdGUtY29udGVudFwiLFxuXHRcdC8vIFx0bmFtZTogXCJJbnNlcnQgdGhlIGNvbnRlbnQgb2YgYSB3ZWJzaXRlIGFzIG1hcmtkb3duXCIsXG5cdFx0Ly8gXHRjaGVja0NhbGxiYWNrOiAoY2hlY2tpbmc6IGJvb2xlYW4pID0+IHtcblx0XHQvLyBcdFx0aWYgKGNoZWNraW5nKSB7XG5cdFx0Ly8gXHRcdFx0Ly8gY29uc29sZS5sb2coeyBjaGVja0NhbGxiYWNrOiBjaGVja2luZyB9KTtcblx0XHQvLyBcdFx0XHRpZiAoIWdldEFjdGl2ZUNhbnZhcyhhcHApKSByZXR1cm4gZmFsc2U7XG5cblx0XHQvLyBcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHQvLyBcdFx0fVxuXG5cdFx0Ly8gXHRcdG5ldyBJbnB1dE1vZGFsKFxuXHRcdC8vIFx0XHRcdGFwcCxcblx0XHQvLyBcdFx0XHR7XG5cdFx0Ly8gXHRcdFx0XHRsYWJlbDogXCJFbnRlciBhIHdlYnNpdGUgdXJsXCIsXG5cdFx0Ly8gXHRcdFx0XHRidXR0b25MYWJlbDogXCJHZXQgd2Vic2l0ZSBjb250ZW50XCIsXG5cdFx0Ly8gXHRcdFx0fSxcblx0XHQvLyBcdFx0XHQodmlkZW9Vcmw6IHN0cmluZykgPT4ge1xuXHRcdC8vIFx0XHRcdFx0bmV3IE5vdGljZShgU2NyYXBpbmcgd2Vic2l0ZSBjb250ZW50YCk7XG5cblx0XHQvLyBcdFx0XHRcdGluc2VydFdlYnNpdGVDb250ZW50KGFwcCwgdGhpcy5zZXR0aW5ncywgdmlkZW9VcmwpO1xuXHRcdC8vIFx0XHRcdH1cblx0XHQvLyBcdFx0KS5vcGVuKCk7XG5cdFx0Ly8gXHR9LFxuXHRcdC8vIFx0Ly8gY2FsbGJhY2s6ICgpID0+IHt9LFxuXHRcdC8vIH0pO1xuXG5cdFx0Ly8gKiBZb3V0dWJlIGNhcHRpb25zXG5cdFx0Ly8gdGhpcy5hZGRDb21tYW5kKHtcblx0XHQvLyBcdGlkOiBcImluc2VydC15b3V0dWJlLWNhcHRpb25cIixcblx0XHQvLyBcdG5hbWU6IFwiSW5zZXJ0IGNhcHRpb25zIG9mIGEgWW91dHViZSB2aWRlb1wiLFxuXHRcdC8vIFx0Y2hlY2tDYWxsYmFjazogKGNoZWNraW5nOiBib29sZWFuKSA9PiB7XG5cdFx0Ly8gXHRcdGlmIChjaGVja2luZykge1xuXHRcdC8vIFx0XHRcdC8vIGNvbnNvbGUubG9nKHsgY2hlY2tDYWxsYmFjazogY2hlY2tpbmcgfSk7XG5cdFx0Ly8gXHRcdFx0aWYgKCFnZXRBY3RpdmVDYW52YXMoYXBwKSkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Ly8gXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0Ly8gXHRcdH1cblxuXHRcdC8vIFx0XHRuZXcgSW5wdXRNb2RhbChcblx0XHQvLyBcdFx0XHRhcHAsXG5cdFx0Ly8gXHRcdFx0e1xuXHRcdC8vIFx0XHRcdFx0bGFiZWw6IFwiRW50ZXIgYSB5b3V0dWJlIHVybFwiLFxuXHRcdC8vIFx0XHRcdFx0YnV0dG9uTGFiZWw6IFwiU2NyYXBlIGNhcHRpb25zXCIsXG5cdFx0Ly8gXHRcdFx0fSxcblx0XHQvLyBcdFx0XHQodmlkZW9Vcmw6IHN0cmluZykgPT4ge1xuXHRcdC8vIFx0XHRcdFx0bmV3IE5vdGljZShgU2NyYXBpbmcgY2FwdGlvbnMgb2YgeW91dHViZSB2aWRlb2ApO1xuXG5cdFx0Ly8gXHRcdFx0XHRydW5Zb3V0dWJlQ2FwdGlvbnMoYXBwLCB0aGlzLnNldHRpbmdzLCB2aWRlb1VybCk7XG5cdFx0Ly8gXHRcdFx0fVxuXHRcdC8vIFx0XHQpLm9wZW4oKTtcblx0XHQvLyBcdH0sXG5cdFx0Ly8gXHQvLyBjYWxsYmFjazogKCkgPT4ge30sXG5cdFx0Ly8gfSk7XG5cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6IFwicnVuLXByb21wdC1mb2xkZXJcIixcblx0XHRcdG5hbWU6IFwiUnVuIGEgc3lzdGVtIHByb21wdCBvbiBhIGZvbGRlclwiLFxuXHRcdFx0Y2hlY2tDYWxsYmFjazogKGNoZWNraW5nOiBib29sZWFuKSA9PiB7XG5cdFx0XHRcdGlmIChjaGVja2luZykge1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHsgY2hlY2tDYWxsYmFjazogY2hlY2tpbmcgfSk7XG5cdFx0XHRcdFx0aWYgKCFnZXRBY3RpdmVDYW52YXMoYXBwKSkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRuZXcgU3lzdGVtUHJvbXB0c01vZGFsKFxuXHRcdFx0XHRcdGFwcCxcblx0XHRcdFx0XHR0aGlzLnNldHRpbmdzLFxuXHRcdFx0XHRcdChzeXN0ZW1Qcm9tcHQ6IFN5c3RlbVByb21wdCkgPT4ge1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZShcblx0XHRcdFx0XHRcdFx0YFNlbGVjdGVkIHN5c3RlbSBwcm9tcHQgJHtzeXN0ZW1Qcm9tcHQuYWN0fWBcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdG5ldyBGb2xkZXJTdWdnZXN0TW9kYWwoYXBwLCAoZm9sZGVyOiBURm9sZGVyKSA9PiB7XG5cdFx0XHRcdFx0XHRcdC8vIG5ldyBOb3RpY2UoYFNlbGVjdGVkIGZvbGRlciAke2ZvbGRlci5wYXRofWApO1xuXHRcdFx0XHRcdFx0XHRydW5Qcm9tcHRGb2xkZXIoXG5cdFx0XHRcdFx0XHRcdFx0YXBwLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MsXG5cdFx0XHRcdFx0XHRcdFx0c3lzdGVtUHJvbXB0LFxuXHRcdFx0XHRcdFx0XHRcdGZvbGRlclxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSkub3BlbigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly8gY2FsbGJhY2s6ICgpID0+IHt9LFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcImluc2VydC1zeXN0ZW0tcHJvbXB0XCIsXG5cdFx0XHRuYW1lOiBcIkluc2VydCBzeXN0ZW0gcHJvbXB0XCIsXG5cdFx0XHRjaGVja0NhbGxiYWNrOiAoY2hlY2tpbmc6IGJvb2xlYW4pID0+IHtcblx0XHRcdFx0aWYgKGNoZWNraW5nKSB7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coeyBjaGVja0NhbGxiYWNrOiBjaGVja2luZyB9KTtcblx0XHRcdFx0XHRpZiAoIWdldEFjdGl2ZUNhbnZhcyhhcHApKSByZXR1cm4gZmFsc2U7XG5cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG5ldyBTeXN0ZW1Qcm9tcHRzTW9kYWwoXG5cdFx0XHRcdFx0YXBwLFxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MsXG5cdFx0XHRcdFx0KHN5c3RlbVByb21wdDogU3lzdGVtUHJvbXB0KSA9PlxuXHRcdFx0XHRcdFx0aW5zZXJ0U3lzdGVtUHJvbXB0KGFwcCwgc3lzdGVtUHJvbXB0KVxuXHRcdFx0XHQpLm9wZW4oKTtcblx0XHRcdH0sXG5cdFx0XHQvLyBjYWxsYmFjazogKCkgPT4ge30sXG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6IFwiaW5zZXJ0LXJlbGV2YW50LXF1ZXN0aW9uc1wiLFxuXHRcdFx0bmFtZTogXCJJbnNlcnQgcmVsZXZhbnQgcXVlc3Rpb25zXCIsXG5cdFx0XHRjaGVja0NhbGxiYWNrOiAoY2hlY2tpbmc6IGJvb2xlYW4pID0+IHtcblx0XHRcdFx0aWYgKGNoZWNraW5nKSB7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coeyBjaGVja0NhbGxiYWNrOiBjaGVja2luZyB9KTtcblx0XHRcdFx0XHRpZiAoIWdldEFjdGl2ZUNhbnZhcyhhcHApKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBuZXcgU3lzdGVtUHJvbXB0c01vZGFsKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzKS5vcGVuKCk7XG5cdFx0XHRcdGhhbmRsZUFkZFJlbGV2YW50UXVlc3Rpb25zKGFwcCwgdGhpcy5zZXR0aW5ncyk7XG5cdFx0XHR9LFxuXHRcdFx0Ly8gY2FsbGJhY2s6IGFzeW5jICgpID0+IHt9LFxuXHRcdH0pO1xuXHR9XG5cblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG5cdFx0Ly8gVXBkYXRlIEFJIHNlcnZpY2Ugd2l0aCBuZXcgc2V0dGluZ3Ncblx0XHRpZiAodGhpcy5haVNlcnZpY2UpIHtcblx0XHRcdHRoaXMuYWlTZXJ2aWNlLnVwZGF0ZVNldHRpbmdzKHRoaXMuc2V0dGluZ3MpO1xuXHRcdH1cblx0fVxufVxuIl19