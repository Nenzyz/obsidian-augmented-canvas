import { __awaiter } from "tslib";
import { Menu } from "obsidian";
import { CustomQuestionModal } from "../../modals/CustomQuestionModal";
import { handleCallGPT_Question, handleCallGPT_Questions, } from "../canvasNodeMenuActions/advancedCanvas";
import { handleCanvasMenu_Loading, handleCanvasMenu_Loaded } from "./utils";
export const handlePatchNoteMenu = (buttonEl_AskQuestions, menuEl, { app, settings, canvas, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const pos = buttonEl_AskQuestions.getBoundingClientRect();
    if (!buttonEl_AskQuestions.hasClass("has-active-menu")) {
        buttonEl_AskQuestions.toggleClass("has-active-menu", true);
        const menu = new Menu();
        // const containingNodes =
        // 	this.canvas.getContainingNodes(
        // 		this.selection.bbox
        // 	);
        const node = ((_a = Array.from(canvas.selection)) === null || _a === void 0 ? void 0 : _a.first());
        if (!node)
            return;
        handleCanvasMenu_Loading(menu, node.unknownData.questions, (question) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            if (!question) {
            }
            else {
                handleCallGPT_Question(app, settings, 
                // @ts-expect-error
                (_b = Array.from(canvas.selection)) === null || _b === void 0 ? void 0 : _b.first(), question);
            }
        }));
        menu.setParentElement(menuEl).showAtPosition({
            x: pos.x,
            y: pos.bottom,
            width: pos.width,
            overlap: true,
        });
        if (node.unknownData.questions)
            return;
        const questions = yield handleCallGPT_Questions(app, settings, node);
        if (!questions)
            return;
        node.unknownData.questions = questions;
        menu.hide();
        const menu2 = new Menu();
        handleCanvasMenu_Loaded(menu2, questions, (question) => __awaiter(void 0, void 0, void 0, function* () {
            var _c;
            if (!question) {
                let modal = new CustomQuestionModal(app, (question2) => {
                    var _a;
                    handleCallGPT_Question(app, settings, 
                    // @ts-expect-error
                    (_a = Array.from(canvas.selection)) === null || _a === void 0 ? void 0 : _a.first(), question2);
                    // Handle the input
                });
                modal.open();
            }
            else {
                handleCallGPT_Question(app, settings, 
                // @ts-expect-error
                (_c = Array.from(canvas.selection)) === null || _c === void 0 ? void 0 : _c.first(), question);
            }
        }));
        menu2.setParentElement(menuEl).showAtPosition({
            x: pos.x,
            y: pos.bottom,
            width: pos.width,
            overlap: true,
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZU1lbnVQYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vdGVNZW51UGF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBZSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHN0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdkUsT0FBTyxFQUNOLHNCQUFzQixFQUN0Qix1QkFBdUIsR0FDdkIsTUFBTSx5Q0FBeUMsQ0FBQztBQUNqRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFNUUsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsQ0FDbEMscUJBQXdDLEVBQ3hDLE1BQW1CLEVBQ25CLEVBQ0MsR0FBRyxFQUNILFFBQVEsRUFDUixNQUFNLEdBS04sRUFDQSxFQUFFOztJQUNILE1BQU0sR0FBRyxHQUFHLHFCQUFxQixDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDMUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQ3ZELHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3hCLDBCQUEwQjtRQUMxQixtQ0FBbUM7UUFDbkMsd0JBQXdCO1FBQ3hCLE1BQU07UUFFTixNQUFNLElBQUksR0FBMkIsQ0FDcEMsTUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsMENBQUUsS0FBSyxFQUFFLENBQ3JDLENBQUM7UUFDRixJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU87UUFFbEIsd0JBQXdCLENBQ3ZCLElBQUksRUFDSixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFDMUIsQ0FBTyxRQUFnQixFQUFFLEVBQUU7O1lBQzFCLElBQUksQ0FBQyxRQUFRLEVBQUU7YUFDZDtpQkFBTTtnQkFDTixzQkFBc0IsQ0FDckIsR0FBRyxFQUNILFFBQVE7Z0JBQ1IsbUJBQW1CO2dCQUNQLE1BQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDBDQUFFLEtBQUssRUFBRSxFQUNqRCxRQUFRLENBQ1IsQ0FBQzthQUNGO1FBQ0YsQ0FBQyxDQUFBLENBQ0QsQ0FBQztRQUNGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUM7WUFDNUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1lBQ2hCLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZDLE1BQU0sU0FBUyxHQUFHLE1BQU0sdUJBQXVCLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRXZDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVaLE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFFekIsdUJBQXVCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFPLFFBQWlCLEVBQUUsRUFBRTs7WUFDckUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxJQUFJLEtBQUssR0FBRyxJQUFJLG1CQUFtQixDQUNsQyxHQUFHLEVBQ0gsQ0FBQyxTQUFpQixFQUFFLEVBQUU7O29CQUNyQixzQkFBc0IsQ0FDckIsR0FBRyxFQUNILFFBQVE7b0JBQ1IsbUJBQW1CO29CQUNQLE1BQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDBDQUFFLEtBQUssRUFBRyxFQUNsRCxTQUFTLENBQ1QsQ0FBQztvQkFDRixtQkFBbUI7Z0JBQ3BCLENBQUMsQ0FDRCxDQUFDO2dCQUNGLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNiO2lCQUFNO2dCQUNOLHNCQUFzQixDQUNyQixHQUFHLEVBQ0gsUUFBUTtnQkFDUixtQkFBbUI7Z0JBQ1AsTUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsMENBQUUsS0FBSyxFQUFFLEVBQ2pELFFBQVEsQ0FDUixDQUFDO2FBQ0Y7UUFDRixDQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUM3QyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDUixDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU07WUFDYixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7WUFDaEIsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7S0FDSDtBQUNGLENBQUMsQ0FBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBDYW52YXMsIE1lbnUgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IENhbnZhc05vZGUgfSBmcm9tIFwiLi4vLi4vb2JzaWRpYW4vY2FudmFzLWludGVybmFsXCI7XG5pbXBvcnQgeyBBdWdtZW50ZWRDYW52YXNTZXR0aW5ncyB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9BdWdtZW50ZWRDYW52YXNTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQ3VzdG9tUXVlc3Rpb25Nb2RhbCB9IGZyb20gXCIuLi8uLi9tb2RhbHMvQ3VzdG9tUXVlc3Rpb25Nb2RhbFwiO1xuaW1wb3J0IHtcblx0aGFuZGxlQ2FsbEdQVF9RdWVzdGlvbixcblx0aGFuZGxlQ2FsbEdQVF9RdWVzdGlvbnMsXG59IGZyb20gXCIuLi9jYW52YXNOb2RlTWVudUFjdGlvbnMvYWR2YW5jZWRDYW52YXNcIjtcbmltcG9ydCB7IGhhbmRsZUNhbnZhc01lbnVfTG9hZGluZywgaGFuZGxlQ2FudmFzTWVudV9Mb2FkZWQgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlUGF0Y2hOb3RlTWVudSA9IGFzeW5jIChcblx0YnV0dG9uRWxfQXNrUXVlc3Rpb25zOiBIVE1MQnV0dG9uRWxlbWVudCxcblx0bWVudUVsOiBIVE1MRWxlbWVudCxcblx0e1xuXHRcdGFwcCxcblx0XHRzZXR0aW5ncyxcblx0XHRjYW52YXMsXG5cdH06IHtcblx0XHRhcHA6IEFwcDtcblx0XHRzZXR0aW5nczogQXVnbWVudGVkQ2FudmFzU2V0dGluZ3M7XG5cdFx0Y2FudmFzOiBDYW52YXM7XG5cdH1cbikgPT4ge1xuXHRjb25zdCBwb3MgPSBidXR0b25FbF9Bc2tRdWVzdGlvbnMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdGlmICghYnV0dG9uRWxfQXNrUXVlc3Rpb25zLmhhc0NsYXNzKFwiaGFzLWFjdGl2ZS1tZW51XCIpKSB7XG5cdFx0YnV0dG9uRWxfQXNrUXVlc3Rpb25zLnRvZ2dsZUNsYXNzKFwiaGFzLWFjdGl2ZS1tZW51XCIsIHRydWUpO1xuXHRcdGNvbnN0IG1lbnUgPSBuZXcgTWVudSgpO1xuXHRcdC8vIGNvbnN0IGNvbnRhaW5pbmdOb2RlcyA9XG5cdFx0Ly8gXHR0aGlzLmNhbnZhcy5nZXRDb250YWluaW5nTm9kZXMoXG5cdFx0Ly8gXHRcdHRoaXMuc2VsZWN0aW9uLmJib3hcblx0XHQvLyBcdCk7XG5cblx0XHRjb25zdCBub2RlID0gPENhbnZhc05vZGUgfCB1bmRlZmluZWQ+KFxuXHRcdFx0QXJyYXkuZnJvbShjYW52YXMuc2VsZWN0aW9uKT8uZmlyc3QoKVxuXHRcdCk7XG5cdFx0aWYgKCFub2RlKSByZXR1cm47XG5cblx0XHRoYW5kbGVDYW52YXNNZW51X0xvYWRpbmcoXG5cdFx0XHRtZW51LFxuXHRcdFx0bm9kZS51bmtub3duRGF0YS5xdWVzdGlvbnMsXG5cdFx0XHRhc3luYyAocXVlc3Rpb246IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXF1ZXN0aW9uKSB7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aGFuZGxlQ2FsbEdQVF9RdWVzdGlvbihcblx0XHRcdFx0XHRcdGFwcCxcblx0XHRcdFx0XHRcdHNldHRpbmdzLFxuXHRcdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdFx0PENhbnZhc05vZGU+QXJyYXkuZnJvbShjYW52YXMuc2VsZWN0aW9uKT8uZmlyc3QoKSxcblx0XHRcdFx0XHRcdHF1ZXN0aW9uXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0bWVudS5zZXRQYXJlbnRFbGVtZW50KG1lbnVFbCkuc2hvd0F0UG9zaXRpb24oe1xuXHRcdFx0eDogcG9zLngsXG5cdFx0XHR5OiBwb3MuYm90dG9tLFxuXHRcdFx0d2lkdGg6IHBvcy53aWR0aCxcblx0XHRcdG92ZXJsYXA6IHRydWUsXG5cdFx0fSk7XG5cblx0XHRpZiAobm9kZS51bmtub3duRGF0YS5xdWVzdGlvbnMpIHJldHVybjtcblxuXHRcdGNvbnN0IHF1ZXN0aW9ucyA9IGF3YWl0IGhhbmRsZUNhbGxHUFRfUXVlc3Rpb25zKGFwcCwgc2V0dGluZ3MsIG5vZGUpO1xuXHRcdGlmICghcXVlc3Rpb25zKSByZXR1cm47XG5cdFx0bm9kZS51bmtub3duRGF0YS5xdWVzdGlvbnMgPSBxdWVzdGlvbnM7XG5cblx0XHRtZW51LmhpZGUoKTtcblxuXHRcdGNvbnN0IG1lbnUyID0gbmV3IE1lbnUoKTtcblxuXHRcdGhhbmRsZUNhbnZhc01lbnVfTG9hZGVkKG1lbnUyLCBxdWVzdGlvbnMsIGFzeW5jIChxdWVzdGlvbj86IHN0cmluZykgPT4ge1xuXHRcdFx0aWYgKCFxdWVzdGlvbikge1xuXHRcdFx0XHRsZXQgbW9kYWwgPSBuZXcgQ3VzdG9tUXVlc3Rpb25Nb2RhbChcblx0XHRcdFx0XHRhcHAsXG5cdFx0XHRcdFx0KHF1ZXN0aW9uMjogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHRoYW5kbGVDYWxsR1BUX1F1ZXN0aW9uKFxuXHRcdFx0XHRcdFx0XHRhcHAsXG5cdFx0XHRcdFx0XHRcdHNldHRpbmdzLFxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0XHRcdDxDYW52YXNOb2RlPkFycmF5LmZyb20oY2FudmFzLnNlbGVjdGlvbik/LmZpcnN0KCkhLFxuXHRcdFx0XHRcdFx0XHRxdWVzdGlvbjJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHQvLyBIYW5kbGUgdGhlIGlucHV0XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRtb2RhbC5vcGVuKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRoYW5kbGVDYWxsR1BUX1F1ZXN0aW9uKFxuXHRcdFx0XHRcdGFwcCxcblx0XHRcdFx0XHRzZXR0aW5ncyxcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0PENhbnZhc05vZGU+QXJyYXkuZnJvbShjYW52YXMuc2VsZWN0aW9uKT8uZmlyc3QoKSxcblx0XHRcdFx0XHRxdWVzdGlvblxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG1lbnUyLnNldFBhcmVudEVsZW1lbnQobWVudUVsKS5zaG93QXRQb3NpdGlvbih7XG5cdFx0XHR4OiBwb3MueCxcblx0XHRcdHk6IHBvcy5ib3R0b20sXG5cdFx0XHR3aWR0aDogcG9zLndpZHRoLFxuXHRcdFx0b3ZlcmxhcDogdHJ1ZSxcblx0XHR9KTtcblx0fVxufTtcbiJdfQ==