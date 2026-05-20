import { NextResponse } from "next/server";
import { findCardByEmail, updatePasswordInCard, createAccessRequestCard } from "@/lib/services/pipefy";
import { verificationCodes } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const { email, password, code, name, reason } = await request.json();
    
    if (!email || !password || !code) {
      return NextResponse.json({ error: "E-mail, senha e código são obrigatórios" }, { status: 400 });
    }

    const savedCode = verificationCodes.get(email.toLowerCase());
    if (!savedCode || savedCode !== code) {
      return NextResponse.json({ error: "Código de verificação inválido ou expirado." }, { status: 400 });
    }

    // Código validado, podemos limpar
    verificationCodes.delete(email.toLowerCase());

    const cardInfo = await findCardByEmail(email);
    let finalRole = "Assistente"; // Default
    let isNewRequest = false;

    if (cardInfo) {
      // Usuário existe na base do Pipefy
      await updatePasswordInCard(cardInfo.id, password);
      if (cardInfo.role) {
        finalRole = cardInfo.role;
      }
    } else {
      // Usuário não existe, cria solicitação
      isNewRequest = true;
      if (!name || !reason) {
        return NextResponse.json({ error: "Nome e motivo da solicitação são obrigatórios para novos cadastros." }, { status: 400 });
      }
      await createAccessRequestCard(name, email, reason);
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Sincronizado com sucesso", 
      role: finalRole,
      isNewRequest,
      // Devolvemos a senha para que o frontend salve no perfil local
      password
    });

  } catch (error: any) {
    console.error("Erro ao registrar no Pipefy:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
