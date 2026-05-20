import { NextResponse } from "next/server";
import { findCardByEmail } from "@/lib/services/pipefy";
import { verificationCodes } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    // 1. Generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email.toLowerCase(), code);

    // 2. Check if user already exists in Pipefy (just to return if we found a name)
    let foundInPipefy = false;
    let existingName = "";
    
    // findCardByEmail now returns cardId and optionally fields (we will update pipefy.ts next)
    const cardInfo = await findCardByEmail(email);
    if (cardInfo) {
      foundInPipefy = true;
      // If we could extract the name from the card fields, we'd pass it here. 
      // For now, we'll just inform the client that it exists.
      existingName = cardInfo.name || "";
    }

    // SIMULATED EMAIL SEND
    console.log(`\n\n=== E-MAIL SIMULATION ===`);
    console.log(`To: ${email}`);
    console.log(`Subject: Seu código de verificação Central de Propostas`);
    console.log(`Code: ${code}`);
    console.log(`=========================\n\n`);

    return NextResponse.json({ 
      ok: true, 
      message: "Código enviado com sucesso.", 
      foundInPipefy,
      existingName,
      // Sending code to client only for MVP/Demo ease of testing, usually we don't return the code!
      demoCode: code 
    });
  } catch (error: any) {
    console.error("Erro ao enviar código:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
