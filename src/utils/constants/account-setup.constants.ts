import {
  BookOpen,
  Code2,
  FlaskConical,
  Globe,
  Heart,
  Music,
  Palette,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

export type AvatarId = 'dragon' | 'eagle' | 'owl' | 'fox' | 'bear' | 'turtle';

export const AVATAR_OPTIONS: { id: AvatarId; emoji: string; label: string }[] =
  [
    { id: 'dragon', emoji: '🐉', label: 'Dragon' },
    { id: 'eagle', emoji: '🦅', label: 'Eagle' },
    { id: 'owl', emoji: '🦉', label: 'Owl' },
    { id: 'fox', emoji: '🦊', label: 'Fox' },
    { id: 'bear', emoji: '🐻', label: 'Bear' },
    { id: 'turtle', emoji: '🐢', label: 'Turtle' },
  ];

export type InterestId =
  | 'reading'
  | 'art'
  | 'coding'
  | 'music'
  | 'nature'
  | 'science'
  | 'languages'
  | 'wellness';

export const INTEREST_OPTIONS: {
  id: InterestId;
  label: string;
  icon: LucideIcon;
  swatchClass: string;
}[] = [
  {
    id: 'reading',
    label: 'Reading & Literature',
    icon: BookOpen,
    swatchClass: 'bg-amber-800 text-white',
  },
  {
    id: 'art',
    label: 'Art & Design',
    icon: Palette,
    swatchClass: 'bg-orange-200 text-amber-900',
  },
  {
    id: 'coding',
    label: 'Coding & Technology',
    icon: Code2,
    swatchClass: 'bg-teal-600 text-white',
  },
  {
    id: 'music',
    label: 'Music',
    icon: Music,
    swatchClass: 'bg-lime-200 text-lime-900',
  },
  {
    id: 'nature',
    label: 'Nature & Environment',
    icon: Sprout,
    swatchClass: 'bg-emerald-600 text-white',
  },
  {
    id: 'science',
    label: 'Science & Experiments',
    icon: FlaskConical,
    swatchClass: 'bg-amber-400 text-amber-950',
  },
  {
    id: 'languages',
    label: 'Languages',
    icon: Globe,
    swatchClass: 'bg-stone-300 text-stone-900',
  },
  {
    id: 'wellness',
    label: 'Wellness & Mindfulness',
    icon: Heart,
    swatchClass: 'bg-rose-200 text-rose-900',
  },
];

export type LearningStyleId =
  | 'hands-on'
  | 'reading-research'
  | 'videos-visuals'
  | 'guidance';

export const LEARNING_STYLE_OPTIONS: {
  id: LearningStyleId;
  label: string;
}[] = [
  { id: 'hands-on', label: 'Hands-on projects' },
  { id: 'reading-research', label: 'Reading & research' },
  { id: 'videos-visuals', label: 'Videos & visuals' },
  { id: 'guidance', label: 'With guidance' },
];
