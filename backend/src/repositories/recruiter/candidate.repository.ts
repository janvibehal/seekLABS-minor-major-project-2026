import prisma from '../../lib/prisma.js'


// ─────────────────────────────────────────────
// FIND ALL CANDIDATES FOR A RECRUITER
// ─────────────────────────────────────────────

export const findCandidatesByRecruiter = async (
  recruiterId: string,
) => {
  return prisma.user.findMany({
    where: {
      role: 'CANDIDATE',

      candidateInterviews: {
        some: {
          recruiterId,
        },
      },
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,


      // ─────────────────────────────────────────
      // INTERVIEWS BELONGING TO THIS RECRUITER
      // ─────────────────────────────────────────

      candidateInterviews: {
        where: {
          recruiterId,
        },

        select: {
          id: true,
          title: true,
          type: true,
          company: true,
          scheduledAt: true,
          duration: true,
          status: true,


          // ─────────────────────────────────────
          // EVALUATION
          // ─────────────────────────────────────

          evaluation: {
            select: {
              id: true,

              overallScore: true,

              algorithmCorrectness: true,

              logicalReasoning: true,

              conceptCoverage: true,

              completeness: true,

              dataStructure: true,

              complexity: true,

              edgeCases: true,

              strengths: true,

              improvements: true,

              feedback: true,

              createdAt: true,
            },
          },
        },

        orderBy: {
          scheduledAt: 'desc',
        },
      },
    },

    orderBy: {
      firstName: 'asc',
    },
  })
}


// ─────────────────────────────────────────────
// FIND ONE CANDIDATE FOR A RECRUITER
// ─────────────────────────────────────────────

export const findCandidateByIdForRecruiter = async (
  candidateId: string,
  recruiterId: string,
) => {
  return prisma.user.findFirst({
    where: {
      id: candidateId,

      role: 'CANDIDATE',

      // Security:
      // Recruiter can only access candidates
      // who have interviews created by them.

      candidateInterviews: {
        some: {
          recruiterId,
        },
      },
    },

    select: {
      id: true,

      firstName: true,

      lastName: true,

      email: true,

      createdAt: true,


      // ─────────────────────────────────────────
      // CANDIDATE INTERVIEWS
      // ─────────────────────────────────────────

      candidateInterviews: {
        where: {
          recruiterId,
        },

        select: {
          id: true,

          title: true,

          type: true,

          company: true,

          focusAreas: true,

          scheduledAt: true,

          duration: true,

          status: true,


          // ─────────────────────────────────────
          // INTERVIEW SESSION
          // ─────────────────────────────────────

          session: {
            select: {
              id: true,

              status: true,

              startedAt: true,

              endedAt: true,

              durationSeconds: true,
            },
          },


          // ─────────────────────────────────────
          // AI EVALUATION
          // ─────────────────────────────────────

          evaluation: {
            select: {
              id: true,

              overallScore: true,

              algorithmCorrectness: true,

              logicalReasoning: true,

              conceptCoverage: true,

              completeness: true,

              dataStructure: true,

              complexity: true,

              edgeCases: true,

              strengths: true,

              improvements: true,

              feedback: true,

              createdAt: true,
            },
          },
        },

        orderBy: {
          scheduledAt: 'desc',
        },
      },
    },
  })
}
// ─────────────────────────────────────────────
// FIND ALL CANDIDATES FOR INTERVIEW SELECTION
// Used when recruiter creates a new interview.
// This intentionally does NOT require an existing
// interview with the recruiter.
// ─────────────────────────────────────────────

export const findAllCandidatesForSelection = async () => {
  return prisma.user.findMany({
    where: {
      role: 'CANDIDATE',
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
    },

    orderBy: {
      firstName: 'asc',
    },
  })
}