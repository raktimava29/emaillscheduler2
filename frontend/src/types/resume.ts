export interface Project {
    name: string;
    technologies: string[];
    startDate?: string | null;
    endDate?: string | null;
    description: string[];
}

export interface Education {
    degree: string;
    institution: string;
    startDate?: string | null;
    endDate?: string | null;

    academicScore?: {
        gpa?: number | null;
        cgpa?: number | null;
        sgpa?: number | null;
        percentage?: number | null;
    } | null;

    location?: string | null;
}

export interface Experience {
    position?: string | null;
    company?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    location?: string | null;
    description: string[];
}

export interface ResumeLink {
    label?: string | null;
    url: string;
}

export interface ResumeParserResponse {
    name: string | null;
    phone: string | null;
    headline: string | null;
    summary: string | null;

    education: Education[];
    experience: Experience[];
    projects: Project[];

    skills: string[];
    certifications: string[];
    achievements: string[];

    links: ResumeLink[];

    confidenceScore: number;
}