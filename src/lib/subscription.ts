import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "./prisma";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_TTL = 5 * 60;

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

const INITIAL_FEATURES: UserFeatures = {
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

export async function getUserFeatures(userId?: string): Promise<UserFeatures> {
  const session = userId ? null : await getServerSession(authOptions);
  const currentUserId = userId || session?.user?.id;

  if (!currentUserId) return INITIAL_FEATURES;

  try {
    const cached = await redis.get<UserFeatures>(
      `user_features:${currentUserId}`,
    );
    if (cached) return cached;
  } catch (e) {
    console.error("Redis error:", e);
  }

  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: currentUserId,
        plan: { active: true },
        OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
      },
      include: {
        plan: {
          include: {
            tracks: { include: { track: true } },
          },
        },
      },
    });

    if (!enrollment) {
      await redis.set(`user_features:${currentUserId}`, INITIAL_FEATURES, {
        ex: CACHE_TTL,
      });
      return INITIAL_FEATURES;
    }

    const features = (enrollment.plan.features as string[]) || [];

    const specificTracksIds = features
      .filter((f) => f.startsWith("track:"))
      .map((f) => f.split(":")[1]);

    const planTracks =
      enrollment.plan.tracks?.map((pt: any) => pt.track?.id).filter(Boolean) ||
      [];
    const allSpecificTracks = [
      ...new Set([...specificTracksIds, ...planTracks]),
    ];

    const familySlotsFeature = features.find((f) =>
      f.startsWith("family_slots:"),
    );
    const familySlotsCount = familySlotsFeature
      ? parseInt(familySlotsFeature.split(":")[1])
      : 0;

    const userFeatures: UserFeatures = {
      canAccessAllTracks: features.includes("all_tracks"),
      canAccessSpecificTracks: features.includes("specific_tracks"),
      canAccessForum: features.includes("forum_access"),
      canAccessFlashcards: features.includes("flashcards_access"),
      hasUnlimitedFlashcards: features.includes("flashcards"),
      hasOfflineMode: features.includes("offline_mode"),
      hasCertificate: features.includes("certificate"),
      hasPrioritySupport: features.includes("priority_support"),
      hasFamilySlots: features.includes("family_slots"),
      familySlotsCount,
      specificTracks: allSpecificTracks,
    };

    await redis.set(`user_features:${currentUserId}`, userFeatures, {
      ex: CACHE_TTL,
    });

    return userFeatures;
  } catch (error) {
    console.error("Erro ao buscar features do usuário:", error);
    return INITIAL_FEATURES;
  }
}

export async function invalidateUserFeaturesCache(userId: string) {
  try {
    await redis.del(`user_features:${userId}`);
  } catch (error) {
    console.error("Erro ao invalidar cache no Redis:", error);
  }
}

/**
 * Invalida todo o cache de features (útil para mudanças globais no admin).
 */
export async function invalidateAllFeaturesCache() {
  try {
    const keys = await redis.keys("user_features:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Erro ao invalidar todo o cache no Redis:", error);
  }
}
