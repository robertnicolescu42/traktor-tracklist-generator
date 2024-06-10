import * as fs from "fs";
import { JSDOM } from "jsdom";

interface trackData {
  artist: string;
  title: string;
  startTime: string;
  timeIntracklist?: string;
}

const parseHtmlFile = (filePath: string): trackData[] => {
  const trackData: trackData[] = [];

  const data = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(data);
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
};

const createtracklist = (trackData: trackData[]): void => {
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
    } else if (!artist) {
      // If artist is missing and title does not contain '-'
      artist = "N/A";
    }

    // Print the formatted time along with the artist and title
    console.log(`${formattedTime} ${artist} - ${title}`);
  });
};

const filePath = "src/assets/history.html";
let parsedHtml = parseHtmlFile(filePath);
createtracklist(parsedHtml);
