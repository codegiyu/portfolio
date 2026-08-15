import fs from 'fs';
import path from 'path';
import { Project } from './types/general';

const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');

export function getProjectsData(): Project[] {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) {
      return [];
    }

    const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(fileContent) as Project[];
    return projects;
  } catch (error) {
    console.error('Error reading projects data:', error);
    return [];
  }
}

export function getAllProjects(): Project[] {
  return getProjectsData().sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });
}

export function getProjectBySlug(slug: string): Project | null {
  const projects = getProjectsData();
  return projects.find(p => p.slug === slug) || null;
}

export function getFeaturedProjects(count: number = 3): Project[] {
  return getProjectsData()
    .filter(p => p.featured)
    .slice(0, count);
}

export function getProjectsBySkill(skill: string): Project[] {
  return getProjectsData().filter(project =>
    project.skills.some(s => s.toLowerCase() === skill.toLowerCase())
  );
}

export function getProjectsByCategory(
  category: 'web-app' | 'landing' | 'dashboard' | 'mobile' | 'other'
): Project[] {
  return getProjectsData().filter(p => p.category === category);
}

export function getAllProjectSkills(): string[] {
  const projects = getProjectsData();
  const skills = new Set<string>();
  projects.forEach(project => {
    project.skills.forEach(skill => skills.add(skill));
  });
  return Array.from(skills).sort();
}

export function searchProjects(query: string): Project[] {
  const lowerQuery = query.toLowerCase();
  return getProjectsData().filter(
    project =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
  );
}
