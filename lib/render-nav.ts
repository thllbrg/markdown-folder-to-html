import { File, FileTree, IndexFile } from "./types";

export function renderTopNav(
  groupedFiles: FileTree<IndexFile>
): string {
  return `<ul>
    ${groupedFiles
      .filter(f => f.type === "dir")
      .map(f => {
        if (f.type === "dir") {
          const indexFile = getIndexFile(f.children);
          if (indexFile) {
            const link = renderActive(
              f.name,
              indexFile.value.href,
              indexFile.value.active
            );
            return `<li>${link}</li>\n`;
          }
        }
      })
      .join("\n")
      .trim()}
  </ul>`;
}

export function renderTopicNav(
  groupedFiles: FileTree<IndexFile>,
  render = false
): string {
  return `
    ${render ? '' : '<ul>'}
    ${groupedFiles
      .filter(f => f.type === "dir")
      .map(f => {
        if (f.type === "dir") {
          const indexFile = getIndexFile(f.children);
          if (indexFile && indexFile.value.active) {
            return `${renderTopicNav(f.children, true)}\n`;
          } else if (indexFile && render) {
            const link = renderActive(
              f.name,
              indexFile.value.href,
              indexFile.value.active
            );
            return `<li>${link}</li>\n`;
          }
        }
      })
      .join("\n")
      .trim()}
${render ? '' : '</ul>'}`;
}

export function renderPagesNav(
  groupedFiles: FileTree<IndexFile>,
  render = false
): string {
  return `
    ${groupedFiles
      .map(f => {
        if (f.type === "dir") {
          const indexFile = getIndexFile(f.children);
          if (indexFile && indexFile.value.active) {
            console.log('current file' + f.name);
            return `<ul>${renderPagesNav(f.children, true)}</ul>\n`;
          } else {
            return `${renderPagesNav(f.children, render)}\n`;
          }
        } else if (f.type === "file" && render) {

          if (f.value.text && f.value.text.toLowerCase() === "index") return;

          console.log('sub file: ' + f.value.text);
          const link = renderActive(
            f.value.text,
            f.value.href,
            false
          );
          return `<li>${link}</li>\n`;
        }
      })
      .join("\n")
      .trim()}`;
}

function renderActive(text: string, href: string, active: boolean) {
  return `<a class="${active ? "active" : ""}" href="${href}">${text}</a>`;
}

function getIndexFile(files: FileTree<IndexFile>): File<IndexFile> | undefined {
  return files.find(e => e.type === "file" && e.value.text === "index") as File<IndexFile>;
}