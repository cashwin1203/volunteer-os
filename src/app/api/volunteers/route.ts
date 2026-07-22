import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const centerId = searchParams.get('centerId');
    const status = searchParams.get('status');

    const where: any = {};
    if (centerId) where.centerId = centerId;
    if (status) where.status = status;

    const volunteers = await prisma.volunteer.findMany({
      where,
      include: {
        center: true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(volunteers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, role, skills, centerId } = body;

    const volunteer = await prisma.volunteer.create({
      data: {
        name,
        email,
        phone: phone || '',
        role: role || 'VOLUNTEER',
        status: 'ACTIVE',
        skills: skills || 'Teaching, General',
        centerId: centerId || null,
      },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, role, centerId } = body;

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(role && { role }),
        ...(centerId !== undefined && { centerId }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
