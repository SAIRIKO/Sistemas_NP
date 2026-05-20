import { NextResponse } from 'next/server';
import { createPipeCard, getPipeCards } from '@/lib/services/pipefy';

const PIPEFY_FEEDBACK_PIPE_ID = '305619320';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, feedback } = body;

    if (!name || !type || !feedback) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fields = [
      { field_id: 'employee_name', field_value: name },
      { field_id: 'do_que_se_trata', field_value: type },
      { field_id: 'feedback', field_value: feedback }
    ];

    const card = await createPipeCard(PIPEFY_FEEDBACK_PIPE_ID, fields);

    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    console.error('Error creating feedback card:', error);
    const errorMessage = error?.message || 'Erro desconhecido ao enviar feedback';
    return NextResponse.json(
      { error: errorMessage, details: error?.toString() },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cards = await getPipeCards(PIPEFY_FEEDBACK_PIPE_ID);
    
    // Map the cards into a simpler format for the UI
    const mappedCards = cards.map(card => {
      const typeField = card.fields.find(f => f.name === 'Do que se trata?' || f.name === 'do_que_se_trata');
      const authorField = card.fields.find(f => f.name === 'Nome Completo' || f.name === 'employee_name');
      const contentField = card.fields.find(f => f.name === 'Feedback ou Sugestões' || f.name === 'feedback');

      return {
        id: card.id,
        title: card.title,
        type: typeField ? typeField.value : 'Indefinido',
        author: authorField ? authorField.value : 'Anônimo',
        content: contentField ? contentField.value : '',
        createdAt: card.createdAt
      };
    });

    return NextResponse.json({ cards: mappedCards });
  } catch (error: any) {
    console.error('Error fetching feedback cards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
