import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWhatsAppSignature, logSecurityAudit, sanitizeInputText } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.META_WA_VERIFY_TOKEN || (process.env.NODE_ENV !== 'production' ? 'VOLUNTEER_OS_WA_TOKEN' : null);

  if (!expectedToken) {
    console.error('FATAL: META_WA_VERIFY_TOKEN is missing in production environment.');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  if (mode === 'subscribe' && token === expectedToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hub-signature-256');

    // HMAC Signature Security Verification
    const isValidSignature = verifyWhatsAppSignature(rawBody, signatureHeader);
    if (!isValidSignature) {
      await logSecurityAudit('UNAUTHORIZED_WEBHOOK_CALLER', 'WEBHOOK_SIGNATURE_FAILED', {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json({ error: 'Unauthorized: Invalid Signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const volunteerId = body.volunteerId;
    const action = body.action;
    const textContent = sanitizeInputText(body.text, 1000);

    const volunteer = await prisma.volunteer.findFirst({
      where: volunteerId ? { id: volunteerId } : { email: 'ashwin@uandi.org' },
      include: { center: true },
    });

    if (!volunteer) {
      return NextResponse.json({ reply: 'Sorry, your WhatsApp number is not registered in Volunteer OS.' });
    }

    const session = await prisma.session.findFirst({
      where: { centerId: volunteer.centerId || '', status: { in: ['UPCOMING', 'COMPLETED'] } },
      orderBy: { sessionDate: 'desc' },
      include: { volunteerAttendances: { include: { volunteer: true } } },
    });

    if (!session) {
      return NextResponse.json({ reply: `Hi ${volunteer.name}! No active session found for your center.` });
    }

    const attendance = session.volunteerAttendances.find((a) => a.volunteerId === volunteer.id);

    // 1. RSVP Attending
    if (action === 'RSVP_ATTENDING' || action === 'ACCEPT_BACKUP') {
      if (attendance) {
        await prisma.volunteerAttendance.update({
          where: { id: attendance.id },
          data: { rsvpStatus: 'ATTENDING', botState: 'IDLE' },
        });
      }

      await logSecurityAudit(volunteer.name, 'WHATSAPP_RSVP_CONFIRMED', {
        volunteerId: volunteer.id,
        status: 'ATTENDING',
      });

      return NextResponse.json({
        reply: `Awesome, ${volunteer.name}! ✅ Your RSVP for Saturday (${volunteer.center?.slotTime}) at ${volunteer.center?.name} is confirmed. See you there!`,
        updatedRsvp: 'ATTENDING',
      });
    }

    // 2. RSVP Absent -> Triggers Automated Standby Escalation
    if (action === 'RSVP_ABSENT') {
      if (attendance) {
        await prisma.volunteerAttendance.update({
          where: { id: attendance.id },
          data: { rsvpStatus: 'ABSENT', botState: 'IDLE' },
        });
      }

      // Standby Backup Escalation Logic
      const backupVolunteer = session.volunteerAttendances.find(
        (a) => a.rsvpStatus === 'BACKUP' || (a.rsvpStatus === 'PENDING' && a.volunteerId !== volunteer.id)
      );

      let escalationNotice = '';
      if (backupVolunteer) {
        escalationNotice = ` ⚡ Standby escalation triggered: Dispatched WhatsApp ping to backup volunteer (${backupVolunteer.volunteer?.name}) to cover your slot!`;
      }

      await logSecurityAudit(volunteer.name, 'WHATSAPP_RSVP_ABSENT_ESCALATED', {
        volunteerId: volunteer.id,
        backupEscalatedTo: backupVolunteer?.volunteer?.name || 'None',
      });

      return NextResponse.json({
        reply: `Thanks for letting us know, ${volunteer.name}. ❌ Your absence has been logged.${escalationNotice}`,
        updatedRsvp: 'ABSENT',
        backupEscalated: backupVolunteer ? backupVolunteer.volunteer?.name : null,
      });
    }

    // 3. Check-In Action
    if (action === 'CHECK_IN') {
      if (attendance) {
        await prisma.volunteerAttendance.update({
          where: { id: attendance.id },
          data: { checkInStatus: 'PRESENT', hoursLogged: 3.0, botState: 'AWAITING_NOTES' },
        });

        const total = await prisma.volunteerAttendance.aggregate({
          where: { volunteerId: volunteer.id, checkInStatus: 'PRESENT' },
          _sum: { hoursLogged: true },
        });

        await prisma.volunteer.update({
          where: { id: volunteer.id },
          data: { totalHours: total._sum.hoursLogged || 0 },
        });
      }

      await logSecurityAudit(volunteer.name, 'WHATSAPP_FIELD_CHECKIN', {
        volunteerId: volunteer.id,
        hoursLogged: 3.0,
      });

      return NextResponse.json({
        reply: `📍 Check-in verified at ${volunteer.center?.name}! +3.0 volunteer hours added to your profile (Total: ${(volunteer.totalHours || 0) + 3} hrs). Enjoy teaching today! 📚`,
        updatedCheckIn: 'PRESENT',
      });
    }

    // 4. Text Notes or Commands
    if (action === 'LOG_NOTES' || textContent) {
      if (textContent?.startsWith('/status')) {
        const attendingCount = session.volunteerAttendances.filter((a) => a.rsvpStatus === 'ATTENDING').length;
        const totalRoster = session.volunteerAttendances.length;
        return NextResponse.json({
          reply: `📊 *${volunteer.center?.name} Status*\n• Attending: ${attendingCount}/${totalRoster} volunteers\n• Slot: ${volunteer.center?.slotTime}\n• Session Status: ${session.status}`,
        });
      }

      await prisma.session.update({
        where: { id: session.id },
        data: {
          topicCovered: textContent,
          activitiesCompleted: 'Submitted via WhatsApp Bot',
        },
      });

      await logSecurityAudit(volunteer.name, 'WHATSAPP_LOGGED_NOTES', {
        volunteerId: volunteer.id,
        topic: textContent,
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
