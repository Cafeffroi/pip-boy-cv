export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Skill {
  name: string;
  level: number; // 1-10
}

export interface Language {
  name: string;
  level: string; // e.g., "Native", "Fluent", "Professional"
}

export interface ResumeData {
  name: string;
  position: string;
  clearance: string;
  email: string;
  summary: string;
  resume: {
    experience: Experience[];
    technicalSkills: Skill[];
    softSkills: Skill[];
    languages: Language[];
    schools: Education[];
    hobbies: string[];
  };
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}
