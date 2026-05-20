import { NextResponse } from 'next/server';
import { findCardByEmail, updateCardField, moveCardToPhase } from '@/lib/services/pipefy';

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    const foundInfo = await findCardByEmail(email);
    
    if (foundInfo && foundInfo.pipeId === '305896989' && foundInfo.id) {
      const cardId = foundInfo.id;
      
      // Valida solicitação — campo radio_horizontal: valor como array
      await updateCardField(cardId, 'validar_solicita_o', 'Válido');
      
      // Define a permissão correta baseada no Role do sistema
      let permissao = 'visualização';
      if (role === 'Admin') permissao = 'admin';
      else if (role === 'Diretor') permissao = 'colaborador';
      else if (role === 'Coordenador') permissao = 'coordenador';
      
      await updateCardField(cardId, 'permiss_o', permissao);
      
      // Move para a fase Sucesso (ID: 335295200)
      await moveCardToPhase(cardId, '335295200');
      
      return NextResponse.json({ success: true, message: 'Card atualizado e movido de fase com sucesso' });
    }
    
    return NextResponse.json({ success: true, message: 'Nenhuma ação de Pipefy necessária para este usuário' });
  } catch (error: any) {
    console.error('Erro na API approve-user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
