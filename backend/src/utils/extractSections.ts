import { ResumeSections } from "../config/types";
import { SECTION_ALIASES } from "./headingAliases";

function normalizeHeading(line: string): string {
    return line.toLowerCase()
        .replace(/[:\-]/g, "")
        .replace(/\s+/g," ")
        .trim();
}

function detetctHeading(
    heading: string
): keyof ResumeSections | null {
    
    const normalized = normalizeHeading(heading);

    for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
        if (
            aliases.includes(normalized as never)
        ) {
            return key as keyof ResumeSections;
        }
    }

    return null;
}

export function extractSections(
    resumeText: string
): ResumeSections {

    const lines = resumeText.split("\n")
        .map(line => line.trim())
        .filter(Boolean)

    const sections: ResumeSections = {};

    let currentKey: keyof ResumeSections | null = null;

    for (const line of lines) {
        const heading = detetctHeading(line);

        if (heading) {
            sections[heading] = {
                heading: line,
                content: ""
            };

            currentKey = heading;
            continue;
        }

        if (currentKey) {
            sections[currentKey]!.content += line + "\n";
        }
    }

    return sections;
}