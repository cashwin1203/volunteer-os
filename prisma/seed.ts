import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Volunteer OS database with updated roles & names...');

  // Clean existing database
  await prisma.studentAttendance.deleteMany();
  await prisma.volunteerAttendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.student.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.center.deleteMany();
  await prisma.city.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'U&I Trust',
    },
  });

  // 2. Create Cities
  const blr = await prisma.city.create({
    data: {
      name: 'Bangalore',
      organizationId: org.id,
    },
  });

  const chn = await prisma.city.create({
    data: {
      name: 'Chennai',
      organizationId: org.id,
    },
  });

  // 3. Create Centers
  const vihana = await prisma.center.create({
    data: {
      name: 'Vihana Center',
      location: 'Whitefield, Bangalore',
      dayOfWeek: 'Saturday',
      slotTime: '2:30 PM - 5:30 PM',
      cityId: blr.id,
      targetStudentCount: 45,
      targetVolunteerCount: 12,
    },
  });

  const mala = await prisma.center.create({
    data: {
      name: 'Mala Learning Center',
      location: 'Koramangala, Bangalore',
      dayOfWeek: 'Saturday',
      slotTime: '10:00 AM - 1:00 PM',
      cityId: blr.id,
      targetStudentCount: 35,
      targetVolunteerCount: 10,
    },
  });

  const ramamurthy = await prisma.center.create({
    data: {
      name: 'Ramamurthynagar Center',
      location: 'Ramamurthynagar, Bangalore',
      dayOfWeek: 'Sunday',
      slotTime: '2:00 PM - 5:00 PM',
      cityId: blr.id,
      targetStudentCount: 40,
      targetVolunteerCount: 10,
    },
  });

  // 4. Create Volunteers with Updated Names (Gomesh as Field Volunteer, Navin D as Chapter Leader)
  const ashwin = await prisma.volunteer.create({
    data: {
      name: 'Ashwin C',
      email: 'ashwin@uandi.org',
      phone: '+91 98765 43210',
      whatsappPhone: '+91 98765 43210',
      role: 'COORDINATOR',
      status: 'ACTIVE',
      skills: 'Center Operations, Leadership, Mathematics',
      totalHours: 142,
      centerId: vihana.id,
    },
  });

  const gomesh = await prisma.volunteer.create({
    data: {
      name: 'Gomesh',
      email: 'gomesh@uandi.org',
      phone: '+91 98123 45678',
      whatsappPhone: '+91 98123 45678',
      role: 'VOLUNTEER',
      status: 'ACTIVE',
      skills: 'Mathematics, Science, English',
      totalHours: 54,
      centerId: vihana.id,
    },
  });

  const priya = await prisma.volunteer.create({
    data: {
      name: 'Priya Nair',
      email: 'priya.nair@gmail.com',
      phone: '+91 97654 32109',
      whatsappPhone: '+91 97654 32109',
      role: 'VOLUNTEER',
      status: 'ACTIVE',
      skills: 'English Communication, Reading',
      totalHours: 64,
      centerId: vihana.id,
    },
  });

  const sneha = await prisma.volunteer.create({
    data: {
      name: 'Sneha Roy',
      email: 'sneha.roy@gmail.com',
      phone: '+91 96543 21098',
      whatsappPhone: '+91 96543 21098',
      role: 'VOLUNTEER',
      status: 'AT_RISK',
      skills: 'Art, Primary Math',
      totalHours: 18,
      centerId: vihana.id,
    },
  });

  const arjun = await prisma.volunteer.create({
    data: {
      name: 'Arjun Mehta',
      email: 'arjun.m@gmail.com',
      phone: '+91 95432 10987',
      whatsappPhone: '+91 95432 10987',
      role: 'VOLUNTEER',
      status: 'ACTIVE',
      skills: 'Science, Life Skills',
      totalHours: 52,
      centerId: vihana.id,
    },
  });

  const navin = await prisma.volunteer.create({
    data: {
      name: 'Navin D',
      email: 'navin.d@uandi.org',
      phone: '+91 94321 09876',
      whatsappPhone: '+91 94321 09876',
      role: 'CHAPTER_LEADER',
      status: 'ACTIVE',
      skills: 'Chapter Governance, Program Strategy',
      totalHours: 210,
      centerId: mala.id,
    },
  });

  // 5. Create Students for Vihana
  const studentNames = [
    'Aarav Kumar', 'Diya Patel', 'Kavya Singh', 'Rohan Verma',
    'Ishaan Reddy', 'Ananya Sharma', 'Aditya Joshi', 'Meera Rao',
    'Yash Deshmukh', 'Sanya Iyer', 'Vikram Malhotra', 'Tanvi Kulkarni'
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const s = await prisma.student.create({
      data: {
        name: studentNames[i],
        grade: `Grade ${5 + (i % 4)}`,
        centerId: vihana.id,
      },
    });
    students.push(s);
  }

  // 6. Create Sessions (Past & Upcoming)
  const pastDate1 = new Date();
  pastDate1.setDate(pastDate1.getDate() - 14);

  const pastSession1 = await prisma.session.create({
    data: {
      centerId: vihana.id,
      sessionDate: pastDate1,
      startTime: '14:30',
      endTime: '17:30',
      status: 'COMPLETED',
      topicCovered: 'Fractions & Basic Division',
      activitiesCompleted: 'Interactive pizza slice exercise for fractions, 1-on-1 tutoring',
      challengesFaced: '3 students struggled with long division steps.',
    },
  });

  const pastDate2 = new Date();
  pastDate2.setDate(pastDate2.getDate() - 7);

  const pastSession2 = await prisma.session.create({
    data: {
      centerId: vihana.id,
      sessionDate: pastDate2,
      startTime: '14:30',
      endTime: '17:30',
      status: 'COMPLETED',
      topicCovered: 'English Reading Comprehension & Vocabulary',
      activitiesCompleted: 'Group story reading, flashcards for new vocabulary',
      challengesFaced: 'Noise level high during group reading; split into smaller groups.',
    },
  });

  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + (6 - upcomingDate.getDay()));

  const upcomingSession = await prisma.session.create({
    data: {
      centerId: vihana.id,
      sessionDate: upcomingDate,
      startTime: '14:30',
      endTime: '17:30',
      status: 'UPCOMING',
    },
  });

  // 7. Create Attendances
  const vihanaVolunteers = [ashwin, gomesh, priya, sneha, arjun];

  // Past session 1 attendances
  for (const vol of vihanaVolunteers) {
    await prisma.volunteerAttendance.create({
      data: {
        sessionId: pastSession1.id,
        volunteerId: vol.id,
        rsvpStatus: 'ATTENDING',
        checkInStatus: vol.id === sneha.id ? 'ABSENT' : 'PRESENT',
        hoursLogged: vol.id === sneha.id ? 0 : 3,
        notes: vol.id === sneha.id ? 'Informed last minute due to illness' : 'Led group activity',
      },
    });
  }

  // Past session 2 attendances
  for (const vol of vihanaVolunteers) {
    await prisma.volunteerAttendance.create({
      data: {
        sessionId: pastSession2.id,
        volunteerId: vol.id,
        rsvpStatus: vol.id === sneha.id ? 'ABSENT' : 'ATTENDING',
        checkInStatus: vol.id === sneha.id ? 'ABSENT' : 'PRESENT',
        hoursLogged: vol.id === sneha.id ? 0 : 3,
      },
    });
  }

  // Upcoming session RSVP
  await prisma.volunteerAttendance.create({
    data: { sessionId: upcomingSession.id, volunteerId: ashwin.id, rsvpStatus: 'ATTENDING' },
  });
  await prisma.volunteerAttendance.create({
    data: { sessionId: upcomingSession.id, volunteerId: gomesh.id, rsvpStatus: 'ATTENDING' },
  });
  await prisma.volunteerAttendance.create({
    data: { sessionId: upcomingSession.id, volunteerId: priya.id, rsvpStatus: 'ATTENDING' },
  });
  await prisma.volunteerAttendance.create({
    data: { sessionId: upcomingSession.id, volunteerId: sneha.id, rsvpStatus: 'ABSENT', notes: 'Out of town' },
  });
  await prisma.volunteerAttendance.create({
    data: { sessionId: upcomingSession.id, volunteerId: arjun.id, rsvpStatus: 'PENDING' },
  });

  console.log('Database seeded with Gomesh and Navin D (Chapter Leader) successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
