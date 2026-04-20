// Mock das dependências
jest.mock('@/lib/prisma')
jest.mock('@/lib/subscription')

// Usa o mock global do Prisma definido em setup.js
const prisma = require('@/lib/prisma')

describe('/api/certificates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve retornar 401 para usuário não autenticado', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const { GET } = require('@/app/api/certificates/route')
    const req = new Request('http://localhost/api/certificates')
    const response = await GET(req)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Não autorizado' })
  })

  it('deve retornar 403 para usuário sem acesso a certificados', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({ hasCertificate: false })

    const { GET } = require('@/app/api/certificates/route')
    const req = new Request('http://localhost/api/certificates')
    const response = await GET(req)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data).toEqual({ error: 'Certificados não disponíveis no seu plano' })
  })

  it('deve gerar certificado para trilha concluída', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({ hasCertificate: true })

    const mockTrack = {
      id: 'track-1',
      name: 'Trilha Básica',
      objective: { name: 'Objetivo Básico' },
      modules: [
        {
          lessons: [
            { progress: [{ completed: true }] },
            { progress: [{ completed: true }] },
          ],
        },
        {
          lessons: [
            { progress: [{ completed: true }] },
          ],
        },
      ],
    }

    prisma.track.findMany.mockResolvedValue([mockTrack])
    prisma.certificate.findFirst.mockResolvedValue(null)
    prisma.certificate.create.mockResolvedValue({
      id: 'cert-1',
      certificateCode: 'CERT-USER1-TRACK1-abc123',
      userId: 'user-1',
      trackId: 'track-1',
      issuedAt: new Date(),
      completionDate: new Date(),
    })

    const { GET } = require('@/app/api/certificates/route')
    const req = new Request('http://localhost/api/certificates')
    const response = await GET(req)

    expect(prisma.certificate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          trackId: 'track-1',
          certificateCode: expect.stringMatching(/^CERT-/),
        }),
      })
    )
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({
      certificates: expect.arrayContaining([
        expect.objectContaining({
          trackName: 'Trilha Básica',
          isNew: true,
          totalLessons: 3,
        }),
      ]),
    })
  })

  it('deve retornar certificado existente sem criar novo', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({ hasCertificate: true })

    const existingCertificate = {
      id: 'cert-1',
      certificateCode: 'CERT-USER1-TRACK1-abc123',
      issuedAt: new Date(),
      completionDate: new Date(),
    }

    const mockTrack = {
      id: 'track-1',
      name: 'Trilha Básica',
      objective: { name: 'Objetivo Básico' },
      modules: [
        {
          lessons: [
            { progress: [{ completed: true }] },
          ],
        },
      ],
    }

    prisma.track.findMany.mockResolvedValue([mockTrack])
    prisma.certificate.findFirst.mockResolvedValue(existingCertificate)

    const { GET } = require('@/app/api/certificates/route')
    const req = new Request('http://localhost/api/certificates')
    const response = await GET(req)

    expect(prisma.certificate.create).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({
      certificates: expect.arrayContaining([
        expect.objectContaining({
          trackName: 'Trilha Básica',
          isNew: false,
        }),
      ]),
    })
  })

  it('deve retornar lista vazia para trilha não concluída', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const { getUserFeatures } = require('@/lib/subscription')
    getUserFeatures.mockResolvedValue({ hasCertificate: true })

    const mockTrack = {
      id: 'track-1',
      name: 'Trilha Incompleta',
      objective: { name: 'Objetivo' },
      modules: [
        {
          lessons: [
            { progress: [{ completed: true }] },
            { progress: [{ completed: false }] },
          ],
        },
      ],
    }

    prisma.track.findMany.mockResolvedValue([mockTrack])

    const { GET } = require('@/app/api/certificates/route')
    const req = new Request('http://localhost/api/certificates')
    const response = await GET(req)

    expect(prisma.certificate.create).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({
      certificates: [],
    })
  })
})
