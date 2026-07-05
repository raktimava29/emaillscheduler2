"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractLinks = extractLinks;
async function extractLinks(page) {
    const annotations = await page.getAnnotations();
    const links = [];
    for (const annotation of annotations) {
        if (annotation.subtype === "Link" && "url" in annotation && annotation.url) {
            links.push({
                url: annotation.url,
            });
        }
    }
    return links;
}
