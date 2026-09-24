import bcrypt from 'bcrypt'

import prisma from '../lib/prisma.js'

const createRecruiter = async () => {
  try {
    const passwordHash = await bcrypt.hash('Recruiter@123', 12)

    const recruiter = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'Recruiter',
        email: 'recruiter@test.com',
        passwordHash,
        role: 'RECRUITER',
        emailVerified: true,
        isActive: true,
      },
    })

    console.log('Recruiter created successfully:')
    console.log(recruiter)
  } catch (error) {
    console.error('Error creating recruiter:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRecruiter()