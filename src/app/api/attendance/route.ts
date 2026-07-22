import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, id, rsvpStatus, checkInStatus, hoursLogged, notes, studentStatus } = body;

    if (type === 'VOLUNTEER') {
      const attendance = await prisma.volunteerAttendance.update({
        where: { id },
        data: {
          ...(rsvpStatus && { rsvpStatus }),
          ...(checkInStatus && { checkInStatus }),
          ...(hoursLogged !== undefined && { hoursLogged: Number(hoursLogged) }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          volunteer: true,
        },
      });

      // Recalculate volunteer total hours if present
      if (checkInStatus === 'PRESENT' && hoursLogged) {
        const total = await prisma.volunteerAttendance.aggregate({
          where: {
            volunteerId: attendance.volunteerId,
            checkInStatus: 'PRESENT',
          },
          _sum: {
            hoursLogged: true,
          },
        });

        await prisma.volunteer.update({
          where: { id: attendance.volunteerId },
          data: { totalHours: total._sum.hoursLogged || 0 },
        });
      }

      return NextResponse.json(attendance);
    } else if (type === 'STUDENT') {
      const attendance = await prisma.studentAttendance.update({
        where: { id },
        data: {
          ...(studentStatus && { status: studentStatus }),
          ...(notes !== undefined && { notes }),
        },
      });

      return NextResponse.json(attendance);
    }

    return NextResponse.json({ error: 'Invalid attendance type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
