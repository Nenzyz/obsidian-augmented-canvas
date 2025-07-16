import { __awaiter } from "tslib";
export const getWebsiteContent = (url) => __awaiter(void 0, void 0, void 0, function* () {
    // // console.log({ getWebsiteContent2: true })
    // const content = await fetch(url, {
    // 	// mode: "no-cors",
    // });
    // console.log({ content, body: content.body });
    // return {};
    // const getMDForTagName = (tagName: string) => {
    // 	if (tagName === "h1") {
    // 		return "#";
    // 	} else if (tagName === "h2") {
    // 		return "##";
    // 	} else if (tagName === "h3") {
    // 		return "###";
    // 	} else if (tagName === "h4") {
    // 		return "####";
    // 	} else if (tagName === "h5") {
    // 		return "#####";
    // 	} else if (tagName === "h6") {
    // 		return "######";
    // 	}
    // };
    // // let count = 0;
    // let textContent = "";
    // // const selectors = [];
    // // function fullPath(el) {
    // // 	var names = [];
    // // 	while (el.parentNode) {
    // // 		if (el.id) {
    // // 			names.unshift("#" + el.id);
    // // 			break;
    // // 		} else {
    // // 			if (el == el.ownerDocument.documentElement)
    // // 				names.unshift(el.tagName);
    // // 			else {
    // // 				for (
    // // 					var c = 1, e = el;
    // // 					e.previousElementSibling;
    // // 					e = e.previousElementSibling, c++
    // // 				);
    // // 				names.unshift(el.tagName + ":nth-child(" + c + ")");
    // // 			}
    // // 			el = el.parentNode;
    // // 		}
    // // 	}
    // // 	return names.join(" > ");
    // // }
    // // Function to traverse all elements in the DOM
    // function traverseDOM(element: Element): void {
    // 	// Process the current element
    // 	// console.log(element.tagName);
    // 	const includedTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];
    // 	// const excludedTags = ["script", "button"]
    // 	if (
    // 		includedTags.includes(element.tagName.toLowerCase())
    // 		// &&
    // 		// element.textContent.split(" ").length > 5
    // 	) {
    // 		const text = element.textContent
    // 			?.replace(/\n/g, " ")
    // 			.replace(/\\n/g, "")
    // 			.replace(/\t/g, "")
    // 			.replace(/\\t/g, "")
    // 			.trim();
    // 		// console.log({ text, tagName: element.tagName })
    // 		// * Example: 1. ### Title
    // 		textContent +=
    // 			"\n\n" +
    // 			// `${count}.` +
    // 			(element.tagName.toLowerCase() !== "p"
    // 				? getMDForTagName(element.tagName.toLowerCase()) + " "
    // 				: "") +
    // 			text;
    // 		// count++;
    // 		// const path = fullPath(element);
    // 		// selectors.push(path);
    // 		// document.querySelector(path).scrollIntoView()
    // 	}
    // 	// Recursively traverse child elements
    // 	Array.from(element.children).forEach((child) => {
    // 		traverseDOM(child);
    // 	});
    // }
    // // Example usage
    // // document.addEventListener('DOMContentLoaded', () => {
    // traverseDOM(document.documentElement);
    // // });
    // console.log({
    // 	// selectors,
    // 	textContent,
    // });
    // return {
    // 	textContent,
    // 	// selectors,
    // };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZUNvbnRlbnRVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnNpdGVDb250ZW50VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQU8sR0FBVyxFQUFFLEVBQUU7SUFDdEQsK0NBQStDO0lBQy9DLHFDQUFxQztJQUNyQyx1QkFBdUI7SUFDdkIsTUFBTTtJQUNOLGdEQUFnRDtJQUNoRCxhQUFhO0lBQ2IsaURBQWlEO0lBQ2pELDJCQUEyQjtJQUMzQixnQkFBZ0I7SUFDaEIsa0NBQWtDO0lBQ2xDLGlCQUFpQjtJQUNqQixrQ0FBa0M7SUFDbEMsa0JBQWtCO0lBQ2xCLGtDQUFrQztJQUNsQyxtQkFBbUI7SUFDbkIsa0NBQWtDO0lBQ2xDLG9CQUFvQjtJQUNwQixrQ0FBa0M7SUFDbEMscUJBQXFCO0lBQ3JCLEtBQUs7SUFDTCxLQUFLO0lBQ0wsb0JBQW9CO0lBQ3BCLHdCQUF3QjtJQUN4QiwyQkFBMkI7SUFDM0IsNkJBQTZCO0lBQzdCLHNCQUFzQjtJQUN0Qiw4QkFBOEI7SUFDOUIsb0JBQW9CO0lBQ3BCLG9DQUFvQztJQUNwQyxlQUFlO0lBQ2YsZ0JBQWdCO0lBQ2hCLG9EQUFvRDtJQUNwRCxvQ0FBb0M7SUFDcEMsZUFBZTtJQUNmLGVBQWU7SUFDZiw2QkFBNkI7SUFDN0Isb0NBQW9DO0lBQ3BDLDRDQUE0QztJQUM1QyxZQUFZO0lBQ1osOERBQThEO0lBQzlELFVBQVU7SUFDViw0QkFBNEI7SUFDNUIsU0FBUztJQUNULFFBQVE7SUFDUixnQ0FBZ0M7SUFDaEMsT0FBTztJQUNQLGtEQUFrRDtJQUNsRCxpREFBaUQ7SUFDakQsa0NBQWtDO0lBQ2xDLG9DQUFvQztJQUNwQyxtRUFBbUU7SUFDbkUsZ0RBQWdEO0lBQ2hELFFBQVE7SUFDUix5REFBeUQ7SUFDekQsVUFBVTtJQUNWLGlEQUFpRDtJQUNqRCxPQUFPO0lBQ1AscUNBQXFDO0lBQ3JDLDJCQUEyQjtJQUMzQiwwQkFBMEI7SUFDMUIseUJBQXlCO0lBQ3pCLDBCQUEwQjtJQUMxQixjQUFjO0lBQ2QsdURBQXVEO0lBQ3ZELCtCQUErQjtJQUMvQixtQkFBbUI7SUFDbkIsY0FBYztJQUNkLHNCQUFzQjtJQUN0Qiw0Q0FBNEM7SUFDNUMsNkRBQTZEO0lBQzdELGNBQWM7SUFDZCxXQUFXO0lBQ1gsZ0JBQWdCO0lBQ2hCLHVDQUF1QztJQUN2Qyw2QkFBNkI7SUFDN0IscURBQXFEO0lBQ3JELEtBQUs7SUFDTCwwQ0FBMEM7SUFDMUMscURBQXFEO0lBQ3JELHdCQUF3QjtJQUN4QixPQUFPO0lBQ1AsSUFBSTtJQUNKLG1CQUFtQjtJQUNuQiwyREFBMkQ7SUFDM0QseUNBQXlDO0lBQ3pDLFNBQVM7SUFDVCxnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixNQUFNO0lBQ04sV0FBVztJQUNYLGdCQUFnQjtJQUNoQixpQkFBaUI7SUFDakIsS0FBSztBQUNOLENBQUMsQ0FBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdldFdlYnNpdGVDb250ZW50ID0gYXN5bmMgKHVybDogc3RyaW5nKSA9PiB7XG5cdC8vIC8vIGNvbnNvbGUubG9nKHsgZ2V0V2Vic2l0ZUNvbnRlbnQyOiB0cnVlIH0pXG5cdC8vIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmZXRjaCh1cmwsIHtcblx0Ly8gXHQvLyBtb2RlOiBcIm5vLWNvcnNcIixcblx0Ly8gfSk7XG5cdC8vIGNvbnNvbGUubG9nKHsgY29udGVudCwgYm9keTogY29udGVudC5ib2R5IH0pO1xuXHQvLyByZXR1cm4ge307XG5cdC8vIGNvbnN0IGdldE1ERm9yVGFnTmFtZSA9ICh0YWdOYW1lOiBzdHJpbmcpID0+IHtcblx0Ly8gXHRpZiAodGFnTmFtZSA9PT0gXCJoMVwiKSB7XG5cdC8vIFx0XHRyZXR1cm4gXCIjXCI7XG5cdC8vIFx0fSBlbHNlIGlmICh0YWdOYW1lID09PSBcImgyXCIpIHtcblx0Ly8gXHRcdHJldHVybiBcIiMjXCI7XG5cdC8vIFx0fSBlbHNlIGlmICh0YWdOYW1lID09PSBcImgzXCIpIHtcblx0Ly8gXHRcdHJldHVybiBcIiMjI1wiO1xuXHQvLyBcdH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gXCJoNFwiKSB7XG5cdC8vIFx0XHRyZXR1cm4gXCIjIyMjXCI7XG5cdC8vIFx0fSBlbHNlIGlmICh0YWdOYW1lID09PSBcImg1XCIpIHtcblx0Ly8gXHRcdHJldHVybiBcIiMjIyMjXCI7XG5cdC8vIFx0fSBlbHNlIGlmICh0YWdOYW1lID09PSBcImg2XCIpIHtcblx0Ly8gXHRcdHJldHVybiBcIiMjIyMjI1wiO1xuXHQvLyBcdH1cblx0Ly8gfTtcblx0Ly8gLy8gbGV0IGNvdW50ID0gMDtcblx0Ly8gbGV0IHRleHRDb250ZW50ID0gXCJcIjtcblx0Ly8gLy8gY29uc3Qgc2VsZWN0b3JzID0gW107XG5cdC8vIC8vIGZ1bmN0aW9uIGZ1bGxQYXRoKGVsKSB7XG5cdC8vIC8vIFx0dmFyIG5hbWVzID0gW107XG5cdC8vIC8vIFx0d2hpbGUgKGVsLnBhcmVudE5vZGUpIHtcblx0Ly8gLy8gXHRcdGlmIChlbC5pZCkge1xuXHQvLyAvLyBcdFx0XHRuYW1lcy51bnNoaWZ0KFwiI1wiICsgZWwuaWQpO1xuXHQvLyAvLyBcdFx0XHRicmVhaztcblx0Ly8gLy8gXHRcdH0gZWxzZSB7XG5cdC8vIC8vIFx0XHRcdGlmIChlbCA9PSBlbC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudClcblx0Ly8gLy8gXHRcdFx0XHRuYW1lcy51bnNoaWZ0KGVsLnRhZ05hbWUpO1xuXHQvLyAvLyBcdFx0XHRlbHNlIHtcblx0Ly8gLy8gXHRcdFx0XHRmb3IgKFxuXHQvLyAvLyBcdFx0XHRcdFx0dmFyIGMgPSAxLCBlID0gZWw7XG5cdC8vIC8vIFx0XHRcdFx0XHRlLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG5cdC8vIC8vIFx0XHRcdFx0XHRlID0gZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLCBjKytcblx0Ly8gLy8gXHRcdFx0XHQpO1xuXHQvLyAvLyBcdFx0XHRcdG5hbWVzLnVuc2hpZnQoZWwudGFnTmFtZSArIFwiOm50aC1jaGlsZChcIiArIGMgKyBcIilcIik7XG5cdC8vIC8vIFx0XHRcdH1cblx0Ly8gLy8gXHRcdFx0ZWwgPSBlbC5wYXJlbnROb2RlO1xuXHQvLyAvLyBcdFx0fVxuXHQvLyAvLyBcdH1cblx0Ly8gLy8gXHRyZXR1cm4gbmFtZXMuam9pbihcIiA+IFwiKTtcblx0Ly8gLy8gfVxuXHQvLyAvLyBGdW5jdGlvbiB0byB0cmF2ZXJzZSBhbGwgZWxlbWVudHMgaW4gdGhlIERPTVxuXHQvLyBmdW5jdGlvbiB0cmF2ZXJzZURPTShlbGVtZW50OiBFbGVtZW50KTogdm9pZCB7XG5cdC8vIFx0Ly8gUHJvY2VzcyB0aGUgY3VycmVudCBlbGVtZW50XG5cdC8vIFx0Ly8gY29uc29sZS5sb2coZWxlbWVudC50YWdOYW1lKTtcblx0Ly8gXHRjb25zdCBpbmNsdWRlZFRhZ3MgPSBbXCJwXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCJdO1xuXHQvLyBcdC8vIGNvbnN0IGV4Y2x1ZGVkVGFncyA9IFtcInNjcmlwdFwiLCBcImJ1dHRvblwiXVxuXHQvLyBcdGlmIChcblx0Ly8gXHRcdGluY2x1ZGVkVGFncy5pbmNsdWRlcyhlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSlcblx0Ly8gXHRcdC8vICYmXG5cdC8vIFx0XHQvLyBlbGVtZW50LnRleHRDb250ZW50LnNwbGl0KFwiIFwiKS5sZW5ndGggPiA1XG5cdC8vIFx0KSB7XG5cdC8vIFx0XHRjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudFxuXHQvLyBcdFx0XHQ/LnJlcGxhY2UoL1xcbi9nLCBcIiBcIilcblx0Ly8gXHRcdFx0LnJlcGxhY2UoL1xcXFxuL2csIFwiXCIpXG5cdC8vIFx0XHRcdC5yZXBsYWNlKC9cXHQvZywgXCJcIilcblx0Ly8gXHRcdFx0LnJlcGxhY2UoL1xcXFx0L2csIFwiXCIpXG5cdC8vIFx0XHRcdC50cmltKCk7XG5cdC8vIFx0XHQvLyBjb25zb2xlLmxvZyh7IHRleHQsIHRhZ05hbWU6IGVsZW1lbnQudGFnTmFtZSB9KVxuXHQvLyBcdFx0Ly8gKiBFeGFtcGxlOiAxLiAjIyMgVGl0bGVcblx0Ly8gXHRcdHRleHRDb250ZW50ICs9XG5cdC8vIFx0XHRcdFwiXFxuXFxuXCIgK1xuXHQvLyBcdFx0XHQvLyBgJHtjb3VudH0uYCArXG5cdC8vIFx0XHRcdChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gXCJwXCJcblx0Ly8gXHRcdFx0XHQ/IGdldE1ERm9yVGFnTmFtZShlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSkgKyBcIiBcIlxuXHQvLyBcdFx0XHRcdDogXCJcIikgK1xuXHQvLyBcdFx0XHR0ZXh0O1xuXHQvLyBcdFx0Ly8gY291bnQrKztcblx0Ly8gXHRcdC8vIGNvbnN0IHBhdGggPSBmdWxsUGF0aChlbGVtZW50KTtcblx0Ly8gXHRcdC8vIHNlbGVjdG9ycy5wdXNoKHBhdGgpO1xuXHQvLyBcdFx0Ly8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXRoKS5zY3JvbGxJbnRvVmlldygpXG5cdC8vIFx0fVxuXHQvLyBcdC8vIFJlY3Vyc2l2ZWx5IHRyYXZlcnNlIGNoaWxkIGVsZW1lbnRzXG5cdC8vIFx0QXJyYXkuZnJvbShlbGVtZW50LmNoaWxkcmVuKS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuXHQvLyBcdFx0dHJhdmVyc2VET00oY2hpbGQpO1xuXHQvLyBcdH0pO1xuXHQvLyB9XG5cdC8vIC8vIEV4YW1wbGUgdXNhZ2Vcblx0Ly8gLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcblx0Ly8gdHJhdmVyc2VET00oZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcblx0Ly8gLy8gfSk7XG5cdC8vIGNvbnNvbGUubG9nKHtcblx0Ly8gXHQvLyBzZWxlY3RvcnMsXG5cdC8vIFx0dGV4dENvbnRlbnQsXG5cdC8vIH0pO1xuXHQvLyByZXR1cm4ge1xuXHQvLyBcdHRleHRDb250ZW50LFxuXHQvLyBcdC8vIHNlbGVjdG9ycyxcblx0Ly8gfTtcbn07XG4iXX0=