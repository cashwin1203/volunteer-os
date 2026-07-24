import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Built-in 20-minute field-tested de-stress games for NGO learning centers
const CURATED_LAUNCH_GAMES = [
  {
    id: 'g1',
    title: 'Simon Says Math Edition',
    category: 'Educational Fun',
    durationMinutes: 20,
    propsNeeded: 'None',
    description: 'Play classic Simon Says, but with basic math actions: "Simon says do 4+2 jumping jacks" or "Simon says hop on 1 foot if 10 is an even number".',
  },
  {
    id: 'g2',
    title: 'Pictionary & Word Race',
    category: 'Educational Fun',
    durationMinutes: 20,
    propsNeeded: 'Whiteboard or Paper',
    description: 'Divide students into 2 teams. One student draws a vocabulary word (e.g. "Planet", "Fraction", "Doctor") while their team guesses within 60 seconds.',
  },
  {
    id: 'g3',
    title: 'Human Knot & Team Release',
    category: 'Team Building & Fun',
    durationMinutes: 20,
    propsNeeded: 'None',
    description: 'Students stand in a circle, reach out, and grab two random hands. Without letting go, the group must untangle themselves into a complete circle.',
  },
  {
    id: 'g4',
    title: 'Riddle Relay Race',
    category: 'Zero-Prop Energizers',
    durationMinutes: 20,
    propsNeeded: 'None',
    description: 'Two teams line up. To run to the front and tag the next teammate, the student must solve a quick fun riddle or brainteaser from the volunteer teacher.',
  },
  {
    id: 'g5',
    title: '20 Questions - Animal & Profession Edition',
    category: 'Zero-Prop Energizers',
    durationMinutes: 20,
    propsNeeded: 'None',
    description: 'A student thinks of an animal or career. Other students ask Yes/No questions (e.g. "Does it fly?", "Does it work in a hospital?") to guess it within 20 questions.',
  },
];

export async function GET() {
  return NextResponse.json({ games: CURATED_LAUNCH_GAMES });
}

export async function POST(req: Request) {
  try {
    const { idea, gradeLevel } = await req.json();

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid game idea' }, { status: 400 });
    }

    const cleanIdea = idea.trim();
    const targetGrade = gradeLevel || 'Grade 5-8';

    // Generate creative variations of the manually submitted game idea
    const variations = [
      {
        variationName: `${cleanIdea} — Rapid Fire Speed Round`,
        style: 'High Energy & Movement',
        instruction: `Adapt "${cleanIdea}" by adding a 30-second timer per student. Students move to opposite sides of the room for correct vs incorrect answers to keep energy high!`,
      },
      {
        variationName: `${cleanIdea} — Team Relay Challenge`,
        style: 'Competitive Team Work',
        instruction: `Split the class into 2 small teams. Each student completes one step of "${cleanIdea}" before passing the marker or baton to their teammate!`,
      },
      {
        variationName: `${cleanIdea} — Quiet Focus & Mystery Edition`,
        style: 'De-stress & Cool Down',
        instruction: `Play a quiet whisper or drawing version of "${cleanIdea}". Great for calming down energy before students head home!`,
      },
    ];

    return NextResponse.json({
      originalIdea: cleanIdea,
      targetGrade,
      variations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
