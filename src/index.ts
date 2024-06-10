import * as fs from "fs";
import { JSDOM } from "jsdom";
import * as readlineSync from "readline-sync";

interface TrackData {
  artist: string;
  title: string;
  startTime: string;
}

export const parseHtmlFile = (filePath: string): TrackData[] | null => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const dom = new JSDOM(data);
    const document = dom.window.document;

    const table = document.querySelector("table.border");
    if (!table) {
      console.error("Table not found");
      return null;
    }

    const trackData: TrackData[] = [];

    const rows = table.querySelectorAll("tr");
    // Skip the first row (header row)
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");
      if (cells.length >= 10) {
        // Adjust this condition based on the number of columns
        const artist = cells[3].textContent?.trim() || "";
        const title = cells[2].textContent?.trim() || "";
        const startTime = cells[26].textContent?.trim() || "";

        trackData.push({
          artist: artist,
          title: title,
          startTime: startTime,
        });
      }
    }

    return trackData;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
};

export const createtracklist = (trackData: TrackData[]): void => {
  // Convert start times to timestamps
  const firstStartTime = new Date(trackData[0].startTime).getTime();

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
    } else if (!artist) {
      // If artist is missing and title does not contain '-'
      artist = "N/A";
    }

    // Print the formatted time along with the artist and title
    console.log(`${formattedTime} ${artist} - ${title}`);
  });
};

const formatTime = (milliseconds: number): string => {
  const pad = (num: number): string => num.toString().padStart(2, "0");

  const hours = pad(Math.floor(milliseconds / (1000 * 60 * 60)));
  const minutes = pad(
    Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  );
  const seconds = pad(Math.floor((milliseconds % (1000 * 60)) / 1000));

  return `${hours}:${minutes}:${seconds}`;
};

const filePath = readlineSync
  .question("Enter the path to the HTML file: ")
  .trim();
console.log(filePath);

const cleanFilePath = (filePath: string): string => {
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

const parsedHtml = parseHtmlFile(cleanFilePath(filePath));

if (parsedHtml) {
  createtracklist(parsedHtml);
}
