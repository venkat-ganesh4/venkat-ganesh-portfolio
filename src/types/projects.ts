export type ProjectCategory = 'All' | 'Computer Vision' | 'AI / Machine Learning' | 'Interactive Web';

export interface ProjectDeliverable {
  title: string;
  description: string;
}

export interface ProjectDetailItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'Computer Vision' | 'AI / Machine Learning' | 'Interactive Web';
  badgeTone: 'emerald' | 'gold' | 'sage' | 'lavender';
  year: string;
  summary: string;
  problemStatement: string;
  architectureApproach: string;
  deliverables: ProjectDeliverable[];
  techStack: {
    name: string;
    role?: string;
  }[];
  keyLearnings?: string[];
  links: {
    github?: string;
    demo?: string;
  };
}

export interface ProjectsPageContent {
  eyebrow: string;
  title: string;
  description: string;
  categories: ProjectCategory[];
  projects: ProjectDetailItem[];
}
