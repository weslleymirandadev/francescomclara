import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://francescomclara.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',     // Área restrita
        '/configuracoes/', // Configurações do usuário
        '/perfil/',        // Dados do aluno
        '/api/',           // Rotas de backend
        '/auth/',          // Páginas de login/registro
        '/admin/',         // Painel administrativo
        '/assinar/',       // Página de assinatura
        '/curso/',         // Conteúdo do curso
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}