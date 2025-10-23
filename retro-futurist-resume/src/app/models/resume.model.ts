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

export interface ResumeData {
  name: string;
  email: string;
  resume: {
    full: string;
    experience: Experience[];
    skills: Skill[];
    schools: Education[];
    hobbies: string[];
  };
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}
