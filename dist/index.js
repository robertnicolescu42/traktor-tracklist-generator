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
const fs = __importStar(require("fs"));
const jsdom_1 = require("jsdom");
const parseHtmlFile = (filePath) => {
    var _a, _b, _c, _d;
    const trackData = [];
    const data = fs.readFileSync(filePath, "utf8");
    const dom = new jsdom_1.JSDOM(data);
    const document = dom.window.document;
    const table = document.querySelector("table.border");
    if (!table) {
        console.error("Table not found");
        return trackData;
    }
    const rows = table.querySelectorAll("tr");
    // Skip the first row (header row)
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");
        if (cells.length >= 10) {
            // Adjust this condition based on the number of columns
            const artist = ((_a = cells[3].textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
            const title = ((_b = cells[2].textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
            const track = ((_c = cells[6].textContent) === null || _c === void 0 ? void 0 : _c.trim()) || "";
            const startTime = ((_d = cells[26].textContent) === null || _d === void 0 ? void 0 : _d.trim()) || "";
            trackData.push({
                artist: artist,
                title: title,
                startTime: startTime,
            });
        }
    }
    return trackData;
};
const createtracklist = (trackData) => {
    // Convert start times to timestamps
    const firstStartTime = new Date(trackData[0].startTime).getTime();
    // Calculate time elapsed since the beginning
    trackData.forEach((track) => {
        const timestamp = new Date(track.startTime).getTime();
        const elapsedTime = timestamp - firstStartTime;
        // Convert milliseconds to hh:mm:ss format
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60))
            .toString()
            .padStart(2, "0");
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60))
            .toString()
            .padStart(2, "0");
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000)
            .toString()
            .padStart(2, "0");
        const formattedTime = `${hours}:${minutes}:${seconds}`;
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
        // Print the formatted time along with the artist and title
        console.log(`${formattedTime} ${artist} - ${title}`);
    });
};
// Replace 'path/to/your/file.html' with the actual path to your HTML file
const filePath = "src/assets/history.html";
let parsedHtml = parseHtmlFile(filePath);
createtracklist(parsedHtml);
