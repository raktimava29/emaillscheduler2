
const GENERIC_WORDS = new Set([
    "hr", "hrd", "hiring", "career", "careers", "job", "jobs", "talent",
    "recruit", "recruiter", "recruiters", "recruiting", "recruitment",
    "recruitments", "acquisition", "apply", "application", "applications",
    "resume", "resumes", "cv", "info", "contact", "contactus", "support",
    "admin", "team", "hello", "hi", "mail", "office", "sales", "people",
    "staff", "work", "noreply", "no", "reply", "internship", "internships",
    "intern", "dev", "tech", "campus", "placement", "placements", "join",
    "joinus", "help", "general", "inquiry", "enquiry", "enquiries",
    "marketing", "finance", "accounts", "billing", "services", "connect",
    "opportunities", "opportunity", "openings", "vacancy", "vacancies",
]);

const WORD_RE = /^[a-z]{3,}(?:-[a-z]{2,})*$/i;

function titleCase(word: string): string {
    return word
        .toLowerCase()
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("-");
}

export function contactNameFromEmail(
    email: string | null | undefined
): string | null {
    if (!email) return null;

    const [rawLocal, domain = ""] = email.trim().split("@");
    const local = rawLocal?.split("+")[0];
    if (!local) return null;

    const parts = local.split(/[._]/);
    if (parts.length > 2) return null;

    for (const part of parts) {
        if (!WORD_RE.test(part)) return null;
        if (GENERIC_WORDS.has(part.toLowerCase())) return null;
    }

    const first = parts[0].toLowerCase();
    const domainName = domain.split(".")[0]?.toLowerCase();
    if (first === domainName) return null;

    return titleCase(first);
}
