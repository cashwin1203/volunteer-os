import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalVolunteers = await prisma.volunteer.count();
    const activeVolunteers = await prisma.volunteer.count({ where: { status: 'ACTIVE' } });
    const atRiskVolunteers = await prisma.volunteer.count({ where: { status: 'AT_RISK' } });
    const totalCenters = await prisma.center.count();
    const totalStudents = await prisma.student.count();
    const completedSessions = await prisma.session.count({ where: { status: 'COMPLETED' } });

    const totalHoursAgg = await prisma.volunteer.aggregate({
      _sum: { totalHours: true },
    });
    const totalHours = totalHoursAgg._sum.totalHours || 0;

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
    });

    const recentSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { sessionDate: 'desc' },
      include: {
        center: true,
        volunteerAttendances: {
          include: { volunteer: true },
        },
      },
    });

    const atRiskList = await prisma.volunteer.findMany({
      where: { status: 'AT_RISK' },
      include: { center: true },
    });

    return NextResponse.json({
      metrics: {
        totalVolunteers,
        activeVolunteers,
        atRiskVolunteers,
        totalCenters,
        totalStudents,
        completedSessions,
        totalHours,
        volunteerRetentionRate: Math.round((activeVolunteers / (totalVolunteers || 1)) * 100),
      },
      centers,
      recentSessions,
      atRiskList,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
