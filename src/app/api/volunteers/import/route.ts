import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logSecurityAudit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { csvData, centerId } = await req.json();

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json({ error: 'Invalid CSV data' }, { status: 400 });
    }

    // Parse CSV rows (header: name, email, phone, skills)
    const lines = csvData.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file contains no rows' }, { status: 400 });
    }

    const header = lines[0].toLowerCase().split(',');
    const nameIdx = header.findIndex((h) => h.includes('name'));
    const emailIdx = header.findIndex((h) => h.includes('email'));
    const phoneIdx = header.findIndex((h) => h.includes('phone'));
    const skillsIdx = header.findIndex((h) => h.includes('skill'));

    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const name = nameIdx !== -1 ? cols[nameIdx] : cols[0];
      const email = emailIdx !== -1 ? cols[emailIdx] : `vol${Date.now()}_${i}@uandi.org`;
      const phone = phoneIdx !== -1 ? cols[phoneIdx] : '+91 98765 00000';
      const skills = skillsIdx !== -1 ? cols[skillsIdx] : 'Teaching, General';

      if (name) {
        await prisma.volunteer.upsert({
          where: { email },
          update: {
            name,
            phone,
            whatsappPhone: phone,
            skills,
            ...(centerId && { centerId }),
          },
          create: {
            name,
            email,
            phone,
            whatsappPhone: phone,
            skills,
            status: 'ACTIVE',
            centerId: centerId || null,
          },
        });
        importedCount++;
      }
    }

    await logSecurityAudit('COORDINATOR', 'BULK_CSV_IMPORT', { importedCount, centerId });

    return NextResponse.json({
      status: 'SUCCESS',
      importedCount,
      message: `Successfully imported ${importedCount} volunteers to roster!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
