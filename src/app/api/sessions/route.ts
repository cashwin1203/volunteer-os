import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const centerId = searchParams.get('centerId');

    const where: any = {};
    if (centerId) where.centerId = centerId;

    const sessions = await prisma.session.findMany({
      where,
      include: {
        center: true,
        volunteerAttendances: {
          include: {
            volunteer: true,
          },
        },
        studentAttendances: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { sessionDate: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { centerId, sessionDate, startTime, endTime } = body;

    const center = await prisma.center.findUnique({
      where: { id: centerId },
      include: { volunteers: true, students: true },
    });

    if (!center) {
      return NextResponse.json({ error: 'Center not found' }, { status: 404 });
    }

    const session = await prisma.session.create({
      data: {
        centerId,
        sessionDate: new Date(sessionDate),
        startTime: startTime || '14:30',
        endTime: endTime || '17:30',
        status: 'UPCOMING',
      },
    });

    for (const vol of center.volunteers) {
      await prisma.volunteerAttendance.create({
        data: {
          sessionId: session.id,
          volunteerId: vol.id,
          rsvpStatus: 'PENDING',
          checkInStatus: 'PENDING',
        },
      });
    }

    for (const stud of center.students) {
      await prisma.studentAttendance.create({
        data: {
          sessionId: session.id,
          studentId: stud.id,
          status: 'PRESENT',
        },
      });
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, topicCovered, activitiesCompleted, challengesFaced, status } = body;

    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: {
        ...(topicCovered !== undefined && { topicCovered }),
        ...(activitiesCompleted !== undefined && { activitiesCompleted }),
        ...(challengesFaced !== undefined && { challengesFaced }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
