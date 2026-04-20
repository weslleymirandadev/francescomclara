"use client";

import { useState, useEffect } from "react";
import { FiAward, FiDownload, FiClock, FiCheckCircle, FiLock } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Loading } from "@/components/ui/loading";

interface Certificate {
  id: string;
  trackName: string;
  objectiveName: string;
  certificateCode: string;
  issuedAt: string;
  completionDate: string;
  totalLessons: number;
  isNew: boolean;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userFeatures, setUserFeatures] = useState<any>(null);

  useEffect(() => {
    loadUserFeatures();
    loadCertificates();
  }, []);

  const loadUserFeatures = async () => {
    try {
      const res = await fetch("/api/user/features");
      if (res.ok) {
        const features = await res.json();
        setUserFeatures(features);
      }
    } catch (error) {
      console.error("Erro ao carregar features:", error);
    }
  };

  const loadCertificates = async () => {
    try {
      const res = await fetch("/api/certificates");
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error("Erro ao carregar certificados:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: string) => {
    try {
      // TODO: Implementar geração de PDF
      toast.success("Download do certificado em breve disponível!");
    } catch (error) {
      toast.error("Erro ao baixar certificado");
    }
  };

  const shareCertificate = async (certificate: Certificate) => {
    const shareText = `Concluí a trilha "${certificate.trackName}" na plataforma Francês com Clara! 🎓\n\nCódigo do certificado: ${certificate.certificateCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Certificado de Conclusão",
          text: shareText,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback para copiar para área de transferência
      navigator.clipboard.writeText(shareText);
      toast.success("Texto copiado para a área de transferência!");
    }
  };

  if (loading) return <Loading />;

  if (!userFeatures?.hasCertificate) {
    return (
      <div className="max-w-4xl mx-auto pt-20 text-center">
        <div className="bg-white p-12 rounded-md md:rounded-3xl shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLock size={32} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">
            Certificados Não Disponíveis
          </h2>
          <p className="text-slate-500 font-medium mb-6">
            Os certificados de conclusão estão disponíveis apenas para planos premium.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-slate-900 text-white rounded-md md:rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Ver Planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-10 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">
          Meus Certificados
        </h1>
        <p className="text-slate-500">
          Certificados de conclusão das trilhas que você finalizou
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white p-12 rounded-md md:rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAward size={32} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">
            Nenhum Certificado Ainda
          </h2>
          <p className="text-slate-500 font-medium mb-6">
            Complete todas as lições de uma trilha para gerar seu certificado.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-slate-900 text-white rounded-md md:rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Continuar Estudando
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg ${
                certificate.isNew 
                  ? "border-blue-200 bg-blue-50" 
                  : "border-slate-100"
              }`}
            >
              {certificate.isNew && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-black uppercase rounded-full mb-4">
                  <FiCheckCircle size={12} />
                  Novo
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FiAward size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    Código
                  </div>
                  <div className="text-xs font-mono font-black text-slate-600">
                    {certificate.certificateCode.slice(-8)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-slate-800 mb-1">
                  {certificate.trackName}
                </h3>
                <p className="text-sm text-slate-500">
                  {certificate.objectiveName}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <FiClock size={12} />
                  {certificate.totalLessons} aulas
                </div>
                <div>
                  {new Date(certificate.completionDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadCertificate(certificate.id)}
                  className="flex-1 py-2 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-1"
                >
                  <FiDownload size={14} />
                  Baixar
                </button>
                <button
                  onClick={() => shareCertificate(certificate)}
                  className="flex-1 py-2 border border-slate-200 text-slate-700 text-xs font-black uppercase rounded-xl hover:bg-slate-50 transition-all"
                >
                  Compartilhar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações sobre certificados */}
      <div className="mt-12 bg-linear-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-4">
          Sobre os Certificados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-slate-700 mb-2">🎓 Autenticidade</h4>
            <p className="text-sm text-slate-600">
              Cada certificado possui um código único que pode ser verificado para comprovar sua autenticidade.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 mb-2">📱 Compartilhamento</h4>
            <p className="text-sm text-slate-600">
              Compartilhe suas conquistas no LinkedIn e outras redes sociais para destacar seu aprendizado.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 mb-2">🔍 Verificação</h4>
            <p className="text-sm text-slate-600">
              Empresas e instituições podem verificar a validade do certificado através do código único.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 mb-2">🌐 Reconhecimento</h4>
            <p className="text-sm text-slate-600">
              Certificados são reconhecidos como comprovação de seu nível de proficiência em francês.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
