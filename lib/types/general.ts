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
}

// Admin types
export interface AdminUser {
  email: string;
  token: string;
  expiresAt: number;
}
