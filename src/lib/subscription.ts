import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "./prisma";

// Cache simples para features (em produção, usar Redis)
const featuresCache = new Map<string, { features: UserFeatures; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export interface UserFeatures {
  canAccessAllTracks: boolean;
  canAccessSpecificTracks: boolean;
  canAccessForum: boolean;
  canAccessFlashcards: boolean;
  hasUnlimitedFlashcards: boolean;
  hasOfflineMode: boolean;
  hasCertificate: boolean;
  hasPrioritySupport: boolean;
  hasFamilySlots: boolean;
  familySlotsCount?: number;
  specificTracks: string[];
}

// Função para invalidar cache de um usuário específico
export function invalidateUserFeaturesCache(userId: string) {
  featuresCache.delete(userId);
}

// Função para invalidar todo o cache (quando planos são atualizados no admin)
export function invalidateAllFeaturesCache() {
  featuresCache.clear();
}

export async function getUserFeatures(userId?: string): Promise<UserFeatures> {
  const session = userId ? null : await getServerSession(authOptions);
  const currentUserId = userId || session?.user?.id;

  if (!currentUserId) {
    return {
      canAccessAllTracks: false,
      canAccessSpecificTracks: false,
      canAccessForum: false,
      canAccessFlashcards: false,
      hasUnlimitedFlashcards: false,
      hasOfflineMode: false,
      hasCertificate: false,
      hasPrioritySupport: false,
      hasFamilySlots: false,
      specificTracks: [],
    };
  }

  // Verificar cache
  const cached = featuresCache.get(currentUserId);
  if (cached && cached.expires > Date.now()) {
    return cached.features;
  }

  try {
    // Buscar inscrição ATIVA do usuário (verificação em tempo real)
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: currentUserId,
        plan: {
          active: true // Garante que o plano está ativo
        },
        OR: [
          { endDate: { gte: new Date() } },
          { endDate: null }
        ]
      },
      include: {
        plan: {
          include: {
            // Incluir relação com trilhas para verificar acesso específico
            tracks: {
              include: {
                track: true
              }
            }
          }
        }
      }
    });

    if (!enrollment || !enrollment.plan.active) {
      const defaultFeatures: UserFeatures = {
        canAccessAllTracks: false,
        canAccessSpecificTracks: false,
        canAccessForum: false,
        canAccessFlashcards: false,
        hasUnlimitedFlashcards: false,
        hasOfflineMode: false,
        hasCertificate: false,
        hasPrioritySupport: false,
        hasFamilySlots: false,
        specificTracks: [],
      };

      // Salvar no cache
      featuresCache.set(currentUserId, {
        features: defaultFeatures,
        expires: Date.now() + CACHE_TTL
      });

      return defaultFeatures;
    }

    const features = enrollment.plan.features as string[] || [];
    const specificTracks = features.filter(f => f.startsWith('track:')).map(f => f.split(':')[1]);
    
    // Adicionar trilhas específicas do plano
    const planTracks = enrollment.plan.tracks?.map((pt: any) => pt.track?.id).filter(Boolean) || [];
    const allSpecificTracks = [...new Set([...specificTracks, ...planTracks])];

    const familySlotsFeature = features.find(f => f.startsWith('family_slots:'));
    const familySlotsCount = familySlotsFeature ? parseInt(familySlotsFeature.split(':')[1]) : 0;

    const userFeatures: UserFeatures = {
      canAccessAllTracks: features.includes('all_tracks'),
      canAccessSpecificTracks: features.includes('specific_tracks'),
      canAccessForum: features.includes('forum_access'),
      canAccessFlashcards: features.includes('flashcards_access'),
      hasUnlimitedFlashcards: features.includes('flashcards'),
      hasOfflineMode: features.includes('offline_mode'),
      hasCertificate: features.includes('certificate'),
      hasPrioritySupport: features.includes('priority_support'),
      hasFamilySlots: features.includes('family_slots'),
      familySlotsCount,
      specificTracks: allSpecificTracks,
    };

    // Salvar no cache
    featuresCache.set(currentUserId, {
      features: userFeatures,
      expires: Date.now() + CACHE_TTL
    });

    return userFeatures;
  } catch (error) {
    console.error('Erro ao buscar features do usuário:', error);
    const errorFeatures = {
      canAccessAllTracks: false,
      canAccessSpecificTracks: false,
      canAccessForum: false,
      canAccessFlashcards: false,
      hasUnlimitedFlashcards: false,
      hasOfflineMode: false,
      hasCertificate: false,
      hasPrioritySupport: false,
      hasFamilySlots: false,
      specificTracks: [],
    };

    // Salvar features de erro no cache por menos tempo
    featuresCache.set(currentUserId, {
      features: errorFeatures,
      expires: Date.now() + (60 * 1000) // 1 minuto apenas
    });

    return errorFeatures;
  }
}

export async function requireFeature(feature: keyof UserFeatures, userId?: string): Promise<boolean> {
  const features = await getUserFeatures(userId);
  return Boolean(features[feature]);
}

export async function requireAnyFeature(features: (keyof UserFeatures)[], userId?: string): Promise<boolean> {
  const userFeatures = await getUserFeatures(userId);
  return features.some(feature => Boolean(userFeatures[feature]));
}

export async function requireAllFeatures(features: (keyof UserFeatures)[], userId?: string): Promise<boolean> {
  const userFeatures = await getUserFeatures(userId);
  return features.every(feature => Boolean(userFeatures[feature]));
}
