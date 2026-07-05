import type { Education, Experience, Project } from "./resume";
import type { Role } from "./job";

export interface SkillMatch {
    jobSkill: string;
    resumeSkill: string;
}

export interface CandidateContext {
    candidateName: string | null;
    phone: string | null;
    email: string | null;

    links: {
        label?: string | null;
        url: string;
    }[];

    contactName: string | null;
    company: string | null;

    selectedRole: Role | null;

    joiningPreference: string | null;

    matchingSkills: SkillMatch[];

    missingSkills: string[];

    relevantProjects: Project[];

    relevantExperience: Experience[];

    education: Education[];

    achievements: string[];

    keywords: string[];

    confidenceScore: number;
}