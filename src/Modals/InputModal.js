import { Modal } from "obsidian";
export class InputModal extends Modal {
    constructor(app, { label, buttonLabel }, onSubmit) {
        super(app);
        this.label = label;
        this.buttonLabel = buttonLabel;
        this.onSubmit = onSubmit;
    }
    onOpen() {
        let { contentEl } = this;
        contentEl.className = "augmented-canvas-modal-container";
        let inputEl = contentEl.createEl("input");
        inputEl.className = "augmented-canvas-modal-input";
        inputEl.placeholder = this.label;
        // Add keydown event listener to the textarea
        inputEl.addEventListener("keydown", (event) => {
            // Check if Ctrl + Enter is pressed
            if (event.key === "Enter") {
                // Prevent default action to avoid any unwanted behavior
                event.preventDefault();
                // Call the onSubmit function and close the modal
                this.onSubmit(inputEl.value);
                this.close();
            }
        });
        // Create and append a submit button
        let submitBtn = contentEl.createEl("button", {
            text: this.buttonLabel,
        });
        submitBtn.onClickEvent(() => {
            this.onSubmit(inputEl.value);
            this.close();
        });
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
    submit() {
        const value = this.inputEl.value;
        this.onSubmit(value);
        this.close();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5wdXRNb2RhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIklucHV0TW9kYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLEtBQUssRUFBaUMsTUFBTSxVQUFVLENBQUM7QUFFeEUsTUFBTSxPQUFPLFVBQVcsU0FBUSxLQUFLO0lBTXBDLFlBQ0MsR0FBUSxFQUNSLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBMEMsRUFDOUQsUUFBaUM7UUFFakMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDMUIsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsa0NBQWtDLENBQUM7UUFFekQsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsU0FBUyxHQUFHLDhCQUE4QixDQUFDO1FBQ25ELE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVqQyw2Q0FBNkM7UUFDN0MsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzdDLG1DQUFtQztZQUNuQyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssT0FBTyxFQUFFO2dCQUMxQix3REFBd0Q7Z0JBQ3hELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsaURBQWlEO2dCQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2I7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILG9DQUFvQztRQUNwQyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtZQUM1QyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVc7U0FDdEIsQ0FBQyxDQUFDO1FBQ0gsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsT0FBTztRQUNOLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDM0IsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNO1FBQ0wsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZCxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbHVnaW4sIE1vZGFsLCBBcHAsIE5vdGljZSwgU2V0dGluZywgQ29tbWFuZCB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5leHBvcnQgY2xhc3MgSW5wdXRNb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0bGFiZWw6IHN0cmluZztcblx0YnV0dG9uTGFiZWw6IHN0cmluZztcblx0b25TdWJtaXQ6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkO1xuXHRpbnB1dEVsOiBIVE1MSW5wdXRFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGFwcDogQXBwLFxuXHRcdHsgbGFiZWwsIGJ1dHRvbkxhYmVsIH06IHsgbGFiZWw6IHN0cmluZzsgYnV0dG9uTGFiZWw6IHN0cmluZyB9LFxuXHRcdG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gdm9pZFxuXHQpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMubGFiZWwgPSBsYWJlbDtcblx0XHR0aGlzLmJ1dHRvbkxhYmVsID0gYnV0dG9uTGFiZWw7XG5cdFx0dGhpcy5vblN1Ym1pdCA9IG9uU3VibWl0O1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGxldCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuY2xhc3NOYW1lID0gXCJhdWdtZW50ZWQtY2FudmFzLW1vZGFsLWNvbnRhaW5lclwiO1xuXG5cdFx0bGV0IGlucHV0RWwgPSBjb250ZW50RWwuY3JlYXRlRWwoXCJpbnB1dFwiKTtcblx0XHRpbnB1dEVsLmNsYXNzTmFtZSA9IFwiYXVnbWVudGVkLWNhbnZhcy1tb2RhbC1pbnB1dFwiO1xuXHRcdGlucHV0RWwucGxhY2Vob2xkZXIgPSB0aGlzLmxhYmVsO1xuXG5cdFx0Ly8gQWRkIGtleWRvd24gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHRleHRhcmVhXG5cdFx0aW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcblx0XHRcdC8vIENoZWNrIGlmIEN0cmwgKyBFbnRlciBpcyBwcmVzc2VkXG5cdFx0XHRpZiAoZXZlbnQua2V5ID09PSBcIkVudGVyXCIpIHtcblx0XHRcdFx0Ly8gUHJldmVudCBkZWZhdWx0IGFjdGlvbiB0byBhdm9pZCBhbnkgdW53YW50ZWQgYmVoYXZpb3Jcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0Ly8gQ2FsbCB0aGUgb25TdWJtaXQgZnVuY3Rpb24gYW5kIGNsb3NlIHRoZSBtb2RhbFxuXHRcdFx0XHR0aGlzLm9uU3VibWl0KGlucHV0RWwudmFsdWUpO1xuXHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBDcmVhdGUgYW5kIGFwcGVuZCBhIHN1Ym1pdCBidXR0b25cblx0XHRsZXQgc3VibWl0QnRuID0gY29udGVudEVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMuYnV0dG9uTGFiZWwsXG5cdFx0fSk7XG5cdFx0c3VibWl0QnRuLm9uQ2xpY2tFdmVudCgoKSA9PiB7XG5cdFx0XHR0aGlzLm9uU3VibWl0KGlucHV0RWwudmFsdWUpO1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0b25DbG9zZSgpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0fVxuXG5cdHN1Ym1pdCgpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuaW5wdXRFbC52YWx1ZTtcblx0XHR0aGlzLm9uU3VibWl0KHZhbHVlKTtcblx0XHR0aGlzLmNsb3NlKCk7XG5cdH1cbn1cbiJdfQ==