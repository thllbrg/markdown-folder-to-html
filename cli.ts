#! /usr/bin/env node

import fs from "fs";
import path from "path";
import sh from "shelljs";
import generateIndexInfo from "./lib/generate-index-info";
import groupByPath from "./lib/group-by-path";
import mdR from "./lib/markdown-regex";
import { md2html, md2yaml } from "./lib/markdown-to-html";
import mdUrl from "./lib/markdown-url-to-html";
import { renderPagesNav, renderTopicNav, renderTopNav } from "./lib/render-nav";
import page from "./lib/render-page";
import sortByPreferences from "./lib/sort-by-preferences";
import { FileTree, StringFile } from "./lib/types";


const [docsFolder, ...argsRest] = process.argv.slice(2);
const [...newPage] = process.argv.slice(2);

// Default parameters
const defaultFolder = "markdown";
const outputFolder = "./public";
const folder = path.resolve(docsFolder || defaultFolder);
const output = path.resolve(folder, "..", outputFolder);
const templateFolder = "templates";
const templateFilename = "template.html";
const mdTemplateFilename = "md-template.md";
const contentsFilename = "contents.json";
const preferences = ["index.md", "README.md"];

if (newPage && newPage.length === 2 && newPage[0] === 'page') {
  console.log(`${folder}`);
  fs.copyFile(`./${templateFolder}/${mdTemplateFilename}`, `./${defaultFolder}/${newPage[1]}`, () => {
    process.exit(0);
  });
} else {

  // Guards
  // Bail out if more than 1 args
  if (argsRest && argsRest.length > 0) {
    console.error("Too many arguments");
    usage(true);
  }

  // Bail out if the folder doesn't exist
  if (!fs.existsSync(folder)) {
    console.error(`Folder ${folder} not found.`);
    usage(true);
  }

  // Define template html, user's first, otherwise default
  let template = path.join(`./${templateFolder}`, templateFilename);
  if (!fs.existsSync(template)) {
    template = path.join(__dirname, defaultFolder, templateFolder, templateFilename);
  }
  const tpl = fs.readFileSync(template, "utf8");

  // Prepare output folder (create, clean, copy sources)
  fs.mkdirSync(output, { recursive: true });
  sh.rm("-rf", path.join(output, "*"));
  sh.cp("-R", path.join(folder, "*"), output);

  // Start processing. Outline:
  //
  // 1. Get all files
  // 2. Sort them
  // 3. Group them hierachically
  // 4. Parse files and generate output html files

  sh.cd(output);
  const all = sh.find("*");

  const mds = all
    .filter(file => file.match(mdR))
    .sort(sortByPreferences.bind(null, preferences))
    .map(file => {
      const content = sh.cat(file).toString(); // The result is a weird not-string
      return {
        path: file,
        url: mdUrl(file),
        content,
        html: md2html(content),
        metadata: md2yaml(content)
      };
    });

  const groupedMds: FileTree<StringFile> = mds.reduce(
    (grouped: FileTree<StringFile>, value) => groupByPath(grouped, value.path),
    []
  );
  mds.forEach(({ path, url, html, metadata }) => {
    const navHtml = renderTopNav(generateIndexInfo(path, groupedMds));
    const navTopicsHtml = renderTopicNav(generateIndexInfo(path, groupedMds));
    const navPostsHtml = renderPagesNav(generateIndexInfo(path, groupedMds));
    const pageHtml = page(tpl, navHtml, navTopicsHtml, navPostsHtml, html, metadata);
    fs.writeFileSync(url, pageHtml);
  });

  const contentsJSON = {
    paths: groupedMds,
    contents: mds.map((md, i) => ({ ...md, id: i }))
  };
  fs.writeFileSync(contentsFilename, JSON.stringify(contentsJSON, null, 2));

  sh.rm("-r", "**/*.md");

  function usage(error: boolean) {
    console.log(
      `
  Usage:

  markdown-folder-to-html [input-folder]
  input-folder [optional] defaults to \`docs\`

  markdown-folder-to-html page [output-file]
  output-file [required]
  `
    );
    process.exit(error ? 1 : 0);
  }
}