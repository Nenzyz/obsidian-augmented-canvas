import { __awaiter } from "tslib";
// TODO : ask GPT and add subMenu items
export const handleCanvasMenu_Loading = (subMenu, questions, callback) => __awaiter(void 0, void 0, void 0, function* () {
    if (questions) {
        if (questions.length === 0) {
            subMenu.addItem((item) => {
                item
                    // .setIcon("fold-vertical")
                    .setTitle("No questions");
            });
        }
        else {
            questions.forEach((question) => subMenu.addItem((item) => {
                item
                    // .setIcon("fold-vertical")
                    .setTitle(question)
                    .onClick(() => __awaiter(void 0, void 0, void 0, function* () {
                    callback && (yield callback(question));
                }));
            }));
        }
    }
    else {
        subMenu.addItem((item) => {
            item
                // .setIcon("fold-vertical")
                .setTitle("loading...");
        });
    }
});
// TODO : ask GPT and add subMenu items
export const handleCanvasMenu_Loaded = (subMenu, questions, callback) => __awaiter(void 0, void 0, void 0, function* () {
    // subMenu.
    if (questions.length === 0) {
        subMenu.addItem((item) => {
            item
                // .setIcon("fold-vertical")
                .setTitle("No questions");
        });
    }
    else {
        questions.forEach((question) => subMenu.addItem((item) => {
            item
                // .setIcon("fold-vertical")
                .setTitle(question)
                .onClick(() => __awaiter(void 0, void 0, void 0, function* () {
                yield callback(question);
            }));
        }));
    }
    return subMenu;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsdUNBQXVDO0FBQ3ZDLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLENBQ3ZDLE9BQWEsRUFDYixTQUFvQixFQUNwQixRQUErQyxFQUM5QyxFQUFFO0lBQ0gsSUFBSSxTQUFTLEVBQUU7UUFDZCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFjLEVBQUUsRUFBRTtnQkFDbEMsSUFBSTtvQkFDSCw0QkFBNEI7cUJBQzNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztTQUNIO2FBQU07WUFDTixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBZ0IsRUFBRSxFQUFFLENBQ3RDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFjLEVBQUUsRUFBRTtnQkFDbEMsSUFBSTtvQkFDSCw0QkFBNEI7cUJBQzNCLFFBQVEsQ0FBQyxRQUFRLENBQUM7cUJBQ2xCLE9BQU8sQ0FBQyxHQUFTLEVBQUU7b0JBQ25CLFFBQVEsSUFBSSxDQUFDLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FDRixDQUFDO1NBQ0Y7S0FDRDtTQUFNO1FBQ04sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQWMsRUFBRSxFQUFFO1lBQ2xDLElBQUk7Z0JBQ0gsNEJBQTRCO2lCQUMzQixRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7S0FDSDtBQUNGLENBQUMsQ0FBQSxDQUFDO0FBRUYsdUNBQXVDO0FBQ3ZDLE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLENBQ3RDLE9BQWEsRUFDYixTQUFtQixFQUNuQixRQUE4QyxFQUM3QyxFQUFFO0lBQ0gsV0FBVztJQUNYLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQWMsRUFBRSxFQUFFO1lBQ2xDLElBQUk7Z0JBQ0gsNEJBQTRCO2lCQUMzQixRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7S0FDSDtTQUFNO1FBQ04sU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQWdCLEVBQUUsRUFBRSxDQUN0QyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBYyxFQUFFLEVBQUU7WUFDbEMsSUFBSTtnQkFDSCw0QkFBNEI7aUJBQzNCLFFBQVEsQ0FBQyxRQUFRLENBQUM7aUJBQ2xCLE9BQU8sQ0FBQyxHQUFTLEVBQUU7Z0JBQ25CLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FDRixDQUFDO0tBQ0Y7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDLENBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lbnUsIE1lbnVJdGVtIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbi8vIFRPRE8gOiBhc2sgR1BUIGFuZCBhZGQgc3ViTWVudSBpdGVtc1xuZXhwb3J0IGNvbnN0IGhhbmRsZUNhbnZhc01lbnVfTG9hZGluZyA9IGFzeW5jIChcblx0c3ViTWVudTogTWVudSxcblx0cXVlc3Rpb25zPzogc3RyaW5nW10sXG5cdGNhbGxiYWNrPzogKHF1ZXN0aW9uPzogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+XG4pID0+IHtcblx0aWYgKHF1ZXN0aW9ucykge1xuXHRcdGlmIChxdWVzdGlvbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRzdWJNZW51LmFkZEl0ZW0oKGl0ZW06IE1lbnVJdGVtKSA9PiB7XG5cdFx0XHRcdGl0ZW1cblx0XHRcdFx0XHQvLyAuc2V0SWNvbihcImZvbGQtdmVydGljYWxcIilcblx0XHRcdFx0XHQuc2V0VGl0bGUoXCJObyBxdWVzdGlvbnNcIik7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cXVlc3Rpb25zLmZvckVhY2goKHF1ZXN0aW9uOiBzdHJpbmcpID0+XG5cdFx0XHRcdHN1Yk1lbnUuYWRkSXRlbSgoaXRlbTogTWVudUl0ZW0pID0+IHtcblx0XHRcdFx0XHRpdGVtXG5cdFx0XHRcdFx0XHQvLyAuc2V0SWNvbihcImZvbGQtdmVydGljYWxcIilcblx0XHRcdFx0XHRcdC5zZXRUaXRsZShxdWVzdGlvbilcblx0XHRcdFx0XHRcdC5vbkNsaWNrKGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2sgJiYgKGF3YWl0IGNhbGxiYWNrKHF1ZXN0aW9uKSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHN1Yk1lbnUuYWRkSXRlbSgoaXRlbTogTWVudUl0ZW0pID0+IHtcblx0XHRcdGl0ZW1cblx0XHRcdFx0Ly8gLnNldEljb24oXCJmb2xkLXZlcnRpY2FsXCIpXG5cdFx0XHRcdC5zZXRUaXRsZShcImxvYWRpbmcuLi5cIik7XG5cdFx0fSk7XG5cdH1cbn07XG5cbi8vIFRPRE8gOiBhc2sgR1BUIGFuZCBhZGQgc3ViTWVudSBpdGVtc1xuZXhwb3J0IGNvbnN0IGhhbmRsZUNhbnZhc01lbnVfTG9hZGVkID0gYXN5bmMgKFxuXHRzdWJNZW51OiBNZW51LFxuXHRxdWVzdGlvbnM6IHN0cmluZ1tdLFxuXHRjYWxsYmFjazogKHF1ZXN0aW9uPzogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+XG4pID0+IHtcblx0Ly8gc3ViTWVudS5cblx0aWYgKHF1ZXN0aW9ucy5sZW5ndGggPT09IDApIHtcblx0XHRzdWJNZW51LmFkZEl0ZW0oKGl0ZW06IE1lbnVJdGVtKSA9PiB7XG5cdFx0XHRpdGVtXG5cdFx0XHRcdC8vIC5zZXRJY29uKFwiZm9sZC12ZXJ0aWNhbFwiKVxuXHRcdFx0XHQuc2V0VGl0bGUoXCJObyBxdWVzdGlvbnNcIik7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cXVlc3Rpb25zLmZvckVhY2goKHF1ZXN0aW9uOiBzdHJpbmcpID0+XG5cdFx0XHRzdWJNZW51LmFkZEl0ZW0oKGl0ZW06IE1lbnVJdGVtKSA9PiB7XG5cdFx0XHRcdGl0ZW1cblx0XHRcdFx0XHQvLyAuc2V0SWNvbihcImZvbGQtdmVydGljYWxcIilcblx0XHRcdFx0XHQuc2V0VGl0bGUocXVlc3Rpb24pXG5cdFx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdFx0YXdhaXQgY2FsbGJhY2socXVlc3Rpb24pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9XG5cblx0cmV0dXJuIHN1Yk1lbnU7XG59O1xuIl19