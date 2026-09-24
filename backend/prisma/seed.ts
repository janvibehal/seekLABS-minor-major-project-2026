import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'
import bcrypt from 'bcrypt'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10)

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
    create: {
      firstName: 'Anjali',
      lastName: 'Dass',
      email: 'candidate@example.com',
      passwordHash,
      role: 'CANDIDATE',
      emailVerified: true,
    },
  })

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: {
      firstName: 'Test',
      lastName: 'Recruiter',
      email: 'recruiter@example.com',
      passwordHash,
      role: 'RECRUITER',
      emailVerified: true,
    },
  })

  const questionData = [
    {
      title: 'Two Sum',
      difficulty: 'EASY' as const,
      topics: ['Arrays', 'Hash Map'],
      description:
        'Given an array of integers and a target value, find two numbers that add up to the target.',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'nums[0] + nums[1] = 2 + 7 = 9.',
        },
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
      ],
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'MEDIUM' as const,
      topics: ['Strings', 'Sliding Window'],
      description:
        'Given a string s, find the length of the longest substring without repeating characters.',
      examples: [
        {
          input: 's = "abcabcbb"',
          output: '3',
          explanation: 'The answer is "abc", with a length of 3.',
        },
      ],
      constraints: [
        '0 <= s.length <= 5 * 10^4',
        's consists of English letters, digits, symbols and spaces.',
      ],
    },
    {
      title: 'Binary Tree Preorder Traversal',
      difficulty: 'MEDIUM' as const,
      topics: ['Trees', 'Recursion'],
      description:
        'Given the root of a binary tree, return the preorder traversal of its nodes.',
      examples: [
        {
          input: 'root = [1,null,2,3]',
          output: '[1,2,3]',
          explanation: 'Visit the root, then the left subtree, then the right subtree.',
        },
      ],
      constraints: ['The number of nodes is between 0 and 100.', '-100 <= Node.val <= 100'],
    },
  ]

  const questions = []
  for (const q of questionData) {
    const question = await prisma.question.create({ data: q })
    questions.push(question)
  }

  const interview = await prisma.interview.create({
    data: {
      title: 'Backend Developer Interview',
      type: 'Technical Coding Interview',
      company: 'Tech Solutions',
      focusAreas: ['Data Structures', 'Algorithms', 'Problem Solving'],
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 45,
      status: 'SCHEDULED',
      candidate: {
        connect: {
          id: candidate.id,
        },
      },
      recruiter: {
        connect: {
          id: recruiter.id,
        },
      },
      questions: {
        create: questions.map((question, index) => ({
          questionId: question.id,
          order: index,
        })),
      },
    },
  })

  console.log('Seeded candidate:', candidate.email, '(password: Password123!)')
  console.log('Seeded interview:', interview.id)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
