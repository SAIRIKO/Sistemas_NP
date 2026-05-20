import { NextRequest, NextResponse } from 'next/server';
import { getPipeCards, testConnection } from '@/lib/services/pipefy';
import { Proposal, Status } from '@/lib/types';
import { deriveStatusFromPhase } from '@/lib/utils';

function extractField(fields: { name: string; value: string }[], label: string) {
  const field = fields.find(f => f.name.toLowerCase().includes(label.toLowerCase()));
  if (!field || !field.value) return undefined;
  // If it's a JSON array (like connector fields), parse it
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

/** Like extractField but only returns if value is a valid URL (starts with http) */
function extractUrlField(fields: { name: string; value: string }[], label: string) {
  const val = extractField(fields, label);
  if (!val) return undefined;
  // Must look like a real URL
  if (!val.startsWith('http://') && !val.startsWith('https://')) return undefined;
  return val;
}

function extractNumberedFields(fields: { name: string; value: string }[], label: string) {
  const values = fields
    .filter(f => f.name.toLowerCase().startsWith(label.toLowerCase()))
    .filter(f => /\d+/.test(f.name))
    .map(f => {
      if (!f.value) return undefined;
      // Handle JSON strings like ["Name"]
      if (f.value.startsWith('[') && f.value.endsWith(']')) {
        try {
          const parsed = JSON.parse(f.value);
          if (Array.isArray(parsed)) return parsed[0];
          return parsed;
        } catch {
          return f.value;
        }
      }
      return f.value;
    })
    .filter(val => !!val);
  
  return values.length > 0 ? values.join(', ') : undefined;
}

export async function GET(req: NextRequest) {
  const pipeId = req.nextUrl.searchParams.get('pipeId') ?? process.env.PIPEFY_PIPE_ID;

  if (!pipeId) {
    return NextResponse.json({ error: 'pipeId é obrigatório. Configure PIPEFY_PIPE_ID no .env.local' }, { status: 400 });
  }

  try {
    const pipefyCards = await getPipeCards(pipeId);

    // Transform to Proposal type
    const mappedCards: Proposal[] = pipefyCards.map(c => {
      const pPhase = c.currentPhase?.name || 'Solicitações';

      return {
        id: c.id,
        pipefyCardId: c.id,
        courseName: extractField(c.fields, 'Nome do Curso') ?? c.title,
        coordinator: extractField(c.fields, 'Selecione o cadastro') ?? 'Não definido',
        area: extractField(c.fields, 'Área de Conhecimento') ?? 'Geral',
        subarea: extractField(c.fields, 'curso-slug') ?? '',
        vertical: 'Pós-graduação', // Add logic here if Pipefy provides vertical
        targetAudience: extractField(c.fields, 'Objetivo e público alvo'),
        disciplines: extractField(c.fields, 'Disciplinas'),
        courseCoordinators: extractNumberedFields(c.fields, 'Coordenador'),
        requestDate: c.createdAt,
        currentPhase: pPhase,
        status: deriveStatusFromPhase(pPhase),
        observations: extractField(c.fields, 'facilitar a análise') || extractField(c.fields, 'observações'),
        pptUrl: extractUrlField(c.fields, 'Apresentação') || extractUrlField(c.fields, 'PPT') || extractUrlField(c.fields, 'Apresentacao'),
        videoUrl: extractUrlField(c.fields, 'Vídeo') || extractUrlField(c.fields, 'Video'),
        similarCoursesText: extractField(c.fields, 'Cursos Similares'),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ cards: mappedCards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Test connection endpoint — GET /api/pipefy/cards?test=1&pipeId=... */
export async function POST(req: NextRequest) {
  const body = await req.json() as { pipeId?: string };
  const pipeId = body.pipeId ?? process.env.PIPEFY_PIPE_ID;

  if (!pipeId) {
    return NextResponse.json({ error: 'pipeId é obrigatório' }, { status: 400 });
  }

  try {
    const pipeName = await testConnection(pipeId);
    return NextResponse.json({ ok: true, pipeName });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
