"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from "@/lib/store";
import { Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";

export default function LoginPage() {
 const { login } = useAppContext();
 const router = useRouter();

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: FormEvent) => {
 e.preventDefault();
 setError("");
 setLoading(true);
 await new Promise(r => setTimeout(r, 600)); // simulate async

 const result = login(email, password);
 setLoading(false);

 if (result.success) {
 router.push("/portal");
 } else {
 setError(result.error ?? "Erro ao autenticar.");
 }
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
 {/* Decorative blobs */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
 <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl" />
 </div>

 <div className="relative w-full max-w-md">
 {/* Card */}
 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8">
 {/* Logo / Brand */}
 <div className="mb-8 text-center">
 <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
 <BookOpen className="w-7 h-7 text-white" />
 </div>
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Central de Propostas</h1>
 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Unyleya Educacional</p>
 </div>

 <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Bem-vindo de volta</h2>

 {error && (
 <div className="mb-4 flex items-start gap-2 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
 <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-mail institucional</label>
 <input
 type="email"
 value={email}
 onChange={e => setEmail(e.target.value)}
 placeholder="seu@unyleya.edu.br"
 required
 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

 <button
 type="submit"
 disabled={loading}
 className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
 >
 {loading ? (
 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : "Entrar"}
 </button>
 </form>

 <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
 Não tem acesso?{" "}
 <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition">
 Solicitar cadastro
 </Link>
 </p>

 {/* Demo hint */}
 <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-700">
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Acesso demo rápido</p>
 <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => { setEmail("admin@unyleya.edu.br"); setPassword("Unyleya@2026"); }}
                  className="w-full text-left flex justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span>admin@unyleya.edu.br</span>
                  <span className="text-blue-400 font-medium">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("diretora@unyleya.edu.br"); setPassword("Unyleya@2026"); }}
                  className="w-full text-left flex justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span>diretora@unyleya.edu.br</span>
                  <span className="text-slate-400 font-medium">Diretor</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("insbe@unyleya.edu.br"); setPassword("Unyleya@2026"); }}
                  className="w-full text-left flex justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span>insbe@unyleya.edu.br</span>
                  <span className="text-emerald-500 font-medium">Coordenador</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("maria.souza@unyleya.edu.br"); setPassword("Unyleya@2026"); }}
                  className="w-full text-left flex justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span>maria.souza@...</span>
                  <span className="text-slate-500 font-medium">Assist. Ativo</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("lucas.novo@unyleya.edu.br"); setPassword("Unyleya@2026"); }}
                  className="w-full text-left flex justify-between px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20 transition cursor-pointer"
                >
                  <span className="text-amber-700 dark:text-amber-500">lucas.novo@...</span>
                  <span className="text-amber-500 font-medium">Bloqueio</span>
                </button>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 text-center">Senha: Unyleya@2026</p>
 </div>
 </div>
 </div>
 </div>
 );
}
