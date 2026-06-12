import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllProjects, getProjectsBySkill, searchProjects } from '@/lib/projects';
import { isValidMagicLinkToken } from '@/lib/firebase';
import { Project } from '@/lib/types/general';

const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && isValidMagicLinkToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skill = searchParams.get('skill');
    const query = searchParams.get('q');

    let projects;
    if (query) {
      projects = searchProjects(query);
    } else if (skill) {
      projects = getProjectsBySkill(skill);
    } else {
      projects = getAllProjects();
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, title } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'slug and title are required' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'slug must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      );
    }

    const projects: Project[] = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));

    if (projects.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 });
    }

    const newProject: Project = {
      id: slug,
      slug,
      title: body.title,
      description: body.description || '',
      longDescription: body.longDescription || '',
      image: body.image || '',
      gallery: body.gallery || [],
      skills: body.skills || [],
      challenge: body.challenge || '',
      solution: body.solution || '',
      results: body.results || '',
      liveLink: body.liveLink || '',
      sourceLink: body.sourceLink || '',
      featured: body.featured ?? false,
      category: body.category || 'other',
    };

    projects.push(newProject);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Project created', slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
