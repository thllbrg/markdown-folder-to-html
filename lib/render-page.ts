const contentS = "<!--CONTENT-->";
const navS = "<!--NAV-->";
const navTopicsS = "<!--NAVTOPICS-->";
const navPostsS = "<!--NAV-POSTS-->";
const metadataS = "<!--METADATA-->";

export default function renderPage(
  template: string,
  navmenu: string,
  navTopicsHtml: string,
  navPostsHtml: string,
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
    .join(content)
    .split(navTopicsS)
    .join(navTopicsHtml)
    .split(navPostsS)
    .join(navPostsHtml);
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