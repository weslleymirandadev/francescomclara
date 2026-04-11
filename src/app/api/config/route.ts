import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    if (!settings) {
      // Retornar configurações padrão se não encontrar no banco
      return NextResponse.json({
        siteIcon: '/static/default-icon.svg',
        highlightColor: '--clara-rose',
        siteName: 'Francês com Clara',
        favicon: '/static/favicon.svg'
      });
    }

    return NextResponse.json({
      siteIcon: settings.siteIcon || '/static/default-icon.svg',
      highlightColor: settings.highlightColor || '--clara-rose',
      siteName: settings.siteName || 'Francês com Clara',
      favicon: settings.favicon || '/static/favicon.svg'
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    
    // Retornar configurações padrão em caso de erro
    return NextResponse.json({
      siteIcon: '/static/default-icon.svg',
      highlightColor: '--clara-rose',
      siteName: 'Francês com Clara',
      favicon: '/static/favicon.svg'
    });
  }
}
