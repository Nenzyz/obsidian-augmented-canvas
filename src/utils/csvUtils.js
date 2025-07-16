export function parseCsv(csvString) {
    // Split the CSV string by line breaks to get an array of rows
    const rows = csvString.split("\n");
    // Map each row to an array of values (split by comma)
    return rows.map((row) => {
        // Handling potential quotes in CSV
        return (row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []).map((str) => str.slice(1, -1));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjc3ZVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFVBQVUsUUFBUSxDQUFDLFNBQWlCO0lBQ3pDLDhEQUE4RDtJQUM5RCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRW5DLHNEQUFzRDtJQUN0RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUN2QixtQ0FBbUM7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsOEJBQThCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQzNELENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNqQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ3N2KGNzdlN0cmluZzogc3RyaW5nKTogc3RyaW5nW11bXSB7XG5cdC8vIFNwbGl0IHRoZSBDU1Ygc3RyaW5nIGJ5IGxpbmUgYnJlYWtzIHRvIGdldCBhbiBhcnJheSBvZiByb3dzXG5cdGNvbnN0IHJvd3MgPSBjc3ZTdHJpbmcuc3BsaXQoXCJcXG5cIik7XG5cblx0Ly8gTWFwIGVhY2ggcm93IHRvIGFuIGFycmF5IG9mIHZhbHVlcyAoc3BsaXQgYnkgY29tbWEpXG5cdHJldHVybiByb3dzLm1hcCgocm93KSA9PiB7XG5cdFx0Ly8gSGFuZGxpbmcgcG90ZW50aWFsIHF1b3RlcyBpbiBDU1Zcblx0XHRyZXR1cm4gKHJvdy5tYXRjaCgvKFwiLio/XCJ8W15cIixdKykoPz1cXHMqLHxcXHMqJCkvZykgfHwgW10pLm1hcChcblx0XHRcdChzdHI6IHN0cmluZykgPT4gc3RyLnNsaWNlKDEsIC0xKVxuXHRcdCk7XG5cdH0pO1xufVxuIl19