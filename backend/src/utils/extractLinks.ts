import type { PDFPageProxy } from "pdfjs-dist";
import { ResumeLink } from "../config/types";

export async function extractLinks(
    page: PDFPageProxy
): Promise<ResumeLink[]> {
    
    const annotations = await page.getAnnotations();

    const links: ResumeLink[] = [];

    for (const annotation of annotations) {
        if (
            annotation.subtype === "Link" && "url" in annotation && annotation.url
        ) {
            links.push({
                url: annotation.url,
            });
        }
    }

    return links;
}