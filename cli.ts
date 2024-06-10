#!/usr/bin/env node

import * as fs from "fs";
import { program } from "commander";
import { parseHtmlFile, createtracklist } from "./src/index";

program
  .version("1.0.0", "-v, --version")
  .description("CLI tool to parse HTML track list and create a tracklist")
  .option("-f, --file <path>", "Path to the HTML file")
  .parse(process.argv);

const options = program.opts();

if (!options.file) {
  console.error(
    "Error: Please provide the path to the HTML file using -f or --file option."
  );
  process.exit(1);
}

if (!fs.existsSync(options.file)) {
  console.error("Error: File not found.");
  process.exit(1);
}

const parsedHtml = parseHtmlFile(options.file);
if (parsedHtml) {
  createtracklist(parsedHtml);
}
