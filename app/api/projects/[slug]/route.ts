import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getProjectBySlug } from '@/lib/projects';
import { isValidMagicLinkToken } from '@/lib/firebase';
import { Project } from '@/lib/types/general';

const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && isValidMagicLinkToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = getProjectBySlug(slug);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();

    const projects: Project[] = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    const index = projects.findIndex((p) => p.slug === slug);

    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    projects[index] = {
      ...projects[index],
      title: body.title ?? projects[index].title,
      description: body.description ?? projects[index].description,
      longDescription: body.longDescription ?? projects[index].longDescription,
      image: body.image ?? projects[index].image,
      skills: body.skills ?? projects[index].skills,
      challenge: body.challenge ?? projects[index].challenge,
      solution: body.solution ?? projects[index].solution,
      results: body.results ?? projects[index].results,
      liveLink: body.liveLink ?? projects[index].liveLink,
      sourceLink: body.sourceLink ?? projects[index].sourceLink,
      featured: body.featured ?? projects[index].featured,
      category: body.category ?? projects[index].category,
    };

    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Project updated', slug }, { status: 200 });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const projects: Project[] = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    const index = projects.findIndex((p) => p.slug === slug);

    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    projects.splice(index, 1);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
