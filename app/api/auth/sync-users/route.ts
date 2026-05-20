import { NextResponse } from 'next/server';
import { getPipeCards } from '@/lib/services/pipefy';

function getField(fields: { name: string; value: string }[], ...keywords: string[]) {
  for (const kw of keywords) {
    const f = fields.find(f => f.name.toLowerCase().includes(kw.toLowerCase()));
    if (f?.value) return f.value;
  }
  return '';
}

export async function GET() {
  try {
    const syncedUsers: {
      pipefyId: string;
      pipeId: string;
      name: string;
      email: string;
      role: string;
    }[] = [];

    // ── Pipe 305896989: Gerenciamento de Acessos ──────────────────────────
    const accessCards = await getPipeCards('305896989');
    for (const card of accessCards) {
      const email = getField(card.fields, 'email');
      const name  = getField(card.fields, 'nome');
      if (!email) continue;

      // Determina role pelo campo Permissão
      const perm = getField(card.fields, 'permiss').toLowerCase();
      let role = 'Assistente';
      if (perm.includes('admin'))       role = 'Admin';
      else if (perm.includes('colabor')) role = 'Diretor';
      else if (perm.includes('coordena')) role = 'Coordenador';

      syncedUsers.push({ pipefyId: card.id, pipeId: '305896989', name, email, role });
    }

    // ── Pipe 305586959: Cadastro de Coordenador ───────────────────────────
    const coordCards = await getPipeCards('305586959');
    for (const card of coordCards) {
      // email pode estar em campo "email" ou "e-mail"
      const email = getField(card.fields, 'e-mail', 'email');
      const name  = getField(card.fields, 'nome');
      if (!email) continue;

      // Evita duplicar quem já veio do pipe anterior
      if (syncedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) continue;

      syncedUsers.push({ pipefyId: card.id, pipeId: '305586959', name, email, role: 'Coordenador' });
    }

    return NextResponse.json({ users: syncedUsers });
  } catch (error: any) {
    console.error('sync-users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
