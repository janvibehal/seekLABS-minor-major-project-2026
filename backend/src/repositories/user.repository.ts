import prisma from '../lib/prisma.js'
import type { Role } from '../generated/prisma/enums.js'

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  })
}

export const createUser = async (data: {
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  role?: Role
}) => {
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role ?? 'CANDIDATE',
    },
  })
}

export const findUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
}