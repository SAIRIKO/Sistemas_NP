"use client";

import { useAppContext } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Users, ArrowRightLeft, Database, SearchCode, Blocks, CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function ConfiguracoesPage() {
 const { role } = useAppContext();

 const [pipeId, setPipeId] = useState("");
 const [testing, setTesting] = useState(false);
 const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

 if (role !== 'Admin') {
 return (
 <div className="flex h-[60vh] items-center justify-center flex-col">
 <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
 <Settings className="w-8 h-8" />
 </div>
 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Acesso Restrito</h2>
 <p className="text-slate-500 dark:text-slate-400 mt-2">Você precisa estar com o perfil Admin para acessar as configurações.</p>
 </div>
 );
 }

 const handleTestConnection = async () => {
 if (!pipeId.trim()) {
 setTestResult({ ok: false, message: "Informe o ID do Pipe antes de testar." });
 return;
 }
 setTesting(true);
 setTestResult(null);
 try {
 const res = await fetch("/api/pipefy/cards", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ pipeId }),
 });
 const data = await res.json() as { ok?: boolean; pipeName?: string; error?: string };
 if (data.ok) {
 setTestResult({ ok: true, message: `Conectado! Pipe encontrado: "${data.pipeName}"` });
 } else {
 setTestResult({ ok: false, message: data.error ?? "Erro desconhecido" });
 }
 } catch {
 setTestResult({ ok: false, message: "Erro de rede ao conectar com a API." });
 } finally {
 setTesting(false);
 }
 };

 return (
 <div className="max-w-5xl mx-auto pb-12 space-y-8">
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Configurações Administrativas</h2>
 <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie chaves, integrações e permissões do sistema.</p>
 </div>

 {/* ── PIPEFY OAuth 2.0 ── */}
 <Card className="border-blue-100 shadow-sm">
 <CardHeader className="bg-blue-50/60 border-b border-blue-100 rounded-t-xl">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
 <ArrowRightLeft className="w-5 h-5" />
 </div>
 <div>
 <CardTitle className="text-slate-800 dark:text-slate-100">Integração Pipefy — OAuth 2.0</CardTitle>
 <CardDescription>Autenticação via conta de serviço (Service Account). Credenciais configuradas no servidor.</CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-6 space-y-5">

 {/* Status da autenticação OAuth */}
 <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
 <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
 <div>
 <p className="text-sm font-semibold text-emerald-800">Autenticação OAuth 2.0 configurada</p>
 <p className="text-xs text-emerald-700 mt-1">
 Conta de serviço: <code className="bg-emerald-100 px-1 rounded">interface-301531847@service-account.pipefy.com</code>
 </p>
 <p className="text-xs text-emerald-600 mt-0.5">
 Client ID e Secret já configurados no <code>.env.local</code> do servidor.
 </p>
 </div>
 </div>

 {/* Como funciona */}
 <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-200 space-y-2">
 <p className="font-semibold text-slate-800 dark:text-slate-100">Como funciona a autenticação:</p>
 <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
 <li>O sistema solicita automaticamente um token OAuth ao Pipefy usando as credenciais do servidor</li>
 <li>O token é cacheado e renovado automaticamente antes de expirar</li>
 <li>Todas as chamadas à API usam o token Bearer automaticamente</li>
 <li>Nenhuma credencial é exposta ao navegador</li>
 </ol>
 </div>

 {/* Pipe ID */}
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="sm:col-span-2 md:col-span-1">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
 Pipe ID de Propostas
 </label>
 <input
 type="text"
 value={pipeId}
 onChange={e => setPipeId(e.target.value)}
 placeholder="Ex: 302345678"
 className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
 />
 <p className="text-xs text-slate-400 mt-1">
 Número na URL: <code>app.pipefy.com/pipes/<strong>ID</strong></code>. 
 Configure também como <code>PIPEFY_PIPE_ID</code> no <code>.env.local</code>.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-4 flex-wrap">
 <button
 onClick={handleTestConnection}
 disabled={testing}
 className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
 >
 {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
 Testar Conexão com o Pipefy
 </button>

 {testResult && (
 <div className={`flex items-center gap-2 text-sm font-medium ${testResult.ok ? "text-emerald-700" : "text-red-600"}`}>
 {testResult.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
 {testResult.message}
 </div>
 )}
 </div>

 <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
 <strong>Importante:</strong> Para sincronizar os cards do Pipefy com o sistema, informe o <strong>Pipe ID</strong> acima e clique em &quot;Testar Conexão&quot;. Adicione também <code>PIPEFY_PIPE_ID</code> ao <code>.env.local</code> para que fique disponível após reiniciar o servidor.
 </div>
 </CardContent>
 </Card>

        {/* Outras seções */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Integração Power BI", icon: Database, desc: "Credenciais do embedded Power BI." },
            { title: "Integração IA", icon: SearchCode, desc: "Chaves da API do modelo (OpenAI, Azure)." },
            { title: "Fases do Fluxo", icon: Blocks, desc: "Mapeamento das colunas do Pipefy." },
          ].map(s => (
            <Card key={s.title} className="hover:border-blue-300 transition-colors cursor-pointer group shadow-sm">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <s.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg text-slate-800 dark:text-slate-100">{s.title}</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 pt-1">{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

  </div>
 );
}
