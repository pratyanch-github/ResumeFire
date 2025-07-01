import { Template, SectionKey } from './types';
import ModernTemplate from './components/templates/ModernTemplate';
import ClassicTemplate from './components/templates/ClassicTemplate';

export const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    thumbnailUrl: 'https://picsum.photos/seed/modern/400/565',
    component: ModernTemplate,
  },
  {
    id: 'classic',
    name: 'Classic',
    thumbnailUrl: 'https://picsum.photos/seed/classic/400/565',
    component: ClassicTemplate,
  },
];

export const SECTIONS: { key: SectionKey; name: string }[] = [
    { key: 'summary', name: 'Professional Summary' },
    { key: 'experience', name: 'Work Experience' },
    { key: 'projects', name: 'Projects' },
    { key: 'skills', name: 'Skills' },
    { key: 'education', name: 'Education' },
];