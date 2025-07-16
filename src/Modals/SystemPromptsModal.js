import { SuggestModal } from "obsidian";
import Fuse from "fuse.js";
/**
 * A serchable modal that allows the user to select a checkbox status symbol
 */
export default class QuickActionModal extends SuggestModal {
    /**
     *
     * @param app Obsidian instance
     * @param plugin plugin instance
     * @param editor editor instance
     */
    constructor(app, settings, onChoose) {
        super(app);
        this.settings = settings;
        this.onChoose = onChoose;
        const fuse = new Fuse([...this.settings.userSystemPrompts, ...this.settings.systemPrompts]
            .filter((systemPrompt) => systemPrompt.act)
            .sort((a, b) => a.act.localeCompare(b.act)), {
            keys: ["act", "prompt"],
        });
        this.fuse = fuse;
    }
    /**
     * filters the checkbox options; the results are used as suggestions
     * @param query the search string
     * @returns collection of options
     */
    getSuggestions(query) {
        if (query === "")
            return this.settings.systemPrompts;
        return this.fuse
            .search(query)
            .map((result) => result.item);
    }
    /**
     * renders each suggestion
     * @param option the checkbox option to display
     * @param el the suggestion HTML element
     */
    renderSuggestion(systemPrompt, el) {
        el.setCssStyles({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            textAlign: "center",
        });
        const input = el.createEl("span", {
            text: systemPrompt.act,
        });
    }
    /**
     * Handler for when the user chooses an option
     * @param option the option selected by the user
     * @param evt the triggering mouse or keyboard event
     */
    onChooseSuggestion(systemPrompt, evt) {
        this.onChoose(systemPrompt);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtUHJvbXB0c01vZGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU3lzdGVtUHJvbXB0c01vZGFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBa0IsWUFBWSxFQUFPLE1BQU0sVUFBVSxDQUFDO0FBTzdELE9BQU8sSUFBb0IsTUFBTSxTQUFTLENBQUM7QUFFM0M7O0dBRUc7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFpQixTQUFRLFlBQTBCO0lBS3ZFOzs7OztPQUtHO0lBQ0gsWUFDQyxHQUFRLEVBQ1IsUUFBaUMsRUFDakMsUUFBOEM7UUFFOUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQ3BCLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7YUFDbEUsTUFBTSxDQUFDLENBQUMsWUFBMEIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQzthQUN4RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDNUM7WUFDQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDO1NBQ3ZCLENBQ0QsQ0FBQztRQUNGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLEtBQWE7UUFDM0IsSUFBSSxLQUFLLEtBQUssRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7UUFFckQsT0FBTyxJQUFJLENBQUMsSUFBSTthQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUM7YUFDYixHQUFHLENBQUMsQ0FBQyxNQUFnQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxZQUEwQixFQUFFLEVBQWU7UUFDM0QsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNmLE9BQU8sRUFBRSxNQUFNO1lBQ2YsYUFBYSxFQUFFLEtBQUs7WUFDcEIsVUFBVSxFQUFFLFFBQVE7WUFDcEIsU0FBUyxFQUFFLFFBQVE7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDakMsSUFBSSxFQUFFLFlBQVksQ0FBQyxHQUFHO1NBQ3RCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsa0JBQWtCLENBQ2pCLFlBQTBCLEVBQzFCLEdBQStCO1FBRS9CLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWRpdG9yLCBOb3RpY2UsIFN1Z2dlc3RNb2RhbCwgQXBwIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBnZXRBY3RpdmVDYW52YXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7XG5cdEF1Z21lbnRlZENhbnZhc1NldHRpbmdzLFxuXHRTeXN0ZW1Qcm9tcHQsXG59IGZyb20gXCIuLi9zZXR0aW5ncy9BdWdtZW50ZWRDYW52YXNTZXR0aW5nc1wiO1xuaW1wb3J0IHsgY2FsY0hlaWdodCwgY3JlYXRlTm9kZSB9IGZyb20gXCIuLi9vYnNpZGlhbi9jYW52YXMtcGF0Y2hlc1wiO1xuaW1wb3J0IEZ1c2UsIHsgRnVzZVJlc3VsdCB9IGZyb20gXCJmdXNlLmpzXCI7XG5cbi8qKlxuICogQSBzZXJjaGFibGUgbW9kYWwgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gc2VsZWN0IGEgY2hlY2tib3ggc3RhdHVzIHN5bWJvbFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWlja0FjdGlvbk1vZGFsIGV4dGVuZHMgU3VnZ2VzdE1vZGFsPFN5c3RlbVByb21wdD4ge1xuXHRzZXR0aW5nczogQXVnbWVudGVkQ2FudmFzU2V0dGluZ3M7XG5cdGZ1c2U6IEZ1c2U8U3lzdGVtUHJvbXB0Pjtcblx0b25DaG9vc2U6IChzeXN0ZW1Qcm9tcHQ6IFN5c3RlbVByb21wdCkgPT4gdm9pZDtcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGFwcCBPYnNpZGlhbiBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gcGx1Z2luIHBsdWdpbiBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gZWRpdG9yIGVkaXRvciBpbnN0YW5jZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0c2V0dGluZ3M6IEF1Z21lbnRlZENhbnZhc1NldHRpbmdzLFxuXHRcdG9uQ2hvb3NlOiAoc3lzdGVtUHJvbXB0OiBTeXN0ZW1Qcm9tcHQpID0+IHZvaWRcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cdFx0dGhpcy5vbkNob29zZSA9IG9uQ2hvb3NlO1xuXG5cdFx0Y29uc3QgZnVzZSA9IG5ldyBGdXNlKFxuXHRcdFx0Wy4uLnRoaXMuc2V0dGluZ3MudXNlclN5c3RlbVByb21wdHMsIC4uLnRoaXMuc2V0dGluZ3Muc3lzdGVtUHJvbXB0c11cblx0XHRcdFx0LmZpbHRlcigoc3lzdGVtUHJvbXB0OiBTeXN0ZW1Qcm9tcHQpID0+IHN5c3RlbVByb21wdC5hY3QpXG5cdFx0XHRcdC5zb3J0KChhLCBiKSA9PiBhLmFjdC5sb2NhbGVDb21wYXJlKGIuYWN0KSksXG5cdFx0XHR7XG5cdFx0XHRcdGtleXM6IFtcImFjdFwiLCBcInByb21wdFwiXSxcblx0XHRcdH1cblx0XHQpO1xuXHRcdHRoaXMuZnVzZSA9IGZ1c2U7XG5cdH1cblxuXHQvKipcblx0ICogZmlsdGVycyB0aGUgY2hlY2tib3ggb3B0aW9uczsgdGhlIHJlc3VsdHMgYXJlIHVzZWQgYXMgc3VnZ2VzdGlvbnNcblx0ICogQHBhcmFtIHF1ZXJ5IHRoZSBzZWFyY2ggc3RyaW5nXG5cdCAqIEByZXR1cm5zIGNvbGxlY3Rpb24gb2Ygb3B0aW9uc1xuXHQgKi9cblx0Z2V0U3VnZ2VzdGlvbnMocXVlcnk6IHN0cmluZyk6IFN5c3RlbVByb21wdFtdIHtcblx0XHRpZiAocXVlcnkgPT09IFwiXCIpIHJldHVybiB0aGlzLnNldHRpbmdzLnN5c3RlbVByb21wdHM7XG5cblx0XHRyZXR1cm4gdGhpcy5mdXNlXG5cdFx0XHQuc2VhcmNoKHF1ZXJ5KVxuXHRcdFx0Lm1hcCgocmVzdWx0OiBGdXNlUmVzdWx0PFN5c3RlbVByb21wdD4pID0+IHJlc3VsdC5pdGVtKTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZW5kZXJzIGVhY2ggc3VnZ2VzdGlvblxuXHQgKiBAcGFyYW0gb3B0aW9uIHRoZSBjaGVja2JveCBvcHRpb24gdG8gZGlzcGxheVxuXHQgKiBAcGFyYW0gZWwgdGhlIHN1Z2dlc3Rpb24gSFRNTCBlbGVtZW50XG5cdCAqL1xuXHRyZW5kZXJTdWdnZXN0aW9uKHN5c3RlbVByb21wdDogU3lzdGVtUHJvbXB0LCBlbDogSFRNTEVsZW1lbnQpIHtcblx0XHRlbC5zZXRDc3NTdHlsZXMoe1xuXHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0XHRmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuXHRcdFx0YWxpZ25JdGVtczogXCJjZW50ZXJcIixcblx0XHRcdHRleHRBbGlnbjogXCJjZW50ZXJcIixcblx0XHR9KTtcblxuXHRcdGNvbnN0IGlucHV0ID0gZWwuY3JlYXRlRWwoXCJzcGFuXCIsIHtcblx0XHRcdHRleHQ6IHN5c3RlbVByb21wdC5hY3QsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlciBmb3Igd2hlbiB0aGUgdXNlciBjaG9vc2VzIGFuIG9wdGlvblxuXHQgKiBAcGFyYW0gb3B0aW9uIHRoZSBvcHRpb24gc2VsZWN0ZWQgYnkgdGhlIHVzZXJcblx0ICogQHBhcmFtIGV2dCB0aGUgdHJpZ2dlcmluZyBtb3VzZSBvciBrZXlib2FyZCBldmVudFxuXHQgKi9cblx0b25DaG9vc2VTdWdnZXN0aW9uKFxuXHRcdHN5c3RlbVByb21wdDogU3lzdGVtUHJvbXB0LFxuXHRcdGV2dDogTW91c2VFdmVudCB8IEtleWJvYXJkRXZlbnRcblx0KSB7XG5cdFx0dGhpcy5vbkNob29zZShzeXN0ZW1Qcm9tcHQpO1xuXHR9XG59XG4iXX0=