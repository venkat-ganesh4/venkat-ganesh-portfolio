import type { HomePageContent } from '../types/homepage';
import heroImg from '../assets/hero.png';

/**
 * Centralized Homepage Content Source
 *
 * All editable homepage content is defined here, completely decoupled from
 * presentation components. Future admin CMS endpoints can read and update
 * this schema via REST or GraphQL.
 */
export const homepageContent: HomePageContent = {
  hero: {
    statusBadge: {
      dotColor: 'emerald',
      text: 'Available for collaborations',
    },
    roleBadge: 'Developer Portfolio',
    greeting: "Hi, I'm",
    name: 'Venkat Ganesh',
    identity: 'Software Developer | AI/ML Enthusiast',
    leadParagraph:
      'I build software, explore artificial intelligence, and experiment with computer vision. Always curious about new technologies and ideas.',
    ctaButtons: [
      {
        label: 'Explore My Work',
        url: '#projects',
        variant: 'primary',
      },
      {
        label: 'About Me',
        url: '#about',
        variant: 'secondary',
      },
      {
        label: 'Get in Touch →',
        url: '#contact',
        variant: 'ghost',
      },
    ],
    interestChipsLabel: 'Areas of Interest:',
    interestChips: [
      'Software Development',
      'Artificial Intelligence',
      'Computer Vision',
      'Interactive Web',
    ],
    profileImage: {
      url: heroImg,
      alt: 'Venkat Ganesh — Profile Visual',
      objectPosition: 'center 20%',
      scale: 1,
      enabled: true,
      fallbackText: 'Profile photo slot — configurable via CMS',
      monogram: 'VG',
    },
  },

  projects: {
    eyebrow: '// Selected Work',
    title: 'Featured Projects',
    description:
      'A curated collection of applications and technical experiments spanning software development, machine learning, and computer vision.',
    viewAllLink: {
      label: 'View All Projects →',
      url: '/projects',
    },
    projects: [
      {
        id: 'vision-perception',
        title: 'Real-Time Vision Perception Pipeline',
        slug: 'vision-perception',
        category: 'Computer Vision',
        badgeTone: 'emerald',
        year: '2025',
        description:
          'An exploration platform investigating camera stream processing, visual feature extraction, and real-time bounding box tracking for multi-object detection.',
        tags: ['Python', 'OpenCV', 'PyTorch', 'FastAPI'],
        imageUrl: null,
        imageAlt: 'Vision Perception Pipeline Architecture',
        links: {
          details: '/projects',
          github: 'https://github.com',
        },
      },
      {
        id: 'document-intelligence',
        title: 'Neural Document Intelligence',
        slug: 'document-intelligence',
        category: 'AI / Machine Learning',
        badgeTone: 'gold',
        year: '2025',
        description:
          'An automated document comprehension pipeline parsing structured data from raw images and PDFs using optical character recognition and multimodal models.',
        tags: ['Python', 'Transformers', 'OCR', 'Docker'],
        imageUrl: null,
        imageAlt: 'Document Intelligence System',
        links: {
          details: '/projects',
          github: 'https://github.com',
        },
      },
      {
        id: 'spatial-viz-studio',
        title: 'Spatial Data Visualization Studio',
        slug: 'spatial-viz-studio',
        category: 'Interactive Web',
        badgeTone: 'lavender',
        year: '2024',
        description:
          'A responsive web dashboard rendering large-scale spatial coordinate datasets with custom viewport canvas controls, interactive layers, and analytics widgets.',
        tags: ['React', 'TypeScript', 'Canvas API', 'Vite'],
        imageUrl: null,
        imageAlt: 'Spatial Data Visualization Interface',
        links: {
          details: '/projects',
          github: 'https://github.com',
        },
      },
    ],
  },

  about: {
    eyebrow: '// Personal Introduction',
    title: 'Curiosity-Driven Engineering',
    lead: 'Bridging software development with machine intelligence and computer vision.',
    bioParagraphs: [
      'I am a software developer with a deep passion for understanding how systems work under the hood. My journey combines pragmatic full-stack web development with ongoing exploration into machine learning and computer vision.',
      'Whether architecting clean component hierarchies, optimizing image processing pipelines, or experimenting with new model architectures, I value clarity, precision, and continuous learning.',
    ],
    principles: [
      {
        title: 'Craft & Precision',
        description:
          'Clean architecture, thoughtful component models, and tactile UI details built to endure.',
      },
      {
        title: 'Curiosity First',
        description:
          'Constantly experimenting with machine learning paradigms, modern algorithms, and visual processing.',
      },
      {
        title: 'User-Centric Design',
        description:
          'Ensuring accessible contrast, predictable interactions, and responsive layouts across every device.',
      },
    ],
    readMoreLink: {
      label: 'Read Full Story & Background →',
      url: '/about',
      variant: 'secondary',
    },
  },

  skills: {
    eyebrow: '// Technical Toolkit',
    title: 'Skills & Capabilities',
    description:
      'Technologies, frameworks, and domain knowledge I work with across software development and AI.',
    viewAllLink: {
      label: 'View Detailed Skills Matrix →',
      url: '/skills',
    },
    categories: [
      {
        id: 'software-engineering',
        title: 'Software Development',
        badgeLabel: 'SYSTEMS',
        badgeTone: 'emerald',
        description:
          'Building responsive web applications, modular state systems, and clean interfaces.',
        skills: [
          { name: 'TypeScript', level: 'Advanced' },
          { name: 'React 19', level: 'Advanced' },
          { name: 'JavaScript (ESNext)', level: 'Advanced' },
          { name: 'HTML5 & Modern CSS', level: 'Advanced' },
          { name: 'Node.js', level: 'Intermediate' },
          { name: 'RESTful APIs', level: 'Intermediate' },
          { name: 'Vite & Bundlers', level: 'Intermediate' },
        ],
      },
      {
        id: 'ai-ml',
        title: 'AI & Machine Learning',
        badgeLabel: 'INTELLIGENCE',
        badgeTone: 'gold',
        description:
          'Neural network architectures, model training pipelines, and data preprocessing workflows.',
        skills: [
          { name: 'Python', level: 'Advanced' },
          { name: 'PyTorch', level: 'Intermediate' },
          { name: 'TensorFlow', level: 'Intermediate' },
          { name: 'NumPy & Pandas', level: 'Advanced' },
          { name: 'Scikit-Learn', level: 'Intermediate' },
          { name: 'Model Evaluation', level: 'Intermediate' },
        ],
      },
      {
        id: 'computer-vision',
        title: 'Computer Vision',
        badgeLabel: 'PERCEPTION',
        badgeTone: 'lavender',
        description:
          'Image transformations, feature extraction, object tracking, and camera stream processing.',
        skills: [
          { name: 'OpenCV', level: 'Intermediate' },
          { name: 'Image Processing', level: 'Intermediate' },
          { name: 'Feature Detection', level: 'Intermediate' },
          { name: 'Object Tracking', level: 'Intermediate' },
          { name: 'Media Streams', level: 'Intermediate' },
        ],
      },
      {
        id: 'tools-practices',
        title: 'Developer Tooling & Practices',
        badgeLabel: 'WORKFLOW',
        badgeTone: 'sage',
        description:
          'Version control, containerization, performance profiling, and accessible web standards.',
        skills: [
          { name: 'Git & GitHub', level: 'Advanced' },
          { name: 'Docker', level: 'Intermediate' },
          { name: 'Linux / Bash', level: 'Intermediate' },
          { name: 'Accessibility (a11y)', level: 'Advanced' },
          { name: 'Performance Profiling', level: 'Intermediate' },
        ],
      },
    ],
  },

  experience: {
    eyebrow: '// Professional Journey',
    title: 'Experience & Milestones',
    description:
      'A concise overview of my development trajectory, technical projects, and continuous skill refinement.',
    viewAllLink: {
      label: 'View Complete Timeline →',
      url: '/experience',
    },
    timeline: [
      {
        id: 'exp-1',
        role: 'Software Developer',
        organization: 'Independent Engineering & Projects',
        location: 'Remote',
        period: '2024 — Present',
        current: true,
        description:
          'Architecting modern web applications and exploratory machine learning systems. Designing clean component libraries and high-performance interactive interfaces.',
        technologies: ['React', 'TypeScript', 'Python', 'Computer Vision', 'CSS Architecture'],
      },
      {
        id: 'exp-2',
        role: 'AI & Computer Vision Researcher / Builder',
        organization: 'Technical Explorations',
        location: 'Bengaluru, India',
        period: '2023 — 2024',
        current: false,
        description:
          'Investigated real-time vision pipelines, neural document extraction, and multimodal architectures. Authored technical notes on signal processing and perception algorithms.',
        technologies: ['PyTorch', 'OpenCV', 'Transformers', 'FastAPI'],
      },
      {
        id: 'exp-3',
        role: 'Computer Science & Software Foundations',
        organization: 'Engineering Education',
        location: 'India',
        period: 'Foundational Period',
        current: false,
        description:
          'Gained deep grounding in algorithms, data structures, object-oriented design, operating systems, and discrete mathematics.',
        technologies: ['C/C++', 'Python', 'Algorithms', 'Data Structures', 'Database Systems'],
      },
    ],
  },

  contact: {
    eyebrow: '// Get In Touch',
    title: "Let's build something thoughtful together.",
    description:
      'Whether you have an interesting software project, want to discuss machine learning and computer vision, or simply want to say hello, I would love to hear from you.',
    email: 'venkat@example.com',
    availabilityNotice: 'Currently open to software development opportunities & collaborations.',
    primaryAction: {
      label: 'Send Me an Email',
      url: 'mailto:venkat@example.com',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Explore About Page',
      url: '/about',
      variant: 'secondary',
    },
    socialLinks: [
      {
        platform: 'GitHub',
        label: 'GitHub',
        url: 'https://github.com',
        isExternal: true,
      },
      {
        platform: 'LinkedIn',
        label: 'LinkedIn',
        url: 'https://linkedin.com',
        isExternal: true,
      },
      {
        platform: 'Email',
        label: 'Direct Email',
        url: 'mailto:venkat@example.com',
        isExternal: false,
      },
    ],
  },
};
