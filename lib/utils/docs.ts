// Inject id attributes into h2/h3 tags for TOC anchor links
export function addHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_, level, attrs, inner) => {
    if (/\bid=/.test(attrs)) return _; // already has id
    const text = inner.replace(/<[^>]+>/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}
