import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/projects';
import { requireAdmin } from '@/lib/server/auth/guard';
import { getDb } from '@/lib/firestore';
import { Project } from '@/lib/types/general';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try Firestore first
    try {
      const db = getDb();
      const doc = await db.collection('projects').doc(slug).get();
      if (doc.exists) {
        return NextResponse.json(doc.data() as Project, { status: 200 });
      }
    } catch {
      // Firestore unavailable — fall through to local
    }

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

  try {
    const { slug } = await params;
    const body = await request.json();
    const db = getDb();

    const docRef = db.collection('projects').doc(slug);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const current = existing.data() as Project;
    const updated: Project = {
      ...current,
      title: body.title ?? current.title,
      description: body.description ?? current.description,
      longDescription: body.longDescription ?? current.longDescription,
      image: body.image ?? current.image,
      gallery: body.gallery ?? current.gallery,
      skills: body.skills ?? current.skills,
      challenge: body.challenge ?? current.challenge,
      solution: body.solution ?? current.solution,
      results: body.results ?? current.results,
      liveLink: body.liveLink ?? current.liveLink,
      sourceLink: body.sourceLink ?? current.sourceLink,
      featured: body.featured ?? current.featured,
      category: body.category ?? current.category,
    };

    await docRef.set(updated);

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
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

  try {
    const { slug } = await params;
    const db = getDb();
    const docRef = db.collection('projects').doc(slug);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
