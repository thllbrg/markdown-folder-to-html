import { stringify } from "querystring";

const contentS = "<!--CONTENT-->";
const navS = "<!--NAV-->";
const metadataS = "<!--METADATA-->";

export default function renderPage(
  template: string,
  navmenu: string,
  content: string,
  metadata: object
) {

  const header = generateMetadata(metadata);

  return template
    .split(navS)
    .join(navmenu)
    .split(metadataS)
    .join(header)
    .split(contentS)
    .join(content);
}


function generateMetadata(metadata: any) {
  let head = '';

  if (metadata.title) {
    head += `<title>${metadata.title}</title>`;
  }

  if (metadata.description) {
    head += `<meta name="description" content="${metadata.description}">`;
  }

  return head;
}