export interface ActionLink {
  label: string;
  url: string;
  isExternal?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'mono';
}

export interface ProfileImageConfig {
  /** Image URL or imported asset path; if null/empty or disabled, graceful fallback is shown */
  url: string | null;
  alt: string;
  /** CSS object-position for repositioning (e.g. 'center', '50% 20%', 'top center') */
  objectPosition?: string;
  /** Scale factor for zoom adjustment (default: 1) */
  scale?: number;
  /** Toggle visibility of photo vs placeholder */
  enabled: boolean;
  /** Text shown on placeholder */
  fallbackText?: string;
  /** Monogram / initials fallback */
  monogram?: string;
}

export interface HeroSectionContent {
  statusBadge: {
    dotColor: 'emerald' | 'gold' | 'sage' | 'lavender';
    text: string;
  };
  roleBadge: string;
  greeting: string;
  name: string;
  identity: string;
  leadParagraph: string;
  ctaButtons: ActionLink[];
  interestChipsLabel: string;
  interestChips: string[];
  profileImage: ProfileImageConfig;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  badgeTone: 'emerald' | 'gold' | 'sage' | 'lavender';
  year: string;
  description: string;
  tags: string[];
  imageUrl?: string | null;
  imageAlt?: string;
  links: {
    details?: string;
    github?: string;
    demo?: string;
  };
}

export interface SelectedProjectsContent {
  eyebrow: string;
  title: string;
  description: string;
  viewAllLink: ActionLink;
  projects: ProjectItem[];
}

export interface AboutPreviewContent {
  eyebrow: string;
  title: string;
  lead: string;
  bioParagraphs: string[];
  principles: {
    title: string;
    description: string;
  }[];
  readMoreLink: ActionLink;
}

export interface SkillCategory {
  id: string;
  title: string;
  badgeLabel: string;
  badgeTone: 'emerald' | 'gold' | 'sage' | 'lavender';
  description: string;
  skills: {
    name: string;
    level?: string;
  }[];
}

export interface SkillsPreviewContent {
  eyebrow: string;
  title: string;
  description: string;
  viewAllLink?: ActionLink;
  categories: SkillCategory[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  location?: string;
  period: string;
  current?: boolean;
  description: string;
  technologies: string[];
}

export interface ExperiencePreviewContent {
  eyebrow: string;
  title: string;
  description: string;
  viewAllLink?: ActionLink;
  timeline: ExperienceItem[];
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface ContactContent {
  eyebrow: string;
  title: string;
  description: string;
  email: string;
  primaryAction: ActionLink;
  secondaryAction?: ActionLink;
  socialLinks: SocialLink[];
  availabilityNotice: string;
}

export interface HomePageContent {
  hero: HeroSectionContent;
  projects: SelectedProjectsContent;
  about: AboutPreviewContent;
  skills: SkillsPreviewContent;
  experience: ExperiencePreviewContent;
  contact: ContactContent;
}
