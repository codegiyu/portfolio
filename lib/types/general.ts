import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, ReactNode, RefAttributes, SVGProps, type JSX } from 'react';

export interface ChildrenOnly {
  children: ReactNode;
}

export interface TitleAndText {
  title: string;
  text: string;
}

export type SelectorFn<TStore, TResult> = (state: TStore) => TResult;

export type IconComp = (props: SVGProps<SVGSVGElement>) => JSX.Element;
export type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

export interface TitleAndIcon {
  title: string;
  Icon: IconComp;
}

export interface SelectOption<T = string> {
  text: string;
  altText?: string;
  value: T;
  disabled?: boolean;
  Icon?: IconComp;
}

export type NumberInString = `${number}`;

export type FormErrors<T extends object> = Partial<Record<keyof T, string[] | undefined>>;

export type ValidObjectTypeKey<T extends object, K> = {
  [X in keyof T]: T[X] extends K ? X : never;
}[keyof T];

// Blog types
export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  coverImage: string;
  author?: string;
  readingTime?: number;
  published: boolean;
  status?: 'draft' | 'published';
  publishAt?: string | null;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface BlogFrontmatter {
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  coverImage: string;
  author?: string;
  published?: boolean;
}

// Project types
export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  gallery?: string[];
  skills: string[];
  challenge?: string;
  solution?: string;
  results?: string;
  liveLink?: string;
  sourceLink?: string;
  featured: boolean;
  category?: 'web-app' | 'landing' | 'dashboard' | 'mobile' | 'other';
  status?: 'draft' | 'published';
  published?: boolean;
  publishAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  sortOrder?: number;
  version?: number;
}

// Settings types
export interface AboutSettings {
  greeting: string;
  name: string;
  role: string;
  bio: string;
  profileImage: string;
  cvUrl: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  alt: string;
}

export interface ContactItem {
  type: string;
  text: string;
  value: string;
}

export interface SkillsSettings {
  active: string[];
  icons: Record<string, string>;
}

export interface SpecialtyCard {
  label: string;
  description: string;
}

// Firestore docs can't be bare arrays, so array-typed settings use a wrapper field.
export interface SiteSettings {
  about: AboutSettings;
  social: { links: SocialLink[] };
  contact: { items: ContactItem[] };
  skills: SkillsSettings;
  specialties: { cards: SpecialtyCard[] };
}

export type SettingsKey = keyof SiteSettings;

// Admin types
export interface AdminUser {
  email: string;
  token: string;
  expiresAt: number;
}

// Analytics types
export interface AnalyticsBucket {
  label: string;
  count: number;
}

export interface AnalyticsSummary {
  days: number;
  pageViews: number;
  cvDownloads: number;
  topPages: AnalyticsBucket[];
  topReferrers: AnalyticsBucket[];
  topCountries: AnalyticsBucket[];
  browsers: AnalyticsBucket[];
  devices: AnalyticsBucket[];
}
