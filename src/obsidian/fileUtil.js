import { __asyncValues, __awaiter } from "tslib";
import { TFile, loadPdfJs, resolveSubpath, } from "obsidian";
export function readFileContent(app, file, subpath) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: remove frontmatter
        const body = yield app.vault.read(file);
        if (subpath) {
            const cache = app.metadataCache.getFileCache(file);
            if (cache) {
                const resolved = resolveSubpath(cache, subpath);
                if (!resolved) {
                    console.warn("Failed to get subpath", { file, subpath });
                    return body;
                }
                if (resolved.start || resolved.end) {
                    const subText = body.slice(resolved.start.offset, (_a = resolved.end) === null || _a === void 0 ? void 0 : _a.offset);
                    if (subText) {
                        return subText;
                    }
                    else {
                        console.warn("Failed to get subpath", { file, subpath });
                        return body;
                    }
                }
            }
        }
        return body;
    });
}
const pdfToMarkdown = (app, file) => __awaiter(void 0, void 0, void 0, function* () {
    const pdfjsLib = yield loadPdfJs();
    const pdfBuffer = yield app.vault.readBinary(file);
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = yield loadingTask.promise;
    const ebookTitle = file
        .path.split("/")
        .pop()
        .replace(/\.pdf$/i, "");
    let markdownContent = `# ${ebookTitle}

`;
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = yield pdf.getPage(pageNum);
        const textContent = yield page.getTextContent();
        let pageText = textContent.items
            .map((item) => item.str)
            .join(" ");
        // Here you would need to enhance the logic to convert the text into Markdown.
        // For example, you could detect headers, lists, tables, etc., and apply the appropriate Markdown formatting.
        // This can get quite complex depending on the structure and layout of the original PDF.
        // Add a page break after each page's content.
        markdownContent += pageText + "\n\n---\n\n";
    }
    return markdownContent;
});
const epubToMarkdown = (app, file) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO
    return "";
});
const readDifferentExtensionFileContent = (app, file) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log({ file });
    switch (file.extension) {
        case "md":
            const body = yield app.vault.cachedRead(file);
            return `## ${file.basename}\n${body}`;
        case "pdf":
            return pdfToMarkdown(app, file);
        case "epub":
            return epubToMarkdown(app, file);
        default:
            break;
    }
});
export function readNodeContent(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const app = node.app;
        const nodeData = node.getData();
        switch (nodeData.type) {
            case "text":
                return nodeData.text;
            case "file":
                const file = app.vault.getAbstractFileByPath(nodeData.file);
                if (file instanceof TFile) {
                    if (node.subpath) {
                        return yield readFileContent(app, file, nodeData.subpath);
                    }
                    else {
                        return readDifferentExtensionFileContent(app, file);
                    }
                }
                else {
                    console.debug("Cannot read from file type", file);
                }
        }
    });
}
export const getFilesContent = (app, files) => __awaiter(void 0, void 0, void 0, function* () {
    let content = "";
    for (const file of files) {
        const fileContent = yield readFileContent(app, file);
        content += `# ${file.basename}

${fileContent}

`;
    }
    return content;
});
export const updateNodeAndSave = (canvas, node, 
// TODO: only accepts .text .size not working (is it Obsidian API?)
nodeOptions) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log({ nodeOptions });
    // node.setText(nodeOptions.text);
    // @ts-expect-error
    node.setData(nodeOptions);
    yield canvas.requestSave();
});
export const generateFileName = (prefix = "file") => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = now.getUTCDate().toString().padStart(2, "0");
    const hours = now.getUTCHours().toString().padStart(2, "0");
    const minutes = now.getUTCMinutes().toString().padStart(2, "0");
    const seconds = now.getUTCSeconds().toString().padStart(2, "0");
    return `${prefix}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};
/*
 * Will read canvas node content || md note content
 * TODO add backlinks reading
 */
export const cachedReadFile = (app, file) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    if (file.path.endsWith(".canvas")) {
        const canvasJson = JSON.parse(yield app.vault.cachedRead(file));
        console.log({ canvasJson });
        const nodesContent = [];
        if (canvasJson.nodes) {
            try {
                for (var _b = __asyncValues(canvasJson.nodes), _c; _c = yield _b.next(), !_c.done;) {
                    const node = _c.value;
                    if (node.type === "text") {
                        nodesContent.push(node.text);
                    }
                    else if (node.type === "file") {
                        nodesContent.push(yield cachedReadFile(app, app.vault.getAbstractFileByPath(node.file)));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        // console.log({ canvas: { file, nodesContent } });
        return nodesContent.join("\n\n");
    }
    else {
        return yield app.vault.cachedRead(file);
    }
});
// TODO : if there is a canvas which link to a file in the same folder then the folder can be read two times
export const readFolderMarkdownContent = (app, folder) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log({ folder });
    var e_2, _d;
    const filesContent = [];
    try {
        for (var _e = __asyncValues(folder.children), _f; _f = yield _e.next(), !_f.done;) {
            const fileOrFolder = _f.value;
            if (fileOrFolder instanceof TFile) {
                // TODO special parsing for .canvas
                filesContent.push(`
