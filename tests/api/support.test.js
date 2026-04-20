// Mock das dependências
jest.mock('@/lib/prisma')
jest.mock('@/lib/subscription')

// Usa o mock global do Prisma definido em setup.js
const prisma = require('@/lib/prisma')

describe('/api/support', () => {
  const defaultBody = {
    subject: 'Problema com acesso',
    message: 'Não consigo acessar minha conta',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve retornar 401 para usuário não autenticado', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const { POST } = require('@/app/api/support/route')
    const req = new Request('http://localhost/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultBody),
    })
    const response = await POST(req)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Não autorizado' })
  })

  it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { POST } = require('@/app/api/support/route')
    const req = new Request('http://localhost/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: '' }), // message ausente
    })
    const response = await POST(req)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Assunto e mensagem são obrigatórios' })
  })

  it('deve criar ticket com prioridade alta para plano premium', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({ hasPrioritySupport: true })

    const createdTicket = {
      id: 'ticket-1',
      userId: 'user-1',
      subject: 'Problema com acesso',
      message: 'Não consigo acessar minha conta',
      priority: 'HIGH',
      status: 'OPEN',
      isPriority: true,
      createdAt: new Date(),
    }
    prisma.supportTicket.create.mockResolvedValue(createdTicket)

    const { POST } = require('@/app/api/support/route')
    const req = new Request('http://localhost/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultBody),
    })
    const response = await POST(req)

    expect(prisma.supportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          subject: 'Problema com acesso',
          message: 'Não consigo acessar minha conta',
          priority: 'HIGH',
          isPriority: true,
        }),
      })
    )
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toMatchObject({
      ticket: expect.objectContaining({
        id: 'ticket-1',
        subject: 'Problema com acesso',
        priority: 'HIGH',
        isPriority: true,
      }),
      message: 'Seu ticket de suporte prioritário foi criado e será respondido em até 24h.',
    })
  })

  it('deve criar ticket com prioridade normal para plano básico', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({ hasPrioritySupport: false })

    const createdTicket = {
      id: 'ticket-1',
      userId: 'user-1',
      subject: 'Problema com acesso',
      message: 'Não consigo acessar minha conta',
      priority: 'NORMAL',
      status: 'OPEN',
      isPriority: false,
      createdAt: new Date(),
    }
    prisma.supportTicket.create.mockResolvedValue(createdTicket)

    const { POST } = require('@/app/api/support/route')
    const req = new Request('http://localhost/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultBody),
    })
    const response = await POST(req)

    expect(prisma.supportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          priority: 'NORMAL',
          isPriority: false,
        }),
      })
    )
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toMatchObject({
      message: 'Seu ticket de suporte foi criado e será respondido em até 72h.',
    })
  })

  it('deve listar tickets do usuário', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const existingTickets = [
      {
        id: 'ticket-1',
        subject: 'Problema anterior',
        status: 'RESOLVED',
        priority: 'HIGH',
        isPriority: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      },
    ]
    prisma.supportTicket.findMany.mockResolvedValue(existingTickets)

    const { GET } = require('@/app/api/support/route')
    const req = new Request('http://localhost/api/support')
    const response = await GET(req)

    expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
      })
    )
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(existingTickets)
  })
})
