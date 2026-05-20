"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from "@/lib/store";
import { Eye, EyeOff, BookOpen, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Role } from "@/lib/types";

export default function RegisterPage() {
  const { register, login } = useAppContext();
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");

  // Pipefy context
  const [foundInPipefy, setFoundInPipefy] = useState(false);
  const [demoCodeMsg, setDemoCodeMsg] = useState("");

  const handleNextStep = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar código");
      }
      
      setFoundInPipefy(data.foundInPipefy);
      if (data.existingName) {
        setName(data.existingName);
      } else {
        setName(""); // Clear it if not found
      }
      setDemoCodeMsg(`(Demo) Código gerado: ${data.demoCode}`);
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!foundInPipefy && !reason.trim()) {
      setError("O motivo da solicitação é obrigatório.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code, name, reason })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro na validação do código ou sync");
      }
      
      const finalRole = data.role as Role;
      const isNewRequest = data.isNewRequest;

      // Tenta logar direto — se o usuário já existe no store (pré-cadastro via sync)
      const loginResult = login(email, password);
      if (loginResult.success) {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => router.push("/"), 1500);
        return;
      }

      // Usuário não existia ainda: cria no store
      const result = register(name, email, finalRole, password, undefined, isNewRequest ? reason : undefined);
      
      setLoading(false);

      if (result.success || result.error?.includes("Aguardando aprovação")) {
        setSuccess(true);
        if (isNewRequest) {
          setPendingApproval(true);
          setTimeout(() => router.push("/login"), 4000);
        } else {
          setTimeout(() => router.push("/"), 1500);
        }
      } else {
        setError(result.error ?? "Erro ao salvar usuário localmente.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Solicitar Acesso</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {step === 1 ? "Central de Propostas Acadêmicas" : "Validação de Segurança"}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className={`w-16 h-16 ${pendingApproval ? 'bg-amber-500/20' : 'bg-emerald-500/20'} rounded-full flex items-center justify-center`}>
                <CheckCircle className={`w-8 h-8 ${pendingApproval ? 'text-amber-400' : 'text-emerald-400'}`} />
              </div>
              <p className="text-slate-900 dark:text-white font-semibold text-lg">
                {pendingApproval ? "Solicitação enviada!" : "Cadastro realizado!"}
              </p>
              {pendingApproval ? (
                <p className="text-amber-400 text-sm text-center bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  Aguardando aprovação da solicitação.<br/>
                  Em caso de urgência, entre em contato pelo e-mail:<br/>
                  <strong className="text-amber-300 mt-1 block">novos.projetos@unyleya.com.br</strong>
                </p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">Redirecionando para o sistema...</p>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-start gap-2 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-mail institucional</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu@unyleya.edu.br"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirmar senha</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-xs text-amber-300">
                    <strong>MVP:</strong> A senha padrão nas demonstrações deve ser <code className="bg-slate-900 px-1 rounded text-amber-400">Unyleya@2026</code>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Próximo Passo <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      type="button" 
                      onClick={() => { setStep(1); setError(""); }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={foundInPipefy && name.length > 0}
                      placeholder="Insira seu nome..."
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                      <span>Código de Verificação (2FA)</span>
                      <button 
                        type="button"
                        onClick={() => alert("Por enquanto apenas códigos por e-mail estão sendo enviados")}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Enviar SMS?
                      </button>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="w-full tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {demoCodeMsg && <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">{demoCodeMsg}</p>}
                  </div>

                  {/* Mostra Motivo apenas após digitar o código E se não foi encontrado no Pipefy */}
                  {!foundInPipefy && code.length >= 6 && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Motivo da solicitação</label>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Ex: Meu nome é João, sou assistente da Coordenadora Maria..."
                        required
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (!foundInPipefy && code.length >= 6 && !reason.trim())}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "Concluir Cadastro"}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Já tem acesso?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
                  Fazer login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
