import { NextRequest, NextResponse } from 'next/server';
import { getPipeCards } from '@/lib/services/pipefy';
import { CoordinatorProfile } from '@/lib/types';

function extractField(fields: { name: string; value: string }[], label: string) {
  const field = fields.find(f => f.name.toLowerCase().includes(label.toLowerCase()));
  if (!field || !field.value) return undefined;
  
  if (field.value.startsWith('[') && field.value.endsWith(']')) {
    try {
      const parsed = JSON.parse(field.value);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch {
      return field.value;
    }
  }
  return field.value;
}

export async function GET(req: NextRequest) {
  // Hardcoded Pipe ID for coordinators profile database
  const pipeId = '305586959';

  try {
    const pipefyCards = await getPipeCards(pipeId);

    const mappedCoordinators: CoordinatorProfile[] = pipefyCards.map(c => {
      const isCurrent = extractField(c.fields, 'Já é coordenador da Unyleya?');
      return {
        id: c.id,
        name: extractField(c.fields, 'Nome Completo') || c.title,
        email: extractField(c.fields, 'Email Pessoal') || '',
        phone: extractField(c.fields, 'Celular'),
        bio: extractField(c.fields, 'Minibiografia'),
        isCurrentCoordinator: isCurrent === 'Sim',
      };
    });

    return NextResponse.json({ coordinators: mappedCoordinators });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
