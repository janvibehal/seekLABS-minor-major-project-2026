import prisma from '../lib/prisma.js'

export const createRefreshToken = async (data: {
  tokenHash: string
  userId: string
  expiresAt: Date
}) => {
  return prisma.refreshToken.create({
    data,
  })
}

export const findRefreshToken = async (tokenHash: string) => {
  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  })
}

export const revokeRefreshToken = async (tokenHash: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}