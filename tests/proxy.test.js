const { NextRequest } = require('next/server')

// Mock das dependências
jest.mock('@/lib/prisma')
jest.mock('@/lib/subscription')
jest.mock('@/lib/permissions')
jest.mock('@/lib/redis')

describe('Proxy Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Prisma não retorna usuário banido por padrão
    const prisma = require('@/lib/prisma')
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.siteSettings.findFirst.mockResolvedValue(null)
  })

  describe('Verificação de Features em APIs', () => {
    it('deve bloquear acesso a flashcards sem permissão', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ canAccessFlashcards: false })

      const req = new NextRequest('http://localhost/api/flashcards', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      const result = await proxy(req)

      expect(result.status).toBe(403)
      const data = await result.json()
      expect(data).toEqual({ error: 'Flashcards não disponíveis no seu plano' })
    })

    it('deve permitir acesso a flashcards com permissão', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ canAccessFlashcards: true })

      const req = new NextRequest('http://localhost/api/flashcards', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      const result = await proxy(req)

      expect(result.status).toBe(200)
    })

    it('deve bloquear acesso a certificados sem permissão', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ hasCertificate: false })

      const req = new NextRequest('http://localhost/api/certificates', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      const result = await proxy(req)

      expect(result.status).toBe(403)
      const data = await result.json()
      expect(data).toEqual({ error: 'Certificados não disponíveis no seu plano' })
    })

    it('deve bloquear acesso a suporte sem permissão', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ hasPrioritySupport: false })

      const req = new NextRequest('http://localhost/api/support', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      const result = await proxy(req)

      expect(result.status).toBe(403)
      const data = await result.json()
      expect(data).toEqual({ error: 'Suporte prioritário não disponível no seu plano' })
    })
  })

  describe('Verificação de Features em Páginas', () => {
    it('deve redirecionar usuário sem acesso a flashcards', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ canAccessFlashcards: false })

      const req = new NextRequest('http://localhost/curso/track-1/flashcards', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      const result = await proxy(req)

      expect(result.status).toBe(307)
      expect(result.headers.get('location')).toContain('/dashboard')
    })

    it('deve redirecionar usuário sem acesso a certificados', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ hasCertificate: false })

      const req = new NextRequest('http://localhost/curso/track-1/certificates', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      const result = await proxy(req)

      expect(result.status).toBe(307)
      expect(result.headers.get('location')).toContain('/dashboard')
    })

    it('deve redirecionar usuário sem acesso a suporte', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ hasPrioritySupport: false })

      // A verificação de suporte está no bloco /curso/:id/support
      const req = new NextRequest('http://localhost/curso/track-1/support', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      const result = await proxy(req)

      expect(result.status).toBe(307)
      expect(result.headers.get('location')).toContain('/dashboard')
    })
  })

  describe('Invalidação de Cache', () => {
    it('deve invalidar cache do usuário a cada requisição', async () => {
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({ sub: 'user-1' })

      const { getUserFeatures, invalidateUserFeaturesCache } = require('@/lib/subscription')
      getUserFeatures.mockResolvedValue({ canAccessFlashcards: true })

      const req = new NextRequest('http://localhost/api/flashcards', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const { proxy } = require('@/proxy')
      await proxy(req)

      expect(invalidateUserFeaturesCache).toHaveBeenCalledWith('user-1')
    })
  })
})
