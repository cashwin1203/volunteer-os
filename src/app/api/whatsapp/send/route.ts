import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logSecurityAudit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { centerId, type, reason } = await req.json();

    const center = await prisma.center.findUnique({
      where: { id: centerId },
      include: {
        volunteers: true,
      },
    });

    if (!center) {
      return NextResponse.json({ error: 'Center not found' }, { status: 404 });
    }

    // 1. Emergency Session Cancellation Broadcast
    if (type === 'EMERGENCY_CANCEL') {
      const session = await prisma.session.findFirst({
        where: { centerId, status: 'UPCOMING' },
      });

      if (session) {
        await prisma.session.update({
          where: { id: session.id },
          data: { status: 'CANCELLED', challengesFaced: `Cancelled: ${reason || 'Weather / Center Emergency'}` },
        });
      }

      await logSecurityAudit('COORDINATOR', 'EMERGENCY_SESSION_CANCEL', {
        centerId,
        centerName: center.name,
        reason: reason || 'Weather / Emergency',
      });

      return NextResponse.json({
        status: 'SUCCESS',
        type: 'EMERGENCY_CANCEL',
        recipientCount: center.volunteers.length,
        sampleMessage: `🚨 EMERGENCY ALERT: Session at ${center.name} has been CANCELLED (${reason || 'Weather/Emergency'}). Please do NOT report to center.`,
      });
    }

    // 2. Check Holiday Pause Flag
    if (center.isPausedForHoliday) {
      return NextResponse.json({
        status: 'SKIPPED_HOLIDAY',
        message: `Automated WhatsApp broadcast skipped for ${center.name} (Paused for Holiday).`,
      });
    }

    // 3. Fetch or create upcoming session for this weekend
    let session = await prisma.session.findFirst({
      where: { centerId, status: 'UPCOMING' },
      include: { volunteerAttendances: true },
    });

    if (!session) {
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay()));
      session = await prisma.session.create({
        data: {
          centerId,
          sessionDate: nextSaturday,
          startTime: '14:30',
          endTime: '17:30',
          status: 'UPCOMING',
        },
        include: { volunteerAttendances: true },
      });
    }

    // Update botState on attendances
    for (const vol of center.volunteers) {
      await prisma.volunteerAttendance.upsert({
        where: {
          sessionId_volunteerId: {
            sessionId: session.id,
            volunteerId: vol.id,
          },
        },
        update: {
          botState: type === 'CHECKIN' ? 'AWAITING_CHECKIN' : 'AWAITING_RSVP',
        },
        create: {
          sessionId: session.id,
          volunteerId: vol.id,
          rsvpStatus: 'PENDING',
          checkInStatus: 'PENDING',
          botState: type === 'CHECKIN' ? 'AWAITING_CHECKIN' : 'AWAITING_RSVP',
        },
      });
    }

    const recipientCount = center.volunteers.length;
    const sampleMessage = type === 'CHECKIN'
      ? `Hi! Are you at ${center.name} today (${center.slotTime})? Tap below to check in!`
      : `🌟 Hi! Saturday session at ${center.name} is coming up (${center.slotTime}). Will you be attending?`;

    return NextResponse.json({
      status: 'SUCCESS',
      recipientCount,
      sampleMessage,
      centerName: center.name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
