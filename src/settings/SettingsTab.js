import { __awaiter } from "tslib";
import { ButtonComponent, Notice, PluginSettingTab, Setting, TextAreaComponent, TextComponent, } from "obsidian";
import { getImageModels, getModels, } from "./AugmentedCanvasSettings";
import { initLogDebug } from "src/logDebug";
import { PROVIDERS, getProviderInfo } from "src/providers";
export class SettingsTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        // Provider Selection
        new Setting(containerEl)
            .setName("AI Provider")
            .setDesc("Select the AI provider to use.")
            .addDropdown((cb) => {
            Object.values(PROVIDERS).forEach((provider) => {
                cb.addOption(provider.id, provider.name);
            });
            cb.setValue(this.plugin.settings.currentProvider);
            cb.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.currentProvider = value;
                yield this.plugin.saveSettings();
                this.display(); // Refresh the settings display
            }));
        });
        // Provider Configuration
        this.displayProviderConfig();
        // Model Selection
        this.displayModelSelection();
        new Setting(containerEl)
            .setName("Youtube API key")
            .setDesc("The Youtube API key used to fetch captions")
            .addText((text) => {
            text.inputEl.type = "password";
            text.setPlaceholder("API Key")
                .setValue(this.plugin.settings.youtubeApiKey)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.youtubeApiKey = value;
                yield this.plugin.saveSettings();
            }));
        });
        new Setting(containerEl)
            .setName("Default system prompt")
            .setDesc(`The system prompt sent with each request to the API. \n(Note: you can override this by beginning a note stream with a note starting 'SYSTEM PROMPT'. The remaining content of that note will be used as system prompt.)`)
            .addTextArea((component) => {
            component.inputEl.rows = 6;
            // component.inputEl.style.width = "300px";
            // component.inputEl.style.fontSize = "10px";
            component.inputEl.addClass("augmented-canvas-settings-prompt");
            component.setValue(this.plugin.settings.systemPrompt);
            component.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.systemPrompt = value;
                yield this.plugin.saveSettings();
            }));
        });
        this.displaySystemPromptsSettings(containerEl);
        new Setting(containerEl)
            .setName("Flashcards system prompt")
            .setDesc(`The system prompt used to generate the flashcards file.`)
            .addTextArea((component) => {
            component.inputEl.rows = 6;
            // component.inputEl.style.width = "300px";
            // component.inputEl.style.fontSize = "10px";
            component.inputEl.addClass("augmented-canvas-settings-prompt");
            component.setValue(this.plugin.settings.flashcardsSystemPrompt);
            component.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.flashcardsSystemPrompt = value;
                yield this.plugin.saveSettings();
            }));
        });
        new Setting(containerEl)
            .setName("Relevant questions system prompt")
            .setDesc(`The system prompt used to generate relevant questions for the command "Insert relevant questions".`)
            .addTextArea((component) => {
            component.inputEl.rows = 6;
            // component.inputEl.style.width = "300px";
            // component.inputEl.style.fontSize = "10px";
            component.inputEl.addClass("augmented-canvas-settings-prompt");
            component.setValue(this.plugin.settings.relevantQuestionsSystemPrompt);
            component.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.relevantQuestionsSystemPrompt = value;
                yield this.plugin.saveSettings();
            }));
        });
        new Setting(containerEl)
            .setName("Insert relevant questions files count")
            .setDesc('The number of files that are taken into account by the "Insert relevant questions" command.')
            .addText((text) => text
            .setValue(this.plugin.settings.insertRelevantQuestionsFilesCount.toString())
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
                this.plugin.settings.insertRelevantQuestionsFilesCount =
                    parsed;
                yield this.plugin.saveSettings();
            }
        })));
        new Setting(containerEl)
            .setName("Max input tokens")
            .setDesc("The maximum number of tokens to send (within model limit). 0 means as many as possible")
            .addText((text) => text
            .setValue(this.plugin.settings.maxInputTokens.toString())
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
                this.plugin.settings.maxInputTokens = parsed;
                yield this.plugin.saveSettings();
            }
        })));
        new Setting(containerEl)
            .setName("Max response tokens")
            .setDesc("The maximum number of tokens to return from the API. 0 means no limit. (A token is about 4 characters).")
            .addText((text) => text
            .setValue(this.plugin.settings.maxResponseTokens.toString())
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
                this.plugin.settings.maxResponseTokens = parsed;
                yield this.plugin.saveSettings();
            }
        })));
        new Setting(containerEl)
            .setName("Max depth")
            .setDesc("The maximum depth of ancestor notes to include. 0 means no limit.")
            .addText((text) => text
            .setValue(this.plugin.settings.maxDepth.toString())
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
                this.plugin.settings.maxDepth = parsed;
                yield this.plugin.saveSettings();
            }
        })));
        new Setting(containerEl)
            .setName("Temperature")
            .setDesc("Sampling temperature (0-2). 0 means no randomness.")
            .addText((text) => text
            .setValue(this.plugin.settings.temperature.toString())
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            const parsed = parseFloat(value);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 2) {
                this.plugin.settings.temperature = parsed;
                yield this.plugin.saveSettings();
            }
        })));
        // new Setting(containerEl)
        // 	.setName("API URL")
        // 	.setDesc(
        // 		"The chat completions URL to use. You probably won't need to change this."
        // 	)
        // 	.addText((text) => {
        // 		text.inputEl.style.width = "300px";
        // 		text.setPlaceholder("API URL")
        // 			.setValue(this.plugin.settings.apiUrl)
        // 			.onChange(async (value) => {
        // 				this.plugin.settings.apiUrl = value;
        // 				await this.plugin.saveSettings();
        // 			});
        // 	});
        new Setting(containerEl)
            .setName("Debug output")
            .setDesc("Enable debug output in the console")
            .addToggle((component) => {
            component
                .setValue(this.plugin.settings.debug)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.debug = value;
                yield this.plugin.saveSettings();
                initLogDebug(this.plugin.settings);
            }));
        });
    }
    displaySystemPromptsSettings(containerEl) {
        const setting = new Setting(containerEl);
        setting
            .setName("Add system prompts")
            .setClass("augmented-canvas-setting-item")
            .setDesc(`Create new highlight colors by providing a color name and using the color picker to set the hex code value. Don't forget to save the color before exiting the color picker. Drag and drop the highlight color to change the order for your highlighter component.`);
        const nameInput = new TextComponent(setting.controlEl);
        nameInput.setPlaceholder("Name");
        // colorInput.inputEl.addClass("highlighter-settings-color");
        let promptInput;
        setting.addTextArea((component) => {
            component.inputEl.rows = 6;
            // component.inputEl.style.width = "300px";
            // component.inputEl.style.fontSize = "10px";
            component.setPlaceholder("Prompt");
            component.inputEl.addClass("augmented-canvas-settings-prompt");
            promptInput = component;
        });
        setting.addButton((button) => {
            button
                .setIcon("lucide-plus")
                .setTooltip("Add")
                .onClick((buttonEl) => __awaiter(this, void 0, void 0, function* () {
                let name = nameInput.inputEl.value;
                const prompt = promptInput.inputEl.value;
                // console.log({ name, prompt });
                if (!name || !prompt) {
                    name && !prompt
                        ? new Notice("Prompt missing")
                        : !name && prompt
                            ? new Notice("Name missing")
                            : new Notice("Values missing"); // else
                    return;
                }
                // * Handles multiple with the same name
                // if (
                // 	this.plugin.settings.systemPrompts.filter(
                // 		(systemPrompt: SystemPrompt) =>
                // 			systemPrompt.act === name
                // 	).length
                // ) {
                // 	name += " 2";
                // }
                // let count = 3;
                // while (
                // 	this.plugin.settings.systemPrompts.filter(
                // 		(systemPrompt: SystemPrompt) =>
                // 			systemPrompt.act === name
                // 	).length
                // ) {
                // 	name = name.slice(0, -2) + " " + count;
                // 	count++;
                // }
                if (!this.plugin.settings.systemPrompts.filter((systemPrompt) => systemPrompt.act === name).length &&
                    !this.plugin.settings.userSystemPrompts.filter((systemPrompt) => systemPrompt.act === name).length) {
                    this.plugin.settings.userSystemPrompts.push({
                        id: this.plugin.settings.systemPrompts.length +
                            this.plugin.settings.userSystemPrompts.length,
                        act: name,
                        prompt,
                    });
                    yield this.plugin.saveSettings();
                    this.display();
                }
                else {
                    buttonEl.stopImmediatePropagation();
                    new Notice("This system prompt name already exists");
                }
            }));
        });
        const listContainer = containerEl.createEl("div", {
            cls: "augmented-canvas-list-container",
        });
        this.plugin.settings.userSystemPrompts.forEach((systemPrompt) => {
            const listElement = listContainer.createEl("div", {
                cls: "augmented-canvas-list-element",
            });
            const nameInput = new TextComponent(listElement);
            nameInput.setValue(systemPrompt.act);
            const promptInput = new TextAreaComponent(listElement);
            promptInput.inputEl.addClass("augmented-canvas-settings-prompt");
            promptInput.setValue(systemPrompt.prompt);
            const buttonSave = new ButtonComponent(listElement);
            buttonSave
                .setIcon("lucide-save")
                .setTooltip("Save")
                .onClick((buttonEl) => __awaiter(this, void 0, void 0, function* () {
                let name = nameInput.inputEl.value;
                const prompt = promptInput.inputEl.value;
                // console.log({ name, prompt });
                this.plugin.settings.userSystemPrompts =
                    this.plugin.settings.userSystemPrompts.map((systemPrompt2) => systemPrompt2.id === systemPrompt.id
                        ? Object.assign(Object.assign({}, systemPrompt2), { act: name, prompt }) : systemPrompt2);
                yield this.plugin.saveSettings();
                this.display();
                new Notice("System prompt updated");
            }));
            const buttonDelete = new ButtonComponent(listElement);
            buttonDelete
                .setIcon("lucide-trash")
                .setTooltip("Delete")
                .onClick((buttonEl) => __awaiter(this, void 0, void 0, function* () {
                let name = nameInput.inputEl.value;
                const prompt = promptInput.inputEl.value;
                // console.log({ name, prompt });
                this.plugin.settings.userSystemPrompts =
                    this.plugin.settings.userSystemPrompts.filter((systemPrompt2) => systemPrompt2.id !== systemPrompt.id);
                yield this.plugin.saveSettings();
                this.display();
                new Notice("System prompt deleted");
            }));
        });
    }
    displayProviderConfig() {
        const { containerEl } = this;
        const currentProvider = this.plugin.settings.currentProvider;
        const providerInfo = getProviderInfo(currentProvider);
        const currentConfig = this.plugin.settings.providers[currentProvider];
        // Provider configuration section
        const providerSection = containerEl.createEl("div", {
            cls: "setting-item-heading",
        });
        providerSection.textContent = `${providerInfo.name} Configuration`;
        // Add refresh models button
        new Setting(containerEl)
            .setName("Refresh Models")
            .setDesc("Fetch the latest available models from the provider")
            .addButton((button) => {
            button
                .setButtonText("Refresh")
                .onClick(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.plugin.aiService.refreshModels(currentProvider);
                    new Notice("Models refreshed successfully");
                    this.display();
                }
                catch (error) {
                    new Notice(`Failed to refresh models: ${error.message}`);
                }
            }));
        });
        // Add configuration fields for the current provider
        providerInfo.configFields.forEach((field) => {
            const setting = new Setting(containerEl)
                .setName(field.label)
                .setDesc(`${field.required ? "Required" : "Optional"}`);
            if (field.type === "password") {
                setting.addText((text) => {
                    text.inputEl.type = "password";
                    text.setPlaceholder(field.placeholder || "");
                    text.setValue(currentConfig.config[field.key] || "");
                    text.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                        currentConfig.config[field.key] = value;
                        yield this.plugin.saveSettings();
                    }));
                });
            }
            else if (field.type === "url") {
                setting.addText((text) => {
                    text.setPlaceholder(field.placeholder || "");
                    text.setValue(currentConfig.config[field.key] || "");
                    text.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                        currentConfig.config[field.key] = value;
                        yield this.plugin.saveSettings();
                    }));
                });
            }
            else {
                setting.addText((text) => {
                    text.setPlaceholder(field.placeholder || "");
                    text.setValue(currentConfig.config[field.key] || "");
                    text.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                        currentConfig.config[field.key] = value;
                        yield this.plugin.saveSettings();
                    }));
                });
            }
        });
    }
    displayModelSelection() {
        const { containerEl } = this;
        const currentProvider = this.plugin.settings.currentProvider;
        const providerInfo = getProviderInfo(currentProvider);
        const availableModels = this.plugin.aiService.getAvailableModels();
        // Chat Model Selection
        new Setting(containerEl)
            .setName("Chat Model")
            .setDesc("Select the model to use for text generation.")
            .addDropdown((cb) => {
            if (availableModels.length > 0) {
                availableModels.forEach((model) => {
                    cb.addOption(model.id, model.name);
                });
                cb.setValue(this.plugin.settings.apiModel);
            }
            else {
                // Fallback to legacy models for backward compatibility
                getModels().forEach((model) => {
                    cb.addOption(model, model);
                });
                cb.setValue(this.plugin.settings.apiModel);
            }
            cb.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.apiModel = value;
                yield this.plugin.saveSettings();
            }));
        });
        // Image Model Selection (only for providers that support it)
        if (providerInfo.supportsImageGeneration) {
            new Setting(containerEl)
                .setName("Image Model")
                .setDesc("Select the model to generate images.")
                .addDropdown((cb) => {
                getImageModels().forEach((model) => {
                    cb.addOption(model, model);
                });
                cb.setValue(this.plugin.settings.imageModel);
                cb.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.imageModel = value;
                    yield this.plugin.saveSettings();
                }));
            });
        }
    }
}
export default SettingsTab;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3NUYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR0aW5nc1RhYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUVOLGVBQWUsRUFDZixNQUFNLEVBQ04sZ0JBQWdCLEVBQ2hCLE9BQU8sRUFDUCxpQkFBaUIsRUFDakIsYUFBYSxHQUNiLE1BQU0sVUFBVSxDQUFDO0FBRWxCLE9BQU8sRUFFTixjQUFjLEVBQ2QsU0FBUyxHQUNULE1BQU0sMkJBQTJCLENBQUM7QUFDbkMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM1QyxPQUFPLEVBQUUsU0FBUyxFQUFnQixlQUFlLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekUsTUFBTSxPQUFPLFdBQVksU0FBUSxnQkFBZ0I7SUFHaEQsWUFBWSxHQUFRLEVBQUUsTUFBd0I7UUFDN0MsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBRUQsT0FBTztRQUNOLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFN0IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXBCLHFCQUFxQjtRQUNyQixJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLGFBQWEsQ0FBQzthQUN0QixPQUFPLENBQUMsZ0NBQWdDLENBQUM7YUFDekMsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDbkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0MsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxRQUFRLENBQUMs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LEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVKLDZEQUE2RDtRQUM3RCxJQUFJLFlBQVksQ0FBQyx1QkFBdUIsRUFBRTtZQUN6QyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3RCLE9BQU8sQ0FBQyxhQUFhLENBQUM7aUJBQ3RCLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQztpQkFDL0MsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7Z0JBQ25CLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUNsQyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDN0MsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO29CQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUN4QyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0YsQ0FBQztDQUNEO0FBRUQsZUFBZSxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRBcHAsXG5cdEJ1dHRvbkNvbXBvbmVudCxcblx0Tm90aWNlLFxuXHRQbHVnaW5TZXR0aW5nVGFiLFxuXHRTZXR0aW5nLFxuXHRUZXh0QXJlYUNvbXBvbmVudCxcblx0VGV4dENvbXBvbmVudCxcbn0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgQ2hhdFN0cmVhbVBsdWdpbiBmcm9tIFwiLi8uLi9BdWdtZW50ZWRDYW52YXNQbHVnaW5cIjtcbmltcG9ydCB7XG5cdFN5c3RlbVByb21wdCxcblx0Z2V0SW1hZ2VNb2RlbHMsXG5cdGdldE1vZGVscyxcbn0gZnJvbSBcIi4vQXVnbWVudGVkQ2FudmFzU2V0dGluZ3NcIjtcbmltcG9ydCB7IGluaXRMb2dEZWJ1ZyB9IGZyb20gXCJzcmMvbG9nRGVidWdcIjtcbmltcG9ydCB7IFBST1ZJREVSUywgUHJvdmlkZXJUeXBlLCBnZXRQcm92aWRlckluZm8gfSBmcm9tIFwic3JjL3Byb3ZpZGVyc1wiO1xuXG5leHBvcnQgY2xhc3MgU2V0dGluZ3NUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcblx0cGx1Z2luOiBDaGF0U3RyZWFtUGx1Z2luO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IENoYXRTdHJlYW1QbHVnaW4pIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH1cblxuXHRkaXNwbGF5KCk6IHZvaWQge1xuXHRcdGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG5cblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xuXG5cdFx0Ly8gUHJvdmlkZXIgU2VsZWN0aW9uXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIkFJIFByb3ZpZGVyXCIpXG5cdFx0XHQuc2V0RGVzYyhcIlNlbGVjdCB0aGUgQUkgcHJvdmlkZXIgdG8gdXNlLlwiKVxuXHRcdFx0LmFkZERyb3Bkb3duKChjYikgPT4ge1xuXHRcdFx0XHRPYmplY3QudmFsdWVzKFBST1ZJREVSUykuZm9yRWFjaCgocHJvdmlkZXIpID0+IHtcblx0XHRcdFx0XHRjYi5hZGRPcHRpb24ocHJvdmlkZXIuaWQsIHByb3ZpZGVyLm5hbWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y2Iuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VycmVudFByb3ZpZGVyKTtcblx0XHRcdFx0Y2Iub25DaGFuZ2UoYXN5bmMgKHZhbHVlOiBQcm92aWRlclR5cGUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5jdXJyZW50UHJvdmlkZXIgPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR0aGlzLmRpc3BsYXkoKTsgLy8gUmVmcmVzaCB0aGUgc2V0dGluZ3MgZGlzcGxheVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0Ly8gUHJvdmlkZXIgQ29uZmlndXJhdGlvblxuXHRcdHRoaXMuZGlzcGxheVByb3ZpZGVyQ29uZmlnKCk7XG5cblx0XHQvLyBNb2RlbCBTZWxlY3Rpb25cblx0XHR0aGlzLmRpc3BsYXlNb2RlbFNlbGVjdGlvbigpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIllvdXR1YmUgQVBJIGtleVwiKVxuXHRcdFx0LnNldERlc2MoXCJUaGUgWW91dHViZSBBUEkga2V5IHVzZWQgdG8gZmV0Y2ggY2FwdGlvbnNcIilcblx0XHRcdC5hZGRUZXh0KCh0ZXh0KSA9PiB7XG5cdFx0XHRcdHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xuXHRcdFx0XHR0ZXh0LnNldFBsYWNlaG9sZGVyKFwiQVBJIEtleVwiKVxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy55b3V0dWJlQXBpS2V5KVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnlvdXR1YmVBcGlLZXkgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiRGVmYXVsdCBzeXN0ZW0gcHJvbXB0XCIpXG5cdFx0XHQuc2V0RGVzYyhcblx0XHRcdFx0YFRoZSBzeXN0ZW0gcHJvbXB0IHNlbnQgd2l0aCBlYWNoIHJlcXVlc3QgdG8gdGhlIEFQSS4gXFxuKE5vdGU6IHlvdSBjYW4gb3ZlcnJpZGUgdGhpcyBieSBiZWdpbm5pbmcgYSBub3RlIHN0cmVhbSB3aXRoIGEgbm90ZSBzdGFydGluZyAnU1lTVEVNIFBST01QVCcuIFRoZSByZW1haW5pbmcgY29udGVudCBvZiB0aGF0IG5vdGUgd2lsbCBiZSB1c2VkIGFzIHN5c3RlbSBwcm9tcHQuKWBcblx0XHRcdClcblx0XHRcdC5hZGRUZXh0QXJlYSgoY29tcG9uZW50KSA9PiB7XG5cdFx0XHRcdGNvbXBvbmVudC5pbnB1dEVsLnJvd3MgPSA2O1xuXHRcdFx0XHQvLyBjb21wb25lbnQuaW5wdXRFbC5zdHlsZS53aWR0aCA9IFwiMzAwcHhcIjtcblx0XHRcdFx0Ly8gY29tcG9uZW50LmlucHV0RWwuc3R5bGUuZm9udFNpemUgPSBcIjEwcHhcIjtcblx0XHRcdFx0Y29tcG9uZW50LmlucHV0RWwuYWRkQ2xhc3MoXCJhdWdtZW50ZWQtY2FudmFzLXNldHRpbmdzLXByb21wdFwiKTtcblx0XHRcdFx0Y29tcG9uZW50LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN5c3RlbVByb21wdCk7XG5cdFx0XHRcdGNvbXBvbmVudC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeXN0ZW1Qcm9tcHQgPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuZGlzcGxheVN5c3RlbVByb21wdHNTZXR0aW5ncyhjb250YWluZXJFbCk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiRmxhc2hjYXJkcyBzeXN0ZW0gcHJvbXB0XCIpXG5cdFx0XHQuc2V0RGVzYyhgVGhlIHN5c3RlbSBwcm9tcHQgdXNlZCB0byBnZW5lcmF0ZSB0aGUgZmxhc2hjYXJkcyBmaWxlLmApXG5cdFx0XHQuYWRkVGV4dEFyZWEoKGNvbXBvbmVudCkgPT4ge1xuXHRcdFx0XHRjb21wb25lbnQuaW5wdXRFbC5yb3dzID0gNjtcblx0XHRcdFx0Ly8gY29tcG9uZW50LmlucHV0RWwuc3R5bGUud2lkdGggPSBcIjMwMHB4XCI7XG5cdFx0XHRcdC8vIGNvbXBvbmVudC5pbnB1dEVsLnN0eWxlLmZvbnRTaXplID0gXCIxMHB4XCI7XG5cdFx0XHRcdGNvbXBvbmVudC5pbnB1dEVsLmFkZENsYXNzKFwiYXVnbWVudGVkLWNhbnZhcy1zZXR0aW5ncy1wcm9tcHRcIik7XG5cdFx0XHRcdGNvbXBvbmVudC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5mbGFzaGNhcmRzU3lzdGVtUHJvbXB0KTtcblx0XHRcdFx0Y29tcG9uZW50Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmZsYXNoY2FyZHNTeXN0ZW1Qcm9tcHQgPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoXCJSZWxldmFudCBxdWVzdGlvbnMgc3lzdGVtIHByb21wdFwiKVxuXHRcdFx0LnNldERlc2MoXG5cdFx0XHRcdGBUaGUgc3lzdGVtIHByb21wdCB1c2VkIHRvIGdlbmVyYXRlIHJlbGV2YW50IHF1ZXN0aW9ucyBmb3IgdGhlIGNvbW1hbmQgXCJJbnNlcnQgcmVsZXZhbnQgcXVlc3Rpb25zXCIuYFxuXHRcdFx0KVxuXHRcdFx0LmFkZFRleHRBcmVhKChjb21wb25lbnQpID0+IHtcblx0XHRcdFx0Y29tcG9uZW50LmlucHV0RWwucm93cyA9IDY7XG5cdFx0XHRcdC8vIGNvbXBvbmVudC5pbnB1dEVsLnN0eWxlLndpZHRoID0gXCIzMDBweFwiO1xuXHRcdFx0XHQvLyBjb21wb25lbnQuaW5wdXRFbC5zdHlsZS5mb250U2l6ZSA9IFwiMTBweFwiO1xuXHRcdFx0XHRjb21wb25lbnQuaW5wdXRFbC5hZGRDbGFzcyhcImF1Z21lbnRlZC1jYW52YXMtc2V0dGluZ3MtcHJvbXB0XCIpO1xuXHRcdFx0XHRjb21wb25lbnQuc2V0VmFsdWUoXG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MucmVsZXZhbnRRdWVzdGlvbnNTeXN0ZW1Qcm9tcHRcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29tcG9uZW50Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbGV2YW50UXVlc3Rpb25zU3lzdGVtUHJvbXB0ID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiSW5zZXJ0IHJlbGV2YW50IHF1ZXN0aW9ucyBmaWxlcyBjb3VudFwiKVxuXHRcdFx0LnNldERlc2MoXG5cdFx0XHRcdCdUaGUgbnVtYmVyIG9mIGZpbGVzIHRoYXQgYXJlIHRha2VuIGludG8gYWNjb3VudCBieSB0aGUgXCJJbnNlcnQgcmVsZXZhbnQgcXVlc3Rpb25zXCIgY29tbWFuZC4nXG5cdFx0XHQpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRWYWx1ZShcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmluc2VydFJlbGV2YW50UXVlc3Rpb25zRmlsZXNDb3VudC50b1N0cmluZygpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KHZhbHVlKTtcblx0XHRcdFx0XHRcdGlmICghaXNOYU4ocGFyc2VkKSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbnNlcnRSZWxldmFudFF1ZXN0aW9uc0ZpbGVzQ291bnQgPVxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlZDtcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdCk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiTWF4IGlucHV0IHRva2Vuc1wiKVxuXHRcdFx0LnNldERlc2MoXG5cdFx0XHRcdFwiVGhlIG1heGltdW0gbnVtYmVyIG9mIHRva2VucyB0byBzZW5kICh3aXRoaW4gbW9kZWwgbGltaXQpLiAwIG1lYW5zIGFzIG1hbnkgYXMgcG9zc2libGVcIlxuXHRcdFx0KVxuXHRcdFx0LmFkZFRleHQoKHRleHQpID0+XG5cdFx0XHRcdHRleHRcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4SW5wdXRUb2tlbnMudG9TdHJpbmcoKSlcblx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUludCh2YWx1ZSk7XG5cdFx0XHRcdFx0XHRpZiAoIWlzTmFOKHBhcnNlZCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4SW5wdXRUb2tlbnMgPSBwYXJzZWQ7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHQpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIk1heCByZXNwb25zZSB0b2tlbnNcIilcblx0XHRcdC5zZXREZXNjKFxuXHRcdFx0XHRcIlRoZSBtYXhpbXVtIG51bWJlciBvZiB0b2tlbnMgdG8gcmV0dXJuIGZyb20gdGhlIEFQSS4gMCBtZWFucyBubyBsaW1pdC4gKEEgdG9rZW4gaXMgYWJvdXQgNCBjaGFyYWN0ZXJzKS5cIlxuXHRcdFx0KVxuXHRcdFx0LmFkZFRleHQoKHRleHQpID0+XG5cdFx0XHRcdHRleHRcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4UmVzcG9uc2VUb2tlbnMudG9TdHJpbmcoKSlcblx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUludCh2YWx1ZSk7XG5cdFx0XHRcdFx0XHRpZiAoIWlzTmFOKHBhcnNlZCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4UmVzcG9uc2VUb2tlbnMgPSBwYXJzZWQ7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHQpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIk1heCBkZXB0aFwiKVxuXHRcdFx0LnNldERlc2MoXG5cdFx0XHRcdFwiVGhlIG1heGltdW0gZGVwdGggb2YgYW5jZXN0b3Igbm90ZXMgdG8gaW5jbHVkZS4gMCBtZWFucyBubyBsaW1pdC5cIlxuXHRcdFx0KVxuXHRcdFx0LmFkZFRleHQoKHRleHQpID0+XG5cdFx0XHRcdHRleHRcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4RGVwdGgudG9TdHJpbmcoKSlcblx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUludCh2YWx1ZSk7XG5cdFx0XHRcdFx0XHRpZiAoIWlzTmFOKHBhcnNlZCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4RGVwdGggPSBwYXJzZWQ7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHQpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIlRlbXBlcmF0dXJlXCIpXG5cdFx0XHQuc2V0RGVzYyhcIlNhbXBsaW5nIHRlbXBlcmF0dXJlICgwLTIpLiAwIG1lYW5zIG5vIHJhbmRvbW5lc3MuXCIpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50ZW1wZXJhdHVyZS50b1N0cmluZygpKVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlRmxvYXQodmFsdWUpO1xuXHRcdFx0XHRcdFx0aWYgKCFpc05hTihwYXJzZWQpICYmIHBhcnNlZCA+PSAwICYmIHBhcnNlZCA8PSAyKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnRlbXBlcmF0dXJlID0gcGFyc2VkO1xuXHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0KTtcblxuXHRcdC8vIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdC8vIFx0LnNldE5hbWUoXCJBUEkgVVJMXCIpXG5cdFx0Ly8gXHQuc2V0RGVzYyhcblx0XHQvLyBcdFx0XCJUaGUgY2hhdCBjb21wbGV0aW9ucyBVUkwgdG8gdXNlLiBZb3UgcHJvYmFibHkgd29uJ3QgbmVlZCB0byBjaGFuZ2UgdGhpcy5cIlxuXHRcdC8vIFx0KVxuXHRcdC8vIFx0LmFkZFRleHQoKHRleHQpID0+IHtcblx0XHQvLyBcdFx0dGV4dC5pbnB1dEVsLnN0eWxlLndpZHRoID0gXCIzMDBweFwiO1xuXHRcdC8vIFx0XHR0ZXh0LnNldFBsYWNlaG9sZGVyKFwiQVBJIFVSTFwiKVxuXHRcdC8vIFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlVcmwpXG5cdFx0Ly8gXHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdC8vIFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpVXJsID0gdmFsdWU7XG5cdFx0Ly8gXHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHQvLyBcdFx0XHR9KTtcblx0XHQvLyBcdH0pO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIkRlYnVnIG91dHB1dFwiKVxuXHRcdFx0LnNldERlc2MoXCJFbmFibGUgZGVidWcgb3V0cHV0IGluIHRoZSBjb25zb2xlXCIpXG5cdFx0XHQuYWRkVG9nZ2xlKChjb21wb25lbnQpID0+IHtcblx0XHRcdFx0Y29tcG9uZW50XG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlYnVnKVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmRlYnVnID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHRcdGluaXRMb2dEZWJ1Zyh0aGlzLnBsdWdpbi5zZXR0aW5ncyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdGRpc3BsYXlTeXN0ZW1Qcm9tcHRzU2V0dGluZ3MoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG5cdFx0Y29uc3Qgc2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKTtcblxuXHRcdHNldHRpbmdcblx0XHRcdC5zZXROYW1lKFwiQWRkIHN5c3RlbSBwcm9tcHRzXCIpXG5cdFx0XHQuc2V0Q2xhc3MoXCJhdWdtZW50ZWQtY2FudmFzLXNldHRpbmctaXRlbVwiKVxuXHRcdFx0LnNldERlc2MoXG5cdFx0XHRcdGBDcmVhdGUgbmV3IGhpZ2hsaWdodCBjb2xvcnMgYnkgcHJvdmlkaW5nIGEgY29sb3IgbmFtZSBhbmQgdXNpbmcgdGhlIGNvbG9yIHBpY2tlciB0byBzZXQgdGhlIGhleCBjb2RlIHZhbHVlLiBEb24ndCBmb3JnZXQgdG8gc2F2ZSB0aGUgY29sb3IgYmVmb3JlIGV4aXRpbmcgdGhlIGNvbG9yIHBpY2tlci4gRHJhZyBhbmQgZHJvcCB0aGUgaGlnaGxpZ2h0IGNvbG9yIHRvIGNoYW5nZSB0aGUgb3JkZXIgZm9yIHlvdXIgaGlnaGxpZ2h0ZXIgY29tcG9uZW50LmBcblx0XHRcdCk7XG5cblx0XHRjb25zdCBuYW1lSW5wdXQgPSBuZXcgVGV4dENvbXBvbmVudChzZXR0aW5nLmNvbnRyb2xFbCk7XG5cdFx0bmFtZUlucHV0LnNldFBsYWNlaG9sZGVyKFwiTmFtZVwiKTtcblx0XHQvLyBjb2xvcklucHV0LmlucHV0RWwuYWRkQ2xhc3MoXCJoaWdobGlnaHRlci1zZXR0aW5ncy1jb2xvclwiKTtcblxuXHRcdGxldCBwcm9tcHRJbnB1dDogVGV4dEFyZWFDb21wb25lbnQ7XG5cdFx0c2V0dGluZy5hZGRUZXh0QXJlYSgoY29tcG9uZW50KSA9PiB7XG5cdFx0XHRjb21wb25lbnQuaW5wdXRFbC5yb3dzID0gNjtcblx0XHRcdC8vIGNvbXBvbmVudC5pbnB1dEVsLnN0eWxlLndpZHRoID0gXCIzMDBweFwiO1xuXHRcdFx0Ly8gY29tcG9uZW50LmlucHV0RWwuc3R5bGUuZm9udFNpemUgPSBcIjEwcHhcIjtcblx0XHRcdGNvbXBvbmVudC5zZXRQbGFjZWhvbGRlcihcIlByb21wdFwiKTtcblx0XHRcdGNvbXBvbmVudC5pbnB1dEVsLmFkZENsYXNzKFwiYXVnbWVudGVkLWNhbnZhcy1zZXR0aW5ncy1wcm9tcHRcIik7XG5cdFx0XHRwcm9tcHRJbnB1dCA9IGNvbXBvbmVudDtcblx0XHR9KTtcblxuXHRcdHNldHRpbmcuYWRkQnV0dG9uKChidXR0b24pID0+IHtcblx0XHRcdGJ1dHRvblxuXHRcdFx0XHQuc2V0SWNvbihcImx1Y2lkZS1wbHVzXCIpXG5cdFx0XHRcdC5zZXRUb29sdGlwKFwiQWRkXCIpXG5cdFx0XHRcdC5vbkNsaWNrKGFzeW5jIChidXR0b25FbDogYW55KSA9PiB7XG5cdFx0XHRcdFx0bGV0IG5hbWUgPSBuYW1lSW5wdXQuaW5wdXRFbC52YWx1ZTtcblx0XHRcdFx0XHRjb25zdCBwcm9tcHQgPSBwcm9tcHRJbnB1dC5pbnB1dEVsLnZhbHVlO1xuXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coeyBuYW1lLCBwcm9tcHQgfSk7XG5cblx0XHRcdFx0XHRpZiAoIW5hbWUgfHwgIXByb21wdCkge1xuXHRcdFx0XHRcdFx0bmFtZSAmJiAhcHJvbXB0XG5cdFx0XHRcdFx0XHRcdD8gbmV3IE5vdGljZShcIlByb21wdCBtaXNzaW5nXCIpXG5cdFx0XHRcdFx0XHRcdDogIW5hbWUgJiYgcHJvbXB0XG5cdFx0XHRcdFx0XHRcdD8gbmV3IE5vdGljZShcIk5hbWUgbWlzc2luZ1wiKVxuXHRcdFx0XHRcdFx0XHQ6IG5ldyBOb3RpY2UoXCJWYWx1ZXMgbWlzc2luZ1wiKTsgLy8gZWxzZVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vICogSGFuZGxlcyBtdWx0aXBsZSB3aXRoIHRoZSBzYW1lIG5hbWVcblx0XHRcdFx0XHQvLyBpZiAoXG5cdFx0XHRcdFx0Ly8gXHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeXN0ZW1Qcm9tcHRzLmZpbHRlcihcblx0XHRcdFx0XHQvLyBcdFx0KHN5c3RlbVByb21wdDogU3lzdGVtUHJvbXB0KSA9PlxuXHRcdFx0XHRcdC8vIFx0XHRcdHN5c3RlbVByb21wdC5hY3QgPT09IG5hbWVcblx0XHRcdFx0XHQvLyBcdCkubGVuZ3RoXG5cdFx0XHRcdFx0Ly8gKSB7XG5cdFx0XHRcdFx0Ly8gXHRuYW1lICs9IFwiIDJcIjtcblx0XHRcdFx0XHQvLyB9XG5cdFx0XHRcdFx0Ly8gbGV0IGNvdW50ID0gMztcblx0XHRcdFx0XHQvLyB3aGlsZSAoXG5cdFx0XHRcdFx0Ly8gXHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeXN0ZW1Qcm9tcHRzLmZpbHRlcihcblx0XHRcdFx0XHQvLyBcdFx0KHN5c3RlbVByb21wdDogU3lzdGVtUHJvbXB0KSA9PlxuXHRcdFx0XHRcdC8vIFx0XHRcdHN5c3RlbVByb21wdC5hY3QgPT09IG5hbWVcblx0XHRcdFx0XHQvLyBcdCkubGVuZ3RoXG5cdFx0XHRcdFx0Ly8gKSB7XG5cdFx0XHRcdFx0Ly8gXHRuYW1lID0gbmFtZS5zbGljZSgwLCAtMikgKyBcIiBcIiArIGNvdW50O1xuXHRcdFx0XHRcdC8vIFx0Y291bnQrKztcblx0XHRcdFx0XHQvLyB9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHQhdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3lzdGVtUHJvbXB0cy5maWx0ZXIoXG5cdFx0XHRcdFx0XHRcdChzeXN0ZW1Qcm9tcHQ6IFN5c3RlbVByb21wdCkgPT5cblx0XHRcdFx0XHRcdFx0XHRzeXN0ZW1Qcm9tcHQuYWN0ID09PSBuYW1lXG5cdFx0XHRcdFx0XHQpLmxlbmd0aCAmJlxuXHRcdFx0XHRcdFx0IXRoaXMucGx1Z2luLnNldHRpbmdzLnVzZXJTeXN0ZW1Qcm9tcHRzLmZpbHRlcihcblx0XHRcdFx0XHRcdFx0KHN5c3RlbVByb21wdDogU3lzdGVtUHJvbXB0KSA9PlxuXHRcdFx0XHRcdFx0XHRcdHN5c3RlbVByb21wdC5hY3QgPT09IG5hbWVcblx0XHRcdFx0XHRcdCkubGVuZ3RoXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy51c2VyU3lzdGVtUHJvbXB0cy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0aWQ6XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Muc3lzdGVtUHJvbXB0cy5sZW5ndGggK1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZXJTeXN0ZW1Qcm9tcHRzLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0YWN0OiBuYW1lLFxuXHRcdFx0XHRcdFx0XHRwcm9tcHQsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdFx0dGhpcy5kaXNwbGF5KCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGJ1dHRvbkVsLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZShcIlRoaXMgc3lzdGVtIHByb21wdCBuYW1lIGFscmVhZHkgZXhpc3RzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBsaXN0Q29udGFpbmVyID0gY29udGFpbmVyRWwuY3JlYXRlRWwoXCJkaXZcIiwge1xuXHRcdFx0Y2xzOiBcImF1Z21lbnRlZC1jYW52YXMtbGlzdC1jb250YWluZXJcIixcblx0XHR9KTtcblxuXHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZXJTeXN0ZW1Qcm9tcHRzLmZvckVhY2goXG5cdFx0XHQoc3lzdGVtUHJvbXB0OiBTeXN0ZW1Qcm9tcHQpID0+IHtcblx0XHRcdFx0Y29uc3QgbGlzdEVsZW1lbnQgPSBsaXN0Q29udGFpbmVyLmNyZWF0ZUVsKFwiZGl2XCIsIHtcblx0XHRcdFx0XHRjbHM6IFwiYXVnbWVudGVkLWNhbnZhcy1saXN0LWVsZW1lbnRcIixcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Y29uc3QgbmFtZUlucHV0ID0gbmV3IFRleHRDb21wb25lbnQobGlzdEVsZW1lbnQpO1xuXHRcdFx0XHRuYW1lSW5wdXQuc2V0VmFsdWUoc3lzdGVtUHJvbXB0LmFjdCk7XG5cblx0XHRcdFx0Y29uc3QgcHJvbXB0SW5wdXQgPSBuZXcgVGV4dEFyZWFDb21wb25lbnQobGlzdEVsZW1lbnQpO1xuXHRcdFx0XHRwcm9tcHRJbnB1dC5pbnB1dEVsLmFkZENsYXNzKFxuXHRcdFx0XHRcdFwiYXVnbWVudGVkLWNhbnZhcy1zZXR0aW5ncy1wcm9tcHRcIlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRwcm9tcHRJbnB1dC5zZXRWYWx1ZShzeXN0ZW1Qcm9tcHQucHJvbXB0KTtcblxuXHRcdFx0XHRjb25zdCBidXR0b25TYXZlID0gbmV3IEJ1dHRvbkNvbXBvbmVudChsaXN0RWxlbWVudCk7XG5cdFx0XHRcdGJ1dHRvblNhdmVcblx0XHRcdFx0XHQuc2V0SWNvbihcImx1Y2lkZS1zYXZlXCIpXG5cdFx0XHRcdFx0LnNldFRvb2x0aXAoXCJTYXZlXCIpXG5cdFx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKGJ1dHRvbkVsOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdGxldCBuYW1lID0gbmFtZUlucHV0LmlucHV0RWwudmFsdWU7XG5cdFx0XHRcdFx0XHRjb25zdCBwcm9tcHQgPSBwcm9tcHRJbnB1dC5pbnB1dEVsLnZhbHVlO1xuXG5cdFx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyh7IG5hbWUsIHByb21wdCB9KTtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZXJTeXN0ZW1Qcm9tcHRzID1cblx0XHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlclN5c3RlbVByb21wdHMubWFwKFxuXHRcdFx0XHRcdFx0XHRcdChzeXN0ZW1Qcm9tcHQyOiBTeXN0ZW1Qcm9tcHQpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRzeXN0ZW1Qcm9tcHQyLmlkID09PSBzeXN0ZW1Qcm9tcHQuaWRcblx0XHRcdFx0XHRcdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuLi5zeXN0ZW1Qcm9tcHQyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWN0OiBuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cHJvbXB0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgIH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0OiBzeXN0ZW1Qcm9tcHQyXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHRcdHRoaXMuZGlzcGxheSgpO1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZShcIlN5c3RlbSBwcm9tcHQgdXBkYXRlZFwiKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRjb25zdCBidXR0b25EZWxldGUgPSBuZXcgQnV0dG9uQ29tcG9uZW50KGxpc3RFbGVtZW50KTtcblx0XHRcdFx0YnV0dG9uRGVsZXRlXG5cdFx0XHRcdFx0LnNldEljb24oXCJsdWNpZGUtdHJhc2hcIilcblx0XHRcdFx0XHQuc2V0VG9vbHRpcChcIkRlbGV0ZVwiKVxuXHRcdFx0XHRcdC5vbkNsaWNrKGFzeW5jIChidXR0b25FbDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRsZXQgbmFtZSA9IG5hbWVJbnB1dC5pbnB1dEVsLnZhbHVlO1xuXHRcdFx0XHRcdFx0Y29uc3QgcHJvbXB0ID0gcHJvbXB0SW5wdXQuaW5wdXRFbC52YWx1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coeyBuYW1lLCBwcm9tcHQgfSk7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy51c2VyU3lzdGVtUHJvbXB0cyA9XG5cdFx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZXJTeXN0ZW1Qcm9tcHRzLmZpbHRlcihcblx0XHRcdFx0XHRcdFx0XHQoc3lzdGVtUHJvbXB0MjogU3lzdGVtUHJvbXB0KSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0c3lzdGVtUHJvbXB0Mi5pZCAhPT0gc3lzdGVtUHJvbXB0LmlkXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHRcdHRoaXMuZGlzcGxheSgpO1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZShcIlN5c3RlbSBwcm9tcHQgZGVsZXRlZFwiKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cblx0ZGlzcGxheVByb3ZpZGVyQ29uZmlnKCk6IHZvaWQge1xuXHRcdGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG5cdFx0Y29uc3QgY3VycmVudFByb3ZpZGVyID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VycmVudFByb3ZpZGVyO1xuXHRcdGNvbnN0IHByb3ZpZGVySW5mbyA9IGdldFByb3ZpZGVySW5mbyhjdXJyZW50UHJvdmlkZXIpO1xuXHRcdGNvbnN0IGN1cnJlbnRDb25maWcgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5wcm92aWRlcnNbY3VycmVudFByb3ZpZGVyXTtcblxuXHRcdC8vIFByb3ZpZGVyIGNvbmZpZ3VyYXRpb24gc2VjdGlvblxuXHRcdGNvbnN0IHByb3ZpZGVyU2VjdGlvbiA9IGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiZGl2XCIsIHtcblx0XHRcdGNsczogXCJzZXR0aW5nLWl0ZW0taGVhZGluZ1wiLFxuXHRcdH0pO1xuXHRcdHByb3ZpZGVyU2VjdGlvbi50ZXh0Q29udGVudCA9IGAke3Byb3ZpZGVySW5mby5uYW1lfSBDb25maWd1cmF0aW9uYDtcblxuXHRcdC8vIEFkZCByZWZyZXNoIG1vZGVscyBidXR0b25cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiUmVmcmVzaCBNb2RlbHNcIilcblx0XHRcdC5zZXREZXNjKFwiRmV0Y2ggdGhlIGxhdGVzdCBhdmFpbGFibGUgbW9kZWxzIGZyb20gdGhlIHByb3ZpZGVyXCIpXG5cdFx0XHQuYWRkQnV0dG9uKChidXR0b24pID0+IHtcblx0XHRcdFx0YnV0dG9uXG5cdFx0XHRcdFx0LnNldEJ1dHRvblRleHQoXCJSZWZyZXNoXCIpXG5cdFx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uYWlTZXJ2aWNlLnJlZnJlc2hNb2RlbHMoY3VycmVudFByb3ZpZGVyKTtcblx0XHRcdFx0XHRcdFx0bmV3IE5vdGljZShcIk1vZGVscyByZWZyZXNoZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLmRpc3BsYXkoKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoYEZhaWxlZCB0byByZWZyZXNoIG1vZGVsczogJHtlcnJvci5tZXNzYWdlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHQvLyBBZGQgY29uZmlndXJhdGlvbiBmaWVsZHMgZm9yIHRoZSBjdXJyZW50IHByb3ZpZGVyXG5cdFx0cHJvdmlkZXJJbmZvLmNvbmZpZ0ZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuXHRcdFx0Y29uc3Qgc2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0XHQuc2V0TmFtZShmaWVsZC5sYWJlbClcblx0XHRcdFx0LnNldERlc2MoYCR7ZmllbGQucmVxdWlyZWQgPyBcIlJlcXVpcmVkXCIgOiBcIk9wdGlvbmFsXCJ9YCk7XG5cblx0XHRcdGlmIChmaWVsZC50eXBlID09PSBcInBhc3N3b3JkXCIpIHtcblx0XHRcdFx0c2V0dGluZy5hZGRUZXh0KCh0ZXh0KSA9PiB7XG5cdFx0XHRcdFx0dGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XG5cdFx0XHRcdFx0dGV4dC5zZXRQbGFjZWhvbGRlcihmaWVsZC5wbGFjZWhvbGRlciB8fCBcIlwiKTtcblx0XHRcdFx0XHR0ZXh0LnNldFZhbHVlKGN1cnJlbnRDb25maWcuY29uZmlnW2ZpZWxkLmtleV0gfHwgXCJcIik7XG5cdFx0XHRcdFx0dGV4dC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdGN1cnJlbnRDb25maWcuY29uZmlnW2ZpZWxkLmtleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoZmllbGQudHlwZSA9PT0gXCJ1cmxcIikge1xuXHRcdFx0XHRzZXR0aW5nLmFkZFRleHQoKHRleHQpID0+IHtcblx0XHRcdFx0XHR0ZXh0LnNldFBsYWNlaG9sZGVyKGZpZWxkLnBsYWNlaG9sZGVyIHx8IFwiXCIpO1xuXHRcdFx0XHRcdHRleHQuc2V0VmFsdWUoY3VycmVudENvbmZpZy5jb25maWdbZmllbGQua2V5XSB8fCBcIlwiKTtcblx0XHRcdFx0XHR0ZXh0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y3VycmVudENvbmZpZy5jb25maWdbZmllbGQua2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0dGluZy5hZGRUZXh0KCh0ZXh0KSA9PiB7XG5cdFx0XHRcdFx0dGV4dC5zZXRQbGFjZWhvbGRlcihmaWVsZC5wbGFjZWhvbGRlciB8fCBcIlwiKTtcblx0XHRcdFx0XHR0ZXh0LnNldFZhbHVlKGN1cnJlbnRDb25maWcuY29uZmlnW2ZpZWxkLmtleV0gfHwgXCJcIik7XG5cdFx0XHRcdFx0dGV4dC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdGN1cnJlbnRDb25maWcuY29uZmlnW2ZpZWxkLmtleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGRpc3BsYXlNb2RlbFNlbGVjdGlvbigpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuXHRcdGNvbnN0IGN1cnJlbnRQcm92aWRlciA9IHRoaXMucGx1Z2luLnNldHRpbmdzLmN1cnJlbnRQcm92aWRlcjtcblx0XHRjb25zdCBwcm92aWRlckluZm8gPSBnZXRQcm92aWRlckluZm8oY3VycmVudFByb3ZpZGVyKTtcblx0XHRjb25zdCBhdmFpbGFibGVNb2RlbHMgPSB0aGlzLnBsdWdpbi5haVNlcnZpY2UuZ2V0QXZhaWxhYmxlTW9kZWxzKCk7XG5cblx0XHQvLyBDaGF0IE1vZGVsIFNlbGVjdGlvblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoXCJDaGF0IE1vZGVsXCIpXG5cdFx0XHQuc2V0RGVzYyhcIlNlbGVjdCB0aGUgbW9kZWwgdG8gdXNlIGZvciB0ZXh0IGdlbmVyYXRpb24uXCIpXG5cdFx0XHQuYWRkRHJvcGRvd24oKGNiKSA9PiB7XG5cdFx0XHRcdGlmIChhdmFpbGFibGVNb2RlbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGF2YWlsYWJsZU1vZGVscy5mb3JFYWNoKChtb2RlbCkgPT4ge1xuXHRcdFx0XHRcdFx0Y2IuYWRkT3B0aW9uKG1vZGVsLmlkLCBtb2RlbC5uYW1lKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRjYi5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlNb2RlbCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gRmFsbGJhY2sgdG8gbGVnYWN5IG1vZGVscyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuXHRcdFx0XHRcdGdldE1vZGVscygpLmZvckVhY2goKG1vZGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRjYi5hZGRPcHRpb24obW9kZWwsIG1vZGVsKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRjYi5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlNb2RlbCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2Iub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpTW9kZWwgPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdC8vIEltYWdlIE1vZGVsIFNlbGVjdGlvbiAob25seSBmb3IgcHJvdmlkZXJzIHRoYXQgc3VwcG9ydCBpdClcblx0XHRpZiAocHJvdmlkZXJJbmZvLnN1cHBvcnRzSW1hZ2VHZW5lcmF0aW9uKSB7XG5cdFx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdFx0LnNldE5hbWUoXCJJbWFnZSBNb2RlbFwiKVxuXHRcdFx0XHQuc2V0RGVzYyhcIlNlbGVjdCB0aGUgbW9kZWwgdG8gZ2VuZXJhdGUgaW1hZ2VzLlwiKVxuXHRcdFx0XHQuYWRkRHJvcGRvd24oKGNiKSA9PiB7XG5cdFx0XHRcdFx0Z2V0SW1hZ2VNb2RlbHMoKS5mb3JFYWNoKChtb2RlbCkgPT4ge1xuXHRcdFx0XHRcdFx0Y2IuYWRkT3B0aW9uKG1vZGVsLCBtb2RlbCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Y2Iuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuaW1hZ2VNb2RlbCk7XG5cdFx0XHRcdFx0Y2Iub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbWFnZU1vZGVsID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNldHRpbmdzVGFiO1xuIl19