"use client";

import { Icon } from "@iconify/react";
import { SectionDivider } from "@/components/ui/sectiondivider";

export default function PrivacyAndTerms() {
  const lastUpdate = "25 de Janeiro de 2026";

  return (
    <main className="min-h-screen bg-(--slate-50) pb-24 animate-in fade-in duration-700">
      <section className="bg-(--slate-900) pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-6 border border-white/20">
            Documentação Legal
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Privacidade & <span className="text-(--interface-accent)">Termos</span>
          </h1>
          <p className="text-slate-400 font-medium">Última atualização: {lastUpdate}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 md:p-16">
          
          <div className="flex flex-wrap gap-4 mb-16 pb-8 border-b border-slate-100">
            <a href="#termos" className="text-xs font-black uppercase tracking-widest text-(--interface-accent) hover:opacity-70">01. Termos de Uso</a>
            <a href="#privacidade" className="text-xs font-black uppercase tracking-widest text-(--interface-accent) hover:opacity-70">02. Política de Privacidade</a>
            <a href="#reembolso" className="text-xs font-black uppercase tracking-widest text-(--interface-accent) hover:opacity-70">03. Reembolso</a>
          </div>

          <article id="termos" className="prose prose-slate max-w-none mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">01</div>
              <h2 className="text-2xl font-black uppercase tracking-tight m-0">Termos de Uso</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Ao acessar a plataforma <strong>Francês com Clara</strong>, você concorda em cumprir estes termos de serviço. O acesso ao conteúdo das trilhas é pessoal, intransferível e condicionado à manutenção de uma assinatura ativa (para conteúdos Premium).
            </p>
            <ul className="space-y-4 text-slate-600">
              <li><strong>Uso da Conta:</strong> Você é responsável por manter a confidencialidade dos seus dados de login.</li>
              <li><strong>Propriedade Intelectual:</strong> Todos os vídeos, PDFs, flashcards e áudios são de propriedade exclusiva, sendo proibida a reprodução ou distribuição não autorizada.</li>
            </ul>
          </article>

          <article id="privacidade" className="prose prose-slate max-w-none mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">02</div>
              <h2 className="text-2xl font-black uppercase tracking-tight m-0">Política de Privacidade</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Valorizamos sua privacidade. Coletamos dados como nome, e-mail e progresso nas lições apenas para personalizar sua experiência de aprendizado.
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Quais dados coletamos?</h4>
              <ul className="text-sm text-slate-500 space-y-2 m-0">
                <li>Dados de autenticação via Google/NextAuth.</li>
                <li>Histórico de lições completadas para cálculo de progresso.</li>
                <li>Informações de pagamento (processadas de forma segura via Stripe/provedor, nunca armazenadas em nossos servidores).</li>
              </ul>
            </div>
          </article>

          <article id="reembolso" className="prose prose-slate max-w-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-(--interface-accent) text-white flex items-center justify-center font-black text-sm">03</div>
              <h2 className="text-2xl font-black uppercase tracking-tight m-0">Cancelamento e Reembolso</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Conforme o Código de Defesa do Consumidor, você tem até <strong>7 dias</strong> após a assinatura para solicitar o reembolso total caso não esteja satisfeito com a plataforma.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}