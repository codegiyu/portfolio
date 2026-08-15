import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, getProjectsBySkill, searchProjects } from '@/lib/projects';
import { requireAdmin } from '@/lib/server/auth/guard';
import { getDb } from '@/lib/firestore';
import { Project } from '@/lib/types/general';

async function getProjectsFromFirestore(): Promise<Project[]> {
  const db = getDb();
  const snapshot = await db.collection('projects').get();
  if (snapshot.empty) return [];
  const projects = snapshot.docs.map(doc => doc.data() as Project);
  projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.title.localeCompare(b.title);
  });
  return projects;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skill = searchParams.get('skill');
    const query = searchParams.get('q');

    // Try Firestore first
    let projects: Project[];
    try {
      const all = await getProjectsFromFirestore();
      if (all.length > 0) {
        if (query) {
          const q = query.toLowerCase();
          projects = all.filter(
            p =>
              p.title.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.skills.some(s => s.toLowerCase().includes(q))
          );
        } else if (skill) {
          projects = all.filter(p => p.skills.some(s => s.toLowerCase() === skill.toLowerCase()));
        } else {
          projects = all;
        }
        return NextResponse.json(projects, { status: 200 });
      }
    } catch {
      // Firestore unavailable — fall through to local
    }

    // Local JSON fallback
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
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

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

    const db = getDb();
    const existing = await db.collection('projects').doc(slug).get();
    if (existing.exists) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 409 }
      );
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

    await db.collection('projects').doc(slug).set(newProject);

    return NextResponse.json({ message: 'Project created', slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
