"use client";

export default function PrivacyAndTerms() {
  const lastUpdate = "16 de Abril de 2026";

  return (
    <main className="min-h-screen bg-(--slate-50) pb-24 animate-in fade-in duration-700">
      <section className="bg-(--slate-900) pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-6 border border-white/20">
            Documentação Legal
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Privacidade &{" "}
            <span className="text-(--interface-accent)">Termos</span>
          </h1>
          <p className="text-slate-400 font-medium">
            Última atualização: {lastUpdate}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 md:p-16">
          <div className="flex flex-wrap gap-4 mb-16 pb-8 border-b border-slate-100">
            <a
              href="#termos"
              className="text-xs font-black uppercase tracking-widest text-(--interface-accent) hover:opacity-70"
            >
              01. Termos de Uso
            </a>
            <a
              href="#privacidade"
              className="text-xs font-black uppercase tracking-widest text-(--interface-accent) hover:opacity-70"
            >
              02. Política de Privacidade
            </a>
            <a
              href="#reembolso"
              className="text-xs font-black uppercase tracking-widest text-(--interface-accent) hover:opacity-70"
            >
              03. Reembolso
            </a>
          </div>

          {/* --- SEÇÃO 01: TERMOS DE USO --- */}
          <article id="termos" className="prose prose-slate max-w-none mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                01
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight m-0 text-slate-900">
                Termos de Uso
              </h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>
                Ao acessar a plataforma <strong>Francês com Clara</strong>, você
                concorda em cumprir estes termos de serviço:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Acesso Individual:</strong> Sua conta é pessoal e
                  intransferível. O compartilhamento de senhas pode resultar no
                  bloqueio automático da conta sem direito a reembolso.
                </li>
                <li>
                  <strong>Propriedade Intelectual:</strong> Todo o conteúdo
                  (vídeos, PDFs, flashcards, áudios) é de propriedade exclusiva.
                  É terminantemente proibido baixar, gravar ou distribuir o
                  material sem autorização.
                </li>
                <li>
                  <strong>Conduta no Fórum:</strong> Valorizamos o respeito.
                  Comentários ofensivos, preconceituosos ou SPAM resultarão em
                  banimento imediato do ambiente de comunidade.
                </li>
              </ul>
            </div>
          </article>

          {/* --- SEÇÃO 02: PRIVACIDADE --- */}
          <article
            id="privacidade"
            className="prose prose-slate max-w-none mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-sm">
                02
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight m-0 text-slate-900">
                Privacidade de Dados
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              Estamos em conformidade com a{" "}
              <strong>LGPD (Lei Geral de Proteção de Dados)</strong>. Seus dados
              estão seguros conosco:
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4">
              <ul className="text-xs text-slate-500 space-y-3 m-0 list-none">
                <li className="flex gap-2">
                  <strong>•</strong>{" "}
                  <span>
                    <strong>Pagamentos:</strong> Não armazenamos seus dados de
                    cartão. Todo o processamento é feito via Stripe/Mercado Pago
                    com criptografia de ponta a ponta.
                  </span>
                </li>
                <li>
                  <strong>•</strong>{" "}
                  <span>
                    <strong>Cookies:</strong> Utilizamos apenas cookies
                    essenciais para manter sua sessão ativa e salvar seu
                    progresso nas lições.
                  </span>
                </li>
                <li>
                  <strong>•</strong>{" "}
                  <span>
                    <strong>E-mail:</strong> Usamos seu e-mail apenas para
                    notificações da plataforma e suporte técnico.
                  </span>
                </li>
              </ul>
            </div>
          </article>

          {/* --- SEÇÃO 03: REEMBOLSO E CANCELAMENTO --- */}
          <article id="reembolso" className="prose prose-slate max-w-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-(--interface-accent) text-white flex items-center justify-center font-black text-sm">
                03
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight m-0 text-slate-900">
                Cancelamento e Reembolso
              </h2>
            </div>
            <div className="text-slate-600 leading-relaxed text-sm space-y-4">
              <p>
                Garantimos o seu direito de arrependimento conforme o{" "}
                <strong>Art. 49 do CDC</strong>:
              </p>
              <div className="border-l-4 border-pink-500 pl-4 py-2 bg-pink-50/50 rounded-r-xl">
                <p className="font-bold text-pink-700 m-0">
                  Garantia Incondicional de 7 Dias
                </p>
                <p className="m-0 text-pink-600/80">
                  Se você não gostar da metodologia em até 7 dias após o
                  pagamento, devolvemos 100% do seu dinheiro sem perguntas.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Renovação Automática:</strong> As assinaturas são
                  renovadas automaticamente ao fim do período. Você pode
                  cancelar a renovação a qualquer momento nas configurações.
                </li>
                <li>
                  <strong>Plano Família:</strong> O titular é responsável por
                  gerenciar os membros. O cancelamento do plano titular remove o
                  acesso de todos os dependentes.
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
