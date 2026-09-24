import prisma from '../lib/prisma.js'
import type { MessageSender } from '../generated/prisma/enums.js'

export const createMessage = async (data: {
  sessionId: string
  questionId: string | null
  sender: MessageSender
  message: string
}) => {
  return prisma.message.create({
    data,
  })
}

export const findMessagesBySession = async (sessionId: string) => {
  return prisma.message.findMany({
    where: {
      sessionId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}
