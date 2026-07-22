import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const centers = await prisma.center.findMany({
      include: {
        city: true,
        _count: {
          select: {
            volunteers: true,
            students: true,
            sessions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(centers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location, dayOfWeek, slotTime, cityId, targetStudentCount, targetVolunteerCount } = body;

    const newCenter = await prisma.center.create({
      data: {
        name,
        location,
        dayOfWeek: dayOfWeek || 'Saturday',
        slotTime: slotTime || '2:30 PM - 5:30 PM',
        cityId,
        targetStudentCount: Number(targetStudentCount) || 40,
        targetVolunteerCount: Number(targetVolunteerCount) || 10,
      },
    });

    return NextResponse.json(newCenter, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isPausedForHoliday } = body;

    const updated = await prisma.center.update({
      where: { id },
      data: {
        ...(isPausedForHoliday !== undefined && { isPausedForHoliday }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
