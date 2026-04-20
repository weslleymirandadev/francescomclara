// Mock das dependências
jest.mock('@/lib/prisma')
jest.mock('@/lib/subscription')

// Usa o mock global do Prisma definido em setup.js
const prisma = require('@/lib/prisma')

describe('/api/flashcards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Valores padrão para evitar erros de "Cannot read properties of undefined"
    prisma.lessonProgress.findMany.mockResolvedValue([])
    prisma.flashcardTemplate.findMany.mockResolvedValue([])
    prisma.flashcard.findMany.mockResolvedValue([])
    prisma.flashcard.upsert.mockResolvedValue({})
  })

  it('deve retornar 401 para usuário não autenticado', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const { GET } = require('@/app/api/flashcards/route')
    const req = new Request('http://localhost/api/flashcards')
    const response = await GET(req)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Não autorizado' })
  })

  it('deve retornar 403 para usuário sem acesso a flashcards', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({ canAccessFlashcards: false })

    const { GET } = require('@/app/api/flashcards/route')
    const req = new Request('http://localhost/api/flashcards')
    const response = await GET(req)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data).toEqual({ error: 'Flashcards não disponíveis no seu plano' })
  })

  it('deve retornar 10 flashcards para plano básico', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({
      canAccessFlashcards: true,
      hasUnlimitedFlashcards: false,
    })

    prisma.flashcard.findMany.mockResolvedValue([
      { id: 'card-1', front: 'Bonjour', back: 'Olá' },
      { id: 'card-2', front: 'Merci', back: 'Obrigado' },
    ])

    const { GET } = require('@/app/api/flashcards/route')
    const req = new Request('http://localhost/api/flashcards')
    const response = await GET(req)

    expect(prisma.flashcard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    )
    expect(response.status).toBe(200)
  })

  it('deve retornar 100 flashcards para plano premium', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({
      canAccessFlashcards: true,
      hasUnlimitedFlashcards: true,
    })

    prisma.flashcard.findMany.mockResolvedValue([
      { id: 'card-1', front: 'Bonjour', back: 'Olá' },
      { id: 'card-2', front: 'Merci', back: 'Obrigado' },
    ])

    const { GET } = require('@/app/api/flashcards/route')
    const req = new Request('http://localhost/api/flashcards')
    const response = await GET(req)

    expect(prisma.flashcard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    )
    expect(response.status).toBe(200)
  })
})
