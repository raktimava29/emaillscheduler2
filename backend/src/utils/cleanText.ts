export function cleanText(text: string): string {
    return text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\n{2,}/g, "\n")
        .replace(/\s{2,}/g, " ")
        .trim();
}