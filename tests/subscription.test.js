const {
  getUserFeatures,
  requireFeature,
  requireAnyFeature,
  requireAllFeatures,
  invalidateUserFeaturesCache,
  invalidateAllFeaturesCache,
} = require('@/lib/subscription')

// Usa o mock global do Prisma definido em setup.js
const prisma = require('@/lib/prisma')

// Override do mock de next-auth para este arquivo
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('Subscription Features', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    invalidateAllFeaturesCache()
  })

  describe('getUserFeatures', () => {
    it('deve retornar features padrão para usuário não autenticado', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const features = await getUserFeatures()

      expect(features.canAccessAllTracks).toBe(false)
      expect(features.hasCertificate).toBe(false)
      expect(features.hasPrioritySupport).toBe(false)
      expect(features.hasUnlimitedFlashcards).toBe(false)
    })

    it('deve retornar features do plano ativo do usuário', async () => {
      const mockPlan = {
        id: 'plan-1',
        active: true,
        features: ['flashcards', 'certificate', 'priority_support'],
        tracks: [],
      }

      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({ userId: 'user-1', plan: mockPlan })

      const features = await getUserFeatures()

      expect(features.hasUnlimitedFlashcards).toBe(true)
      expect(features.hasCertificate).toBe(true)
      expect(features.hasPrioritySupport).toBe(true)
      expect(features.canAccessAllTracks).toBe(false)
    })

    it('deve retornar features padrão quando plano está inativo', async () => {
      const mockPlan = {
        id: 'plan-1',
        active: false,
        features: ['flashcards', 'certificate'],
        tracks: [],
      }

      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({ userId: 'user-1', plan: mockPlan })

      const features = await getUserFeatures()

      expect(features.hasUnlimitedFlashcards).toBe(false)
      expect(features.hasCertificate).toBe(false)
      expect(features.hasPrioritySupport).toBe(false)
    })

    it('deve incluir trilhas específicas do plano', async () => {
      const mockPlan = {
        id: 'plan-1',
        active: true,
        features: ['specific_tracks', 'track:track-1', 'track:track-2'],
        tracks: [{ track: { id: 'track-3' } }],
      }

      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({ userId: 'user-1', plan: mockPlan })

      const features = await getUserFeatures()

      expect(features.specificTracks).toContain('track-1')
      expect(features.specificTracks).toContain('track-2')
      expect(features.specificTracks).toContain('track-3')
    })
  })

  describe('requireFeature', () => {
    it('deve retornar true quando usuário tem a feature', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({
        plan: { active: true, features: ['flashcards'], tracks: [] },
      })

      const result = await requireFeature('hasUnlimitedFlashcards')
      expect(result).toBe(true)
    })

    it('deve retornar false quando usuário não tem a feature', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({
        plan: { active: true, features: ['certificate'], tracks: [] },
      })

      const result = await requireFeature('hasUnlimitedFlashcards')
      expect(result).toBe(false)
    })
  })

  describe('requireAnyFeature', () => {
    it('deve retornar true quando usuário tem pelo menos uma das features', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({
        plan: { active: true, features: ['flashcards'], tracks: [] },
      })

      const result = await requireAnyFeature(['hasUnlimitedFlashcards', 'hasCertificate'])
      expect(result).toBe(true)
    })

    it('deve retornar false quando usuário não tem nenhuma das features', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({
        plan: { active: true, features: [], tracks: [] },
      })

      const result = await requireAnyFeature(['hasUnlimitedFlashcards', 'hasCertificate'])
      expect(result).toBe(false)
    })
  })

  describe('requireAllFeatures', () => {
    it('deve retornar true quando usuário tem todas as features', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({
        plan: { active: true, features: ['flashcards', 'certificate'], tracks: [] },
      })

      const result = await requireAllFeatures(['hasUnlimitedFlashcards', 'hasCertificate'])
      expect(result).toBe(true)
    })

    it('deve retornar false quando usuário não tem alguma das features', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
      prisma.enrollment.findFirst.mockResolvedValue({
        plan: { active: true, features: ['flashcards'], tracks: [] },
      })

      const result = await requireAllFeatures(['hasUnlimitedFlashcards', 'hasCertificate'])
      expect(result).toBe(false)
    })
  })

  describe('Cache Management', () => {
    it('deve invalidar cache de usuário específico sem erros', () => {
      expect(() => invalidateUserFeaturesCache('user-1')).not.toThrow()
    })

    it('deve invalidar cache de todos os usuários sem erros', () => {
      expect(() => invalidateAllFeaturesCache()).not.toThrow()
    })
  })
})
