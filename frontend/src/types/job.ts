export interface Role {
    title: string;
    location: string | null;
    workMode: string | null;
    employmentType: string | null;
    experienceRequired: string | null;
    salary: string | null;
}

export interface JobParserResponse {
    recipientEmail: string | null;
    company: string | null;
    contactName: string | null;

    roles: Role[];
    selectedRole: Role | null;

    joiningPreference: string | null;
    jobLink: string | null;
    keywords: string[];

    confidenceScore: number;
}