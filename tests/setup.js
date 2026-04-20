import { TextEncoder, TextDecoder } from 'util'

// Mock do NextAuth (prevents ESM issues with jose/openid-client)
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock do Resend (prevents API key error at module load time)
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}))

// Mock do @/lib/auth (prevents mail.ts → new Resend() chain)
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock do Prisma com todas as tabelas usadas nos testes
jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  enrollment: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  subscriptionPlan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  certificate: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  supportTicket: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  siteSettings: {
    findFirst: jest.fn(),
  },
  track: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  flashcard: {
    findMany: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  flashcardTemplate: {
    findMany: jest.fn(),
  },
  lessonProgress: {
    findMany: jest.fn(),
  },
}))

// Mock do Redis
jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    del: jest.fn(),
  },
}))

// Mock de variáveis de ambiente
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Configuração global do TextEncoder/Decoder para testes
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
