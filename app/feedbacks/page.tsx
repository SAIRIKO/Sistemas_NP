"use client";

import { useAppContext } from "@/lib/store";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageSquare, RefreshCw, AlertCircle, Lightbulb, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedbackCard {
  id: string;
  title: string;
  type: string;
  author: string;
  content: string;
  createdAt: string;
}

export default function FeedbacksPage() {
  const { currentUser, role } = useAppContext();
  
  // Form State
  const [type, setType] = useState<string>("Feedback");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin List State
  const [feedbacks, setFeedbacks] = useState<FeedbackCard[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

  const isAdmin = role === 'Admin';

  const fetchFeedbacks = async () => {
    if (!isAdmin) return;
    
    setIsLoadingFeedbacks(true);
    try {
      const res = await fetch('/api/feedbacks');
      if (!res.ok) throw new Error('Falha ao carregar feedbacks');
      const data = await res.json();
      setFeedbacks(data.cards || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar lista de feedbacks.");
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error("Por favor, digite seu feedback.");
      return;
    }
    
    if (!currentUser?.name) {
      toast.error("Usuário não identificado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          type,
          feedback
        })
      });

      if (!res.ok) throw new Error('Falha ao enviar feedback');
      
      toast.success("Feedback enviado com sucesso! Obrigado pela colaboração.");
      setFeedback("");
      setType("Feedback");
      
      // Se for admin, atualiza a lista após enviar
      if (isAdmin) fetchFeedbacks();
      
    } catch (err) {
      console.error(err);
      toast.error("Houve um problema ao enviar seu feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'Erro':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Erro</Badge>;
      case 'Sugestão de Melhoria':
        return <Badge className="bg-amber-500 hover:bg-amber-600 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Sugestão</Badge>;
      default:
        return <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Feedback</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          Feedbacks e Sugestões
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Ajude-nos a melhorar a plataforma enviando suas ideias ou relatando problemas.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Enviar Feedback</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Seu nome ({currentUser?.name || 'Usuário'}) será registrado automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">Do que se trata?</Label>
              <RadioGroup value={type} onValueChange={setType} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sugestão de Melhoria" id="r1" />
                  <Label htmlFor="r1" className="text-slate-600 dark:text-slate-300 cursor-pointer">Sugestão de Melhoria</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Feedback" id="r2" />
                  <Label htmlFor="r2" className="text-slate-600 dark:text-slate-300 cursor-pointer">Feedback Geral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Erro" id="r3" />
                  <Label htmlFor="r3" className="text-slate-600 dark:text-slate-300 cursor-pointer">Relatar um Erro</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-slate-700 dark:text-slate-300 font-semibold">Mensagem</Label>
              <Textarea 
                id="feedback"
                placeholder="Descreva detalhadamente sua sugestão, feedback ou o erro encontrado..."
                className="min-h-[150px] resize-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Mensagem"
              )}
            </Button>
            
          </form>
        </CardContent>
      </Card>

      {/* ÁREA ADMIN */}
      {isAdmin && (
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Painel de Acompanhamento (Admin)</h2>
              <p className="text-slate-500 dark:text-slate-400">Visualize as respostas mais recentes enviadas pelo Pipefy.</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchFeedbacks} disabled={isLoadingFeedbacks} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingFeedbacks ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {isLoadingFeedbacks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3 dark:bg-slate-700" />
                    <Skeleton className="h-4 w-1/2 dark:bg-slate-700" />
                    <Skeleton className="h-20 w-full dark:bg-slate-700" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Nenhum feedback encontrado</h3>
              <p className="text-slate-500 dark:text-slate-400">Ainda não há registros no Pipe de feedbacks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map((item) => (
                <Card key={item.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.author}</CardTitle>
                      <CardDescription className="dark:text-slate-400 text-xs mt-1">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                      </CardDescription>
                    </div>
                    {getBadgeForType(item.type)}
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap line-clamp-5">
                      {item.content || <span className="italic text-slate-400">Sem conteúdo.</span>}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
