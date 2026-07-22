import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Meta Verification challenge for webhook setup
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === 'VOLUNTEER_OS_WA_TOKEN') {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST Webhook handler (Meta WhatsApp Cloud API payload or Simulator payload)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Extract message fields
    const volunteerId = body.volunteerId;
    const action = body.action; // 'RSVP_ATTENDING', 'RSVP_ABSENT', 'CHECK_IN', 'LOG_NOTES', 'COMMAND_STATUS'
    const textContent = body.text;

    // Find active volunteer
    const volunteer = await prisma.volunteer.findFirst({
      where: volunteerId ? { id: volunteerId } : { email: 'ashwin@uandi.org' },
      include: { center: true },
    });

    if (!volunteer) {
      return NextResponse.json({ reply: 'Sorry, your WhatsApp number is not registered in Volunteer OS.' });
    }

    // Find upcoming or active session for center
    const session = await prisma.session.findFirst({
      where: { centerId: volunteer.centerId || '', status: { in: ['UPCOMING', 'COMPLETED'] } },
      orderBy: { sessionDate: 'desc' },
      include: { volunteerAttendances: true },
    });

    if (!session) {
      return NextResponse.json({ reply: `Hi ${volunteer.name}! No active session found for your center.` });
    }

    const attendance = session.volunteerAttendances.find((a) => a.volunteerId === volunteer.id);

    // 1. Process RSVP Actions
    if (action === 'RSVP_ATTENDING') {
      if (attendance) {
        await prisma.volunteerAttendance.update({
          where: { id: attendance.id },
          data: { rsvpStatus: 'ATTENDING', botState: 'IDLE' },
        });
      }
      return NextResponse.json({
        reply: `Awesome, ${volunteer.name}! ✅ Your RSVP for Saturday (${volunteer.center?.slotTime}) at ${volunteer.center?.name} is confirmed. See you there!`,
        updatedRsvp: 'ATTENDING',
      });
    }

    if (action === 'RSVP_ABSENT') {
      if (attendance) {
        await prisma.volunteerAttendance.update({
          where: { id: attendance.id },
          data: { rsvpStatus: 'ABSENT', botState: 'IDLE' },
        });
      }
      return NextResponse.json({
        reply: `Thanks for letting us know, ${volunteer.name}. ❌ Your absence has been logged. Your Center Coordinator has been notified to assign a standby backup.`,
        updatedRsvp: 'ABSENT',
      });
    }

    // 2. Process Check-In Action
    if (action === 'CHECK_IN') {
      if (attendance) {
        await prisma.volunteerAttendance.update({
          where: { id: attendance.id },
          data: { checkInStatus: 'PRESENT', hoursLogged: 3.0, botState: 'AWAITING_NOTES' },
        });

        // Recalculate volunteer hours
        const total = await prisma.volunteerAttendance.aggregate({
          where: { volunteerId: volunteer.id, checkInStatus: 'PRESENT' },
          _sum: { hoursLogged: true },
        });
        await prisma.volunteer.update({
          where: { id: volunteer.id },
          data: { totalHours: total._sum.hoursLogged || 0 },
        });
      }
      return NextResponse.json({
        reply: `📍 Check-in verified at ${volunteer.center?.name}! +3.0 volunteer hours added to your profile (Total: ${(volunteer.totalHours || 0) + 3} hrs). Enjoy teaching today! 📚`,
        updatedCheckIn: 'PRESENT',
      });
    }

    // 3. Process Text Session Notes or Commands
    if (action === 'LOG_NOTES' || textContent) {
      if (textContent?.startsWith('/status')) {
        // Coordinator Command
        const attendingCount = session.volunteerAttendances.filter((a) => a.rsvpStatus === 'ATTENDING').length;
        const totalRoster = session.volunteerAttendances.length;
        return NextResponse.json({
          reply: `📊 *${volunteer.center?.name} Status*\n• Attending: ${attendingCount}/${totalRoster} volunteers\n• Slot: ${volunteer.center?.slotTime}\n• Session Status: ${session.status}`,
        });
      }

      // Save Session Note
      await prisma.session.update({
        where: { id: session.id },
        data: {
          topicCovered: textContent,
          activitiesCompleted: 'Submitted via WhatsApp Bot',
        },
      });

      return NextResponse.json({
        reply: `📝 Thank you ${volunteer.name}! Your session topic ("${textContent}") has been recorded in the ${volunteer.center?.name} logbook!`,
        loggedTopic: textContent,
      });
    }

    return NextResponse.json({ reply: `Hi ${volunteer.name}! Type /status to check roster status or select an RSVP option.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
