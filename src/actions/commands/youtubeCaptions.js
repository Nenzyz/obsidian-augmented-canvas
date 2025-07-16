import { __awaiter } from "tslib";
function getVideoSubtitles(settings, videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        // // TODO Convert to Oauth
        // const youtube = google.youtube({
        // 	version: "v3",
        // 	auth: settings.youtubeApiKey, // Replace with your API key
        // });
        // try {
        // 	const response = await youtube.captions.list({
        // 		part: ["snippet"],
        // 		videoId: videoId,
        // 	});
        // 	console.log({ response });
        // 	const items = response.data.items;
        // 	if (items) {
        // 		const subtitles = [];
        // 		for await (const caption of items) {
        // 			console.log({ caption });
        // 			try {
        // 				const response = await youtube.captions.download(
        // 					{
        // 						id: caption.id!,
        // 						tfmt: "ttml", // This specifies the format of the captions file. Options are 'ttml' or 'vtt' for example.
        // 					},
        // 					{
        // 						responseType: "text",
        // 					}
        // 				);
        // 				// The caption content will be in the response body as a string
        // 				subtitles.push(response.data as string);
        // 			} catch (error) {
        // 				console.error("Error downloading caption:", error);
        // 			}
        // 		}
        // 		return subtitles;
        // 	}
        // 	return [];
        // } catch (error) {
        // 	console.error("Error fetching video captions:", error);
        // 	return [];
        // }
    });
}
export const runYoutubeCaptions = (app, settings, videoUrl) => __awaiter(void 0, void 0, void 0, function* () {
    // const videoId = getYouTubeVideoId(videoUrl);
    // console.log({ videoId });
    // if (!videoId) return;
    // const subtitles = await getVideoSubtitles(settings, videoId);
    // console.log({ subtitles });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieW91dHViZUNhcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsieW91dHViZUNhcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxTQUFlLGlCQUFpQixDQUMvQixRQUFpQyxFQUNqQyxPQUFlOztRQUVmLDJCQUEyQjtRQUMzQixtQ0FBbUM7UUFDbkMsa0JBQWtCO1FBQ2xCLDhEQUE4RDtRQUM5RCxNQUFNO1FBQ04sUUFBUTtRQUNSLGtEQUFrRDtRQUNsRCx1QkFBdUI7UUFDdkIsc0JBQXNCO1FBQ3RCLE9BQU87UUFDUCw4QkFBOEI7UUFDOUIsc0NBQXNDO1FBQ3RDLGdCQUFnQjtRQUNoQiwwQkFBMEI7UUFDMUIseUNBQXlDO1FBQ3pDLCtCQUErQjtRQUMvQixXQUFXO1FBQ1gsd0RBQXdEO1FBQ3hELFNBQVM7UUFDVCx5QkFBeUI7UUFDekIsa0hBQWtIO1FBQ2xILFVBQVU7UUFDVixTQUFTO1FBQ1QsOEJBQThCO1FBQzlCLFNBQVM7UUFDVCxTQUFTO1FBQ1Qsc0VBQXNFO1FBQ3RFLCtDQUErQztRQUMvQyx1QkFBdUI7UUFDdkIsMERBQTBEO1FBQzFELE9BQU87UUFDUCxNQUFNO1FBQ04sc0JBQXNCO1FBQ3RCLEtBQUs7UUFDTCxjQUFjO1FBQ2Qsb0JBQW9CO1FBQ3BCLDJEQUEyRDtRQUMzRCxjQUFjO1FBQ2QsSUFBSTtJQUNMLENBQUM7Q0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQ2pDLEdBQVEsRUFDUixRQUFpQyxFQUNqQyxRQUFnQixFQUNmLEVBQUU7SUFDSCwrQ0FBK0M7SUFDL0MsNEJBQTRCO0lBQzVCLHdCQUF3QjtJQUN4QixnRUFBZ0U7SUFDaEUsOEJBQThCO0FBQy9CLENBQUMsQ0FBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBBdWdtZW50ZWRDYW52YXNTZXR0aW5ncyB9IGZyb20gXCJzcmMvc2V0dGluZ3MvQXVnbWVudGVkQ2FudmFzU2V0dGluZ3NcIjtcbmltcG9ydCB7IGdldFlvdVR1YmVWaWRlb0lkIH0gZnJvbSBcInNyYy91dGlsc1wiO1xuXG5pbXBvcnQgeyBnb29nbGUgfSBmcm9tIFwiZ29vZ2xlYXBpc1wiO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRWaWRlb1N1YnRpdGxlcyhcblx0c2V0dGluZ3M6IEF1Z21lbnRlZENhbnZhc1NldHRpbmdzLFxuXHR2aWRlb0lkOiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nW10+IHtcblx0Ly8gLy8gVE9ETyBDb252ZXJ0IHRvIE9hdXRoXG5cdC8vIGNvbnN0IHlvdXR1YmUgPSBnb29nbGUueW91dHViZSh7XG5cdC8vIFx0dmVyc2lvbjogXCJ2M1wiLFxuXHQvLyBcdGF1dGg6IHNldHRpbmdzLnlvdXR1YmVBcGlLZXksIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIEFQSSBrZXlcblx0Ly8gfSk7XG5cdC8vIHRyeSB7XG5cdC8vIFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCB5b3V0dWJlLmNhcHRpb25zLmxpc3Qoe1xuXHQvLyBcdFx0cGFydDogW1wic25pcHBldFwiXSxcblx0Ly8gXHRcdHZpZGVvSWQ6IHZpZGVvSWQsXG5cdC8vIFx0fSk7XG5cdC8vIFx0Y29uc29sZS5sb2coeyByZXNwb25zZSB9KTtcblx0Ly8gXHRjb25zdCBpdGVtcyA9IHJlc3BvbnNlLmRhdGEuaXRlbXM7XG5cdC8vIFx0aWYgKGl0ZW1zKSB7XG5cdC8vIFx0XHRjb25zdCBzdWJ0aXRsZXMgPSBbXTtcblx0Ly8gXHRcdGZvciBhd2FpdCAoY29uc3QgY2FwdGlvbiBvZiBpdGVtcykge1xuXHQvLyBcdFx0XHRjb25zb2xlLmxvZyh7IGNhcHRpb24gfSk7XG5cdC8vIFx0XHRcdHRyeSB7XG5cdC8vIFx0XHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCB5b3V0dWJlLmNhcHRpb25zLmRvd25sb2FkKFxuXHQvLyBcdFx0XHRcdFx0e1xuXHQvLyBcdFx0XHRcdFx0XHRpZDogY2FwdGlvbi5pZCEsXG5cdC8vIFx0XHRcdFx0XHRcdHRmbXQ6IFwidHRtbFwiLCAvLyBUaGlzIHNwZWNpZmllcyB0aGUgZm9ybWF0IG9mIHRoZSBjYXB0aW9ucyBmaWxlLiBPcHRpb25zIGFyZSAndHRtbCcgb3IgJ3Z0dCcgZm9yIGV4YW1wbGUuXG5cdC8vIFx0XHRcdFx0XHR9LFxuXHQvLyBcdFx0XHRcdFx0e1xuXHQvLyBcdFx0XHRcdFx0XHRyZXNwb25zZVR5cGU6IFwidGV4dFwiLFxuXHQvLyBcdFx0XHRcdFx0fVxuXHQvLyBcdFx0XHRcdCk7XG5cdC8vIFx0XHRcdFx0Ly8gVGhlIGNhcHRpb24gY29udGVudCB3aWxsIGJlIGluIHRoZSByZXNwb25zZSBib2R5IGFzIGEgc3RyaW5nXG5cdC8vIFx0XHRcdFx0c3VidGl0bGVzLnB1c2gocmVzcG9uc2UuZGF0YSBhcyBzdHJpbmcpO1xuXHQvLyBcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHQvLyBcdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkb3dubG9hZGluZyBjYXB0aW9uOlwiLCBlcnJvcik7XG5cdC8vIFx0XHRcdH1cblx0Ly8gXHRcdH1cblx0Ly8gXHRcdHJldHVybiBzdWJ0aXRsZXM7XG5cdC8vIFx0fVxuXHQvLyBcdHJldHVybiBbXTtcblx0Ly8gfSBjYXRjaCAoZXJyb3IpIHtcblx0Ly8gXHRjb25zb2xlLmVycm9yKFwiRXJyb3IgZmV0Y2hpbmcgdmlkZW8gY2FwdGlvbnM6XCIsIGVycm9yKTtcblx0Ly8gXHRyZXR1cm4gW107XG5cdC8vIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJ1bllvdXR1YmVDYXB0aW9ucyA9IGFzeW5jIChcblx0YXBwOiBBcHAsXG5cdHNldHRpbmdzOiBBdWdtZW50ZWRDYW52YXNTZXR0aW5ncyxcblx0dmlkZW9Vcmw6IHN0cmluZ1xuKSA9PiB7XG5cdC8vIGNvbnN0IHZpZGVvSWQgPSBnZXRZb3VUdWJlVmlkZW9JZCh2aWRlb1VybCk7XG5cdC8vIGNvbnNvbGUubG9nKHsgdmlkZW9JZCB9KTtcblx0Ly8gaWYgKCF2aWRlb0lkKSByZXR1cm47XG5cdC8vIGNvbnN0IHN1YnRpdGxlcyA9IGF3YWl0IGdldFZpZGVvU3VidGl0bGVzKHNldHRpbmdzLCB2aWRlb0lkKTtcblx0Ly8gY29uc29sZS5sb2coeyBzdWJ0aXRsZXMgfSk7XG59O1xuIl19