# ${fileOrFolder.path}

${yield cachedReadFile(app, fileOrFolder)}
`.trim());
            }
            else {
                filesContent.push(`${yield readFolderMarkdownContent(app, fileOrFolder)}`);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_d = _e.return)) yield _d.call(_e);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return filesContent.join("\n\n");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaWxlVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUdOLEtBQUssRUFFTCxTQUFTLEVBQ1QsY0FBYyxHQUNkLE1BQU0sVUFBVSxDQUFDO0FBSWxCLE1BQU0sVUFBZ0IsZUFBZSxDQUNwQyxHQUFRLEVBQ1IsSUFBVyxFQUNYLE9BQTRCOzs7UUFFNUIsMkJBQTJCO1FBQzNCLE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFeEMsSUFBSSxPQUFPLEVBQUU7WUFDWixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxJQUFJLEtBQUssRUFBRTtnQkFDVixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNkLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDekQsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBQ0QsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7b0JBQ25DLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQ3pCLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUNyQixNQUFBLFFBQVEsQ0FBQyxHQUFHLDBDQUFFLE1BQU0sQ0FDcEIsQ0FBQztvQkFDRixJQUFJLE9BQU8sRUFBRTt3QkFDWixPQUFPLE9BQU8sQ0FBQztxQkFDZjt5QkFBTTt3QkFDTixPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7d0JBQ3pELE9BQU8sSUFB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QVksQ0FBQztDQUN4QyxDQUFDLElBQUksRUFBRSxDQUNKLENBQUM7YUFDRjtpQkFBTTtnQkFDTixZQUFZLENBQUMsSUFBSSxDQUNoQixHQUFHLE1BQU0seUJBQXlCLENBQ2pDLEdBQUcsRUFDSCxZQUF1QixDQUN2QixFQUFFLENBQ0gsQ0FBQzthQUNGO1NBQ0Q7Ozs7Ozs7OztJQUVELE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEFwcCxcblx0VEFic3RyYWN0RmlsZSxcblx0VEZpbGUsXG5cdFRGb2xkZXIsXG5cdGxvYWRQZGZKcyxcblx0cmVzb2x2ZVN1YnBhdGgsXG59IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgQ2FudmFzLCBDYW52YXNOb2RlLCBDcmVhdGVOb2RlT3B0aW9ucyB9IGZyb20gXCIuL2NhbnZhcy1pbnRlcm5hbFwiO1xuaW1wb3J0IHsgQXVnbWVudGVkQ2FudmFzU2V0dGluZ3MgfSBmcm9tIFwic3JjL3NldHRpbmdzL0F1Z21lbnRlZENhbnZhc1NldHRpbmdzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZUNvbnRlbnQoXG5cdGFwcDogQXBwLFxuXHRmaWxlOiBURmlsZSxcblx0c3VicGF0aD86IHN0cmluZyB8IHVuZGVmaW5lZFxuKSB7XG5cdC8vIFRPRE86IHJlbW92ZSBmcm9udG1hdHRlclxuXHRjb25zdCBib2R5ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG5cblx0aWYgKHN1YnBhdGgpIHtcblx0XHRjb25zdCBjYWNoZSA9IGFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRpZiAoY2FjaGUpIHtcblx0XHRcdGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVN1YnBhdGgoY2FjaGUsIHN1YnBhdGgpO1xuXHRcdFx0aWYgKCFyZXNvbHZlZCkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gZ2V0IHN1YnBhdGhcIiwgeyBmaWxlLCBzdWJwYXRoIH0pO1xuXHRcdFx0XHRyZXR1cm4gYm9keTtcblx0XHRcdH1cblx0XHRcdGlmIChyZXNvbHZlZC5zdGFydCB8fCByZXNvbHZlZC5lbmQpIHtcblx0XHRcdFx0Y29uc3Qgc3ViVGV4dCA9IGJvZHkuc2xpY2UoXG5cdFx0XHRcdFx0cmVzb2x2ZWQuc3RhcnQub2Zmc2V0LFxuXHRcdFx0XHRcdHJlc29sdmVkLmVuZD8ub2Zmc2V0XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChzdWJUZXh0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN1YlRleHQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGdldCBzdWJwYXRoXCIsIHsgZmlsZSwgc3VicGF0aCB9KTtcblx0XHRcdFx0XHRyZXR1cm4gYm9keTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBib2R5O1xufVxuXG5jb25zdCBwZGZUb01hcmtkb3duID0gYXN5bmMgKGFwcDogQXBwLCBmaWxlOiBURmlsZSkgPT4ge1xuXHRjb25zdCBwZGZqc0xpYiA9IGF3YWl0IGxvYWRQZGZKcygpO1xuXG5cdGNvbnN0IHBkZkJ1ZmZlciA9IGF3YWl0IGFwcC52YXVsdC5yZWFkQmluYXJ5KGZpbGUpO1xuXHRjb25zdCBsb2FkaW5nVGFzayA9IHBkZmpzTGliLmdldERvY3VtZW50KHsgZGF0YTogcGRmQnVmZmVyIH0pO1xuXHRjb25zdCBwZGYgPSBhd2FpdCBsb2FkaW5nVGFzay5wcm9taXNlO1xuXG5cdGNvbnN0IGVib29rVGl0bGUgPSBmaWxlXG5cdFx0LnBhdGghLnNwbGl0KFwiL1wiKVxuXHRcdC5wb3AoKSFcblx0XHQucmVwbGFjZSgvXFwucGRmJC9pLCBcIlwiKTtcblxuXHRsZXQgbWFya2Rvd25Db250ZW50ID0gYCMgJHtlYm9va1RpdGxlfVxuXG5gO1xuXG5cdGZvciAobGV0IHBhZ2VOdW0gPSAxOyBwYWdlTnVtIDw9IHBkZi5udW1QYWdlczsgcGFnZU51bSsrKSB7XG5cdFx0Y29uc3QgcGFnZSA9IGF3YWl0IHBkZi5nZXRQYWdlKHBhZ2VOdW0pO1xuXHRcdGNvbnN0IHRleHRDb250ZW50ID0gYXdhaXQgcGFnZS5nZXRUZXh0Q29udGVudCgpO1xuXG5cdFx0bGV0IHBhZ2VUZXh0ID0gdGV4dENvbnRlbnQuaXRlbXNcblx0XHRcdC5tYXAoKGl0ZW06IHsgc3RyOiBzdHJpbmcgfSkgPT4gaXRlbS5zdHIpXG5cdFx0XHQuam9pbihcIiBcIik7XG5cblx0XHQvLyBIZXJlIHlvdSB3b3VsZCBuZWVkIHRvIGVuaGFuY2UgdGhlIGxvZ2ljIHRvIGNvbnZlcnQgdGhlIHRleHQgaW50byBNYXJrZG93bi5cblx0XHQvLyBGb3IgZXhhbXBsZSwgeW91IGNvdWxkIGRldGVjdCBoZWFkZXJzLCBsaXN0cywgdGFibGVzLCBldGMuLCBhbmQgYXBwbHkgdGhlIGFwcHJvcHJpYXRlIE1hcmtkb3duIGZvcm1hdHRpbmcuXG5cdFx0Ly8gVGhpcyBjYW4gZ2V0IHF1aXRlIGNvbXBsZXggZGVwZW5kaW5nIG9uIHRoZSBzdHJ1Y3R1cmUgYW5kIGxheW91dCBvZiB0aGUgb3JpZ2luYWwgUERGLlxuXG5cdFx0Ly8gQWRkIGEgcGFnZSBicmVhayBhZnRlciBlYWNoIHBhZ2UncyBjb250ZW50LlxuXHRcdG1hcmtkb3duQ29udGVudCArPSBwYWdlVGV4dCArIFwiXFxuXFxuLS0tXFxuXFxuXCI7XG5cdH1cblxuXHRyZXR1cm4gbWFya2Rvd25Db250ZW50O1xufTtcblxuY29uc3QgZXB1YlRvTWFya2Rvd24gPSBhc3luYyAoYXBwOiBBcHAsIGZpbGU6IFRGaWxlKSA9PiB7XG5cdC8vIFRPRE9cblx0cmV0dXJuIFwiXCI7XG59O1xuXG5jb25zdCByZWFkRGlmZmVyZW50RXh0ZW5zaW9uRmlsZUNvbnRlbnQgPSBhc3luYyAoYXBwOiBBcHAsIGZpbGU6IFRGaWxlKSA9PiB7XG5cdC8vIGNvbnNvbGUubG9nKHsgZmlsZSB9KTtcblx0c3dpdGNoIChmaWxlLmV4dGVuc2lvbikge1xuXHRcdGNhc2UgXCJtZFwiOlxuXHRcdFx0Y29uc3QgYm9keSA9IGF3YWl0IGFwcC52YXVsdC5jYWNoZWRSZWFkKGZpbGUpO1xuXHRcdFx0cmV0dXJuIGAjIyAke2ZpbGUuYmFzZW5hbWV9XFxuJHtib2R5fWA7XG5cblx0XHRjYXNlIFwicGRmXCI6XG5cdFx0XHRyZXR1cm4gcGRmVG9NYXJrZG93bihhcHAsIGZpbGUpO1xuXG5cdFx0Y2FzZSBcImVwdWJcIjpcblx0XHRcdHJldHVybiBlcHViVG9NYXJrZG93bihhcHAsIGZpbGUpO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZE5vZGVDb250ZW50KG5vZGU6IENhbnZhc05vZGUpIHtcblx0Y29uc3QgYXBwID0gbm9kZS5hcHA7XG5cdGNvbnN0IG5vZGVEYXRhID0gbm9kZS5nZXREYXRhKCk7XG5cdHN3aXRjaCAobm9kZURhdGEudHlwZSkge1xuXHRcdGNhc2UgXCJ0ZXh0XCI6XG5cdFx0XHRyZXR1cm4gbm9kZURhdGEudGV4dDtcblx0XHRjYXNlIFwiZmlsZVwiOlxuXHRcdFx0Y29uc3QgZmlsZSA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9kZURhdGEuZmlsZSk7XG5cdFx0XHRpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG5cdFx0XHRcdGlmIChub2RlLnN1YnBhdGgpIHtcblx0XHRcdFx0XHRyZXR1cm4gYXdhaXQgcmVhZEZpbGVDb250ZW50KGFwcCwgZmlsZSwgbm9kZURhdGEuc3VicGF0aCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlYWREaWZmZXJlbnRFeHRlbnNpb25GaWxlQ29udGVudChhcHAsIGZpbGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmRlYnVnKFwiQ2Fubm90IHJlYWQgZnJvbSBmaWxlIHR5cGVcIiwgZmlsZSk7XG5cdFx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGdldEZpbGVzQ29udGVudCA9IGFzeW5jIChhcHA6IEFwcCwgZmlsZXM6IFRGaWxlW10pID0+IHtcblx0bGV0IGNvbnRlbnQgPSBcIlwiO1xuXG5cdGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuXHRcdGNvbnN0IGZpbGVDb250ZW50ID0gYXdhaXQgcmVhZEZpbGVDb250ZW50KGFwcCwgZmlsZSk7XG5cblx0XHRjb250ZW50ICs9IGAjICR7ZmlsZS5iYXNlbmFtZX1cblxuJHtmaWxlQ29udGVudH1cblxuYDtcblx0fVxuXG5cdHJldHVybiBjb250ZW50O1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZU5vZGVBbmRTYXZlID0gYXN5bmMgKFxuXHRjYW52YXM6IENhbnZhcyxcblx0bm9kZTogQ2FudmFzTm9kZSxcblx0Ly8gVE9ETzogb25seSBhY2NlcHRzIC50ZXh0IC5zaXplIG5vdCB3b3JraW5nIChpcyBpdCBPYnNpZGlhbiBBUEk/KVxuXHRub2RlT3B0aW9uczogQ3JlYXRlTm9kZU9wdGlvbnNcbikgPT4ge1xuXHQvLyBjb25zb2xlLmxvZyh7IG5vZGVPcHRpb25zIH0pO1xuXHQvLyBub2RlLnNldFRleHQobm9kZU9wdGlvbnMudGV4dCk7XG5cdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0bm9kZS5zZXREYXRhKG5vZGVPcHRpb25zKTtcblx0YXdhaXQgY2FudmFzLnJlcXVlc3RTYXZlKCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVGaWxlTmFtZSA9IChwcmVmaXg6IHN0cmluZyA9IFwiZmlsZVwiKTogc3RyaW5nID0+IHtcblx0Y29uc3Qgbm93ID0gbmV3IERhdGUoKTtcblx0Y29uc3QgeWVhciA9IG5vdy5nZXRVVENGdWxsWWVhcigpO1xuXHRjb25zdCBtb250aCA9IChub3cuZ2V0VVRDTW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkYXkgPSBub3cuZ2V0VVRDRGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBob3VycyA9IG5vdy5nZXRVVENIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBtaW51dGVzID0gbm93LmdldFVUQ01pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3Qgc2Vjb25kcyA9IG5vdy5nZXRVVENTZWNvbmRzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cblx0cmV0dXJuIGAke3ByZWZpeH1fJHt5ZWFyfS0ke21vbnRofS0ke2RheX1fJHtob3Vyc30tJHttaW51dGVzfS0ke3NlY29uZHN9YDtcbn07XG5cbi8qXG4gKiBXaWxsIHJlYWQgY2FudmFzIG5vZGUgY29udGVudCB8fCBtZCBub3RlIGNvbnRlbnRcbiAqIFRPRE8gYWRkIGJhY2tsaW5rcyByZWFkaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBjYWNoZWRSZWFkRmlsZSA9IGFzeW5jIChhcHA6IEFwcCwgZmlsZTogVEZpbGUpID0+IHtcblx0aWYgKGZpbGUucGF0aC5lbmRzV2l0aChcIi5jYW52YXNcIikpIHtcblx0XHRjb25zdCBjYW52YXNKc29uID0gSlNPTi5wYXJzZShhd2FpdCBhcHAudmF1bHQuY2FjaGVkUmVhZChmaWxlKSk7XG5cdFx0Y29uc29sZS5sb2coeyBjYW52YXNKc29uIH0pO1xuXG5cdFx0Y29uc3Qgbm9kZXNDb250ZW50OiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0aWYgKGNhbnZhc0pzb24ubm9kZXMpIHtcblx0XHRcdGZvciBhd2FpdCAoY29uc3Qgbm9kZSBvZiBjYW52YXNKc29uLm5vZGVzKSB7XG5cdFx0XHRcdGlmIChub2RlLnR5cGUgPT09IFwidGV4dFwiKSB7XG5cdFx0XHRcdFx0bm9kZXNDb250ZW50LnB1c2gobm9kZS50ZXh0ISk7XG5cdFx0XHRcdH0gZWxzZSBpZiAobm9kZS50eXBlID09PSBcImZpbGVcIikge1xuXHRcdFx0XHRcdG5vZGVzQ29udGVudC5wdXNoKFxuXHRcdFx0XHRcdFx0YXdhaXQgY2FjaGVkUmVhZEZpbGUoXG5cdFx0XHRcdFx0XHRcdGFwcCxcblx0XHRcdFx0XHRcdFx0YXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChub2RlLmZpbGUhKSBhcyBURmlsZVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBjb25zb2xlLmxvZyh7IGNhbnZhczogeyBmaWxlLCBub2Rlc0NvbnRlbnQgfSB9KTtcblxuXHRcdHJldHVybiBub2Rlc0NvbnRlbnQuam9pbihcIlxcblxcblwiKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gYXdhaXQgYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG5cdH1cbn07XG5cbi8vIFRPRE8gOiBpZiB0aGVyZSBpcyBhIGNhbnZhcyB3aGljaCBsaW5rIHRvIGEgZmlsZSBpbiB0aGUgc2FtZSBmb2xkZXIgdGhlbiB0aGUgZm9sZGVyIGNhbiBiZSByZWFkIHR3byB0aW1lc1xuZXhwb3J0IGNvbnN0IHJlYWRGb2xkZXJNYXJrZG93bkNvbnRlbnQgPSBhc3luYyAoYXBwOiBBcHAsIGZvbGRlcjogVEZvbGRlcikgPT4ge1xuXHQvLyBjb25zb2xlLmxvZyh7IGZvbGRlciB9KTtcblxuXHRjb25zdCBmaWxlc0NvbnRlbnQ6IHN0cmluZ1tdID0gW107XG5cdGZvciBhd2FpdCAoY29uc3QgZmlsZU9yRm9sZGVyIG9mIGZvbGRlci5jaGlsZHJlbikge1xuXHRcdGlmIChmaWxlT3JGb2xkZXIgaW5zdGFuY2VvZiBURmlsZSkge1xuXHRcdFx0Ly8gVE9ETyBzcGVjaWFsIHBhcnNpbmcgZm9yIC5jYW52YXNcblx0XHRcdGZpbGVzQ29udGVudC5wdXNoKFxuXHRcdFx0XHRgXG4jICR7ZmlsZU9yRm9sZGVyLnBhdGh9XG5cbiR7YXdhaXQgY2FjaGVkUmVhZEZpbGUoYXBwLCBmaWxlT3JGb2xkZXIpfVxuYC50cmltKClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVzQ29udGVudC5wdXNoKFxuXHRcdFx0XHRgJHthd2FpdCByZWFkRm9sZGVyTWFya2Rvd25Db250ZW50KFxuXHRcdFx0XHRcdGFwcCxcblx0XHRcdFx0XHRmaWxlT3JGb2xkZXIgYXMgVEZvbGRlclxuXHRcdFx0XHQpfWBcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGZpbGVzQ29udGVudC5qb2luKFwiXFxuXFxuXCIpO1xufTtcbiJdfQ==