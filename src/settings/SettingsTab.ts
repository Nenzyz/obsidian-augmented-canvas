import {
	App,
	ButtonComponent,
	Notice,
	PluginSettingTab,
	Setting,
	TextAreaComponent,
	TextComponent,
} from "obsidian";
import ChatStreamPlugin from "./../AugmentedCanvasPlugin";
import {
	SystemPrompt,
	getImageModels,
	getModels,
	getModelsFromService,
	getImageModelsFromService,
} from "./AugmentedCanvasSettings";
import { initLogDebug } from "src/logDebug";
import { PROVIDERS, ProviderType, getProviderInfo } from "src/providers";

export class SettingsTab extends PluginSettingTab {
	plugin: ChatStreamPlugin;

	constructor(app: App, plugin: ChatStreamPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
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
				cb.onChange(async (value: ProviderType) => {
					this.plugin.settings.currentProvider = value;
					await this.plugin.saveSettings();
					
					// Try to refresh models for the new provider
					try {
						await this.plugin.aiService.refreshModels(value);
						await this.plugin.saveSettings();
					} catch (error) {
						// Silently fail - will use fallback models
						console.debug(`Could not refresh models for ${value}:`, error);
					}
					
					this.display(); // Refresh the settings display
				});
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
					.onChange(async (value) => {
						this.plugin.settings.youtubeApiKey = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Default system prompt")
			.setDesc(
				`The system prompt sent with each request to the API. \n(Note: you can override this by beginning a note stream with a note starting 'SYSTEM PROMPT'. The remaining content of that note will be used as system prompt.)`
			)
			.addTextArea((component) => {
				component.inputEl.rows = 6;
				// component.inputEl.style.width = "300px";
				// component.inputEl.style.fontSize = "10px";
				component.inputEl.addClass("augmented-canvas-settings-prompt");
				component.setValue(this.plugin.settings.systemPrompt);
				component.onChange(async (value) => {
					this.plugin.settings.systemPrompt = value;
					await this.plugin.saveSettings();
				});
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
				component.onChange(async (value) => {
					this.plugin.settings.flashcardsSystemPrompt = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Relevant questions system prompt")
			.setDesc(
				`The system prompt used to generate relevant questions for the command "Insert relevant questions".`
			)
			.addTextArea((component) => {
				component.inputEl.rows = 6;
				// component.inputEl.style.width = "300px";
				// component.inputEl.style.fontSize = "10px";
				component.inputEl.addClass("augmented-canvas-settings-prompt");
				component.setValue(
					this.plugin.settings.relevantQuestionsSystemPrompt
				);
				component.onChange(async (value) => {
					this.plugin.settings.relevantQuestionsSystemPrompt = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Insert relevant questions files count")
			.setDesc(
				'The number of files that are taken into account by the "Insert relevant questions" command.'
			)
			.addText((text) =>
				text
					.setValue(
						this.plugin.settings.insertRelevantQuestionsFilesCount.toString()
					)
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (!isNaN(parsed)) {
							this.plugin.settings.insertRelevantQuestionsFilesCount =
								parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Max input tokens")
			.setDesc(
				"The maximum number of tokens to send (within model limit). 0 means as many as possible"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.maxInputTokens.toString())
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (!isNaN(parsed)) {
							this.plugin.settings.maxInputTokens = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Max response tokens")
			.setDesc(
				"The maximum number of tokens to return from the API. 0 means no limit. (A token is about 4 characters)."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.maxResponseTokens.toString())
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (!isNaN(parsed)) {
							this.plugin.settings.maxResponseTokens = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Max depth")
			.setDesc(
				"The maximum depth of ancestor notes to include. 0 means no limit."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.maxDepth.toString())
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (!isNaN(parsed)) {
							this.plugin.settings.maxDepth = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Temperature")
			.setDesc("Sampling temperature (0-2). 0 means no randomness.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.temperature.toString())
					.onChange(async (value) => {
						const parsed = parseFloat(value);
						if (!isNaN(parsed) && parsed >= 0 && parsed <= 2) {
							this.plugin.settings.temperature = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

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
			.setName("Context separator")
			.setDesc("Separator used between connected nodes when building conversation context. Use \\n for newlines.")
			.addText((text) => {
				text.inputEl.style.width = "300px";
				text.setPlaceholder("\\n\\n---\\n\\n")
					// Display newlines as escaped for user input
					.setValue(this.plugin.settings.contextSeparator.replace(/\n/g, '\\n'))
					.onChange(async (value) => {
						// Convert escaped newlines to actual newlines
						const processedValue = value.replace(/\\n/g, '\n');
						this.plugin.settings.contextSeparator = processedValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Debug output")
			.setDesc("Enable debug output in the console")
			.addToggle((component) => {
				component
					.setValue(this.plugin.settings.debug)
					.onChange(async (value) => {
						this.plugin.settings.debug = value;
						await this.plugin.saveSettings();
						initLogDebug(this.plugin.settings);
					});
			});
	}

	displaySystemPromptsSettings(containerEl: HTMLElement): void {
		const setting = new Setting(containerEl);

		setting
			.setName("Add system prompts")
			.setClass("augmented-canvas-setting-item")
			.setDesc(
				`Create new highlight colors by providing a color name and using the color picker to set the hex code value. Don't forget to save the color before exiting the color picker. Drag and drop the highlight color to change the order for your highlighter component.`
			);

		const nameInput = new TextComponent(setting.controlEl);
		nameInput.setPlaceholder("Name");
		// colorInput.inputEl.addClass("highlighter-settings-color");

		let promptInput: TextAreaComponent;
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
				.onClick(async (buttonEl: any) => {
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

					if (
						!this.plugin.settings.systemPrompts.filter(
							(systemPrompt: SystemPrompt) =>
								systemPrompt.act === name
						).length &&
						!this.plugin.settings.userSystemPrompts.filter(
							(systemPrompt: SystemPrompt) =>
								systemPrompt.act === name
						).length
					) {
						this.plugin.settings.userSystemPrompts.push({
							id:
								this.plugin.settings.systemPrompts.length +
								this.plugin.settings.userSystemPrompts.length,
							act: name,
							prompt,
						});
						await this.plugin.saveSettings();
						this.display();
					} else {
						buttonEl.stopImmediatePropagation();
						new Notice("This system prompt name already exists");
					}
				});
		});

		const listContainer = containerEl.createEl("div", {
			cls: "augmented-canvas-list-container",
		});

		this.plugin.settings.userSystemPrompts.forEach(
			(systemPrompt: SystemPrompt) => {
				const listElement = listContainer.createEl("div", {
					cls: "augmented-canvas-list-element",
				});

				const nameInput = new TextComponent(listElement);
				nameInput.setValue(systemPrompt.act);

				const promptInput = new TextAreaComponent(listElement);
				promptInput.inputEl.addClass(
					"augmented-canvas-settings-prompt"
				);
				promptInput.setValue(systemPrompt.prompt);

				const buttonSave = new ButtonComponent(listElement);
				buttonSave
					.setIcon("lucide-save")
					.setTooltip("Save")
					.onClick(async (buttonEl: any) => {
						let name = nameInput.inputEl.value;
						const prompt = promptInput.inputEl.value;

						// console.log({ name, prompt });
						this.plugin.settings.userSystemPrompts =
							this.plugin.settings.userSystemPrompts.map(
								(systemPrompt2: SystemPrompt) =>
									systemPrompt2.id === systemPrompt.id
										? {
												...systemPrompt2,
												act: name,
												prompt,
										  }
										: systemPrompt2
							);
						await this.plugin.saveSettings();
						this.display();
						new Notice("System prompt updated");
					});

				const buttonDelete = new ButtonComponent(listElement);
				buttonDelete
					.setIcon("lucide-trash")
					.setTooltip("Delete")
					.onClick(async (buttonEl: any) => {
						let name = nameInput.inputEl.value;
						const prompt = promptInput.inputEl.value;

						// console.log({ name, prompt });
						this.plugin.settings.userSystemPrompts =
							this.plugin.settings.userSystemPrompts.filter(
								(systemPrompt2: SystemPrompt) =>
									systemPrompt2.id !== systemPrompt.id
							);
						await this.plugin.saveSettings();
						this.display();
						new Notice("System prompt deleted");
					});
			}
		);
	}

	displayProviderConfig(): void {
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
					.onClick(async () => {
						try {
							await this.plugin.aiService.refreshModels(currentProvider);
							new Notice("Models refreshed successfully");
							this.display();
						} catch (error) {
							new Notice(`Failed to refresh models: ${error.message}`);
						}
					});
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
					text.onChange(async (value) => {
						currentConfig.config[field.key] = value;
						await this.plugin.saveSettings();
					});
				});
			} else if (field.type === "url") {
				setting.addText((text) => {
					text.setPlaceholder(field.placeholder || "");
					text.setValue(currentConfig.config[field.key] || "");
					text.onChange(async (value) => {
						currentConfig.config[field.key] = value;
						await this.plugin.saveSettings();
					});
				});
			} else {
				setting.addText((text) => {
					text.setPlaceholder(field.placeholder || "");
					text.setValue(currentConfig.config[field.key] || "");
					text.onChange(async (value) => {
						currentConfig.config[field.key] = value;
						await this.plugin.saveSettings();
					});
				});
			}
		});
	}

	displayModelSelection(): void {
		const { containerEl } = this;
		const currentProvider = this.plugin.settings.currentProvider;
		const providerInfo = getProviderInfo(currentProvider);

		// Chat Model Selection
		const chatModelSetting = new Setting(containerEl)
			.setName("Chat Model")
			.setDesc("Select the model to use for text generation.");

		this.loadChatModels(chatModelSetting);

		// Image Model Selection (only for providers that support it)
		if (providerInfo.supportsImageGeneration) {
			const imageModelSetting = new Setting(containerEl)
				.setName("Image Model")
				.setDesc("Select the model to generate images.");

			this.loadImageModels(imageModelSetting);
		}
	}

	private loadChatModels(setting: Setting): void {
		setting.addDropdown(async (cb) => {
			try {
				// Load models from service
				const models = await getModelsFromService(this.plugin.aiService);
				
				models.forEach((model) => {
					cb.addOption(model.id, model.name);
				});
				
				// Set current value
				cb.setValue(this.plugin.settings.apiModel);
				
				cb.onChange(async (value) => {
					this.plugin.settings.apiModel = value;
					await this.plugin.saveSettings();
				});
			} catch (error) {
				// Fallback to legacy models
				getModels().forEach((model) => {
					cb.addOption(model, model);
				});
				cb.setValue(this.plugin.settings.apiModel);
				cb.onChange(async (value) => {
					this.plugin.settings.apiModel = value;
					await this.plugin.saveSettings();
				});
			}
		});
	}

	private async loadImageModels(setting: Setting): Promise<void> {
		setting.addDropdown(async (cb) => {
			try {
				// Load image models from service
				const models = await getImageModelsFromService(this.plugin.aiService);
				
				models.forEach((model) => {
					cb.addOption(model.id, model.name);
				});
				
				// Set current value
				cb.setValue(this.plugin.settings.imageModel);
				
				cb.onChange(async (value) => {
					this.plugin.settings.imageModel = value;
					await this.plugin.saveSettings();
				});
			} catch (error) {
				// Fallback to legacy models
				getImageModels().forEach((model) => {
					cb.addOption(model, model);
				});
				cb.setValue(this.plugin.settings.imageModel);
				cb.onChange(async (value) => {
					this.plugin.settings.imageModel = value;
					await this.plugin.saveSettings();
				});
			}
		});
	}
}

export default SettingsTab;
