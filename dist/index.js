"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createtracklist = exports.parseHtmlFile = void 0;
const fs = __importStar(require("fs"));
const jsdom_1 = require("jsdom");
const readlineSync = __importStar(require("readline-sync"));
const parseHtmlFile = (filePath) => {
    var _a, _b, _c;
    try {
        const data = fs.readFileSync(filePath, "utf8");
        const dom = new jsdom_1.JSDOM(data);
        const document = dom.window.document;
        const table = document.querySelector("table.border");
        if (!table) {
            console.error("Table not found");
            return null;
        }
        const trackData = [];
        const rows = table.querySelectorAll("tr");
        // Skip the first row (header row)
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll("td");
            if (cells.length >= 10) {
                // Adjust this condition based on the number of columns
                const artist = ((_a = cells[3].textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                const title = ((_b = cells[2].textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
                const startTime = ((_c = cells[26].textContent) === null || _c === void 0 ? void 0 : _c.trim()) || "";
                trackData.push({
                    artist: artist,
                    title: title,
                    startTime: startTime,
                });
            }
        }
        return trackData;
    }
    catch (error) {
        console.error("Error reading file:", error);
        return null;
    }
};
exports.parseHtmlFile = parseHtmlFile;
const createtracklist = (trackData) => {
    // Convert start times to timestamps
    const firstStartTime = new Date(trackData[0].startTime).getTime();
    // Create the tracklist content
    let tracklistContent = "";
    // Calculate time elapsed since the beginning
    trackData.forEach((track) => {
        const timestamp = new Date(track.startTime).getTime();
        const elapsedTime = timestamp - firstStartTime;
        // Convert milliseconds to hh:mm:ss format
        const formattedTime = formatTime(elapsedTime);
        let artist = track.artist;
        let title = track.title;
        // If artist is missing and title contains '-'
        if (!artist && title.includes(" - ")) {
            [artist, title] = title.split(" - ");
        }
        else if (!artist) {
            // If artist is missing and title does not contain '-'
            artist = "N/A";
        }
        // Append the track information to the tracklist content
        tracklistContent += `${formattedTime} ${artist} - ${title}\n`;
    });
    // Get the current date and time
    const currentDateTime = new Date().toISOString().replace(/:/g, "-");
    // Define the file name with the current date and time
    const fileName = `tracklist_${currentDateTime}.txt`;
    // Write the tracklist content to the file
    fs.writeFileSync(fileName, tracklistContent);
    console.log(`Tracklist exported to ${fileName}`);
};
exports.createtracklist = createtracklist;
const formatTime = (milliseconds) => {
    const pad = (num) => num.toString().padStart(2, "0");
    const hours = pad(Math.floor(milliseconds / (1000 * 60 * 60)));
    const minutes = pad(Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = pad(Math.floor((milliseconds % (1000 * 60)) / 1000));
    return `${hours}:${minutes}:${seconds}`;
};
const filePath = readlineSync
    .question("Enter the path to the HTML file: ")
    .trim();
console.log(filePath);
const cleanFilePath = (filePath) => {
    // Fix for weird readlineSync behavior where it randomly adds a question mark at the beginning of the file path and then doubles it?
    // Check if the first character is a question mark
    if (filePath.charAt(0) === "?") {
        // Remove the first character
        filePath = filePath.substring(1);
    }
    // Remove anything after ".html" including ".html"
    const htmlIndex = filePath.indexOf(".html");
    if (htmlIndex !== -1) {
        filePath = filePath.substring(0, htmlIndex + 5); // +5 to include ".html"
    }
    return filePath;
};
const parsedHtml = (0, exports.parseHtmlFile)(cleanFilePath(filePath));
if (parsedHtml) {
    (0, exports.createtracklist)(parsedHtml);
}
