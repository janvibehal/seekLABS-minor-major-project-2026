import prisma from "../../lib/prisma.js";

export const createJob = async (data: {
    title: string;
    department?: string;
    location?: string;
    description: string;
    requirements: string[];
    recruiterId: string;
    questionIds?: string[];
}) => {
    const {
        title,
        department,
        location,
        description,
        requirements,
        recruiterId,
        questionIds = [],
    } = data;

    return prisma.job.create({
        data: {
            title,

            ...(department !== undefined && {
                department,
            }),

            ...(location !== undefined && {
                location,
            }),

            description,
            requirements,
            recruiterId,

            questions: {
                create: questionIds.map((questionId, index) => ({
                    questionId,
                    order: index,
                })),
            },
        },

        include: {
            questions: {
                include: {
                    question: true,
                },
                orderBy: {
                    order: "asc",
                },
            },

            recruiter: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
};


export const findJobsByRecruiterId = async (
    recruiterId: string
) => {
    return prisma.job.findMany({
        where: {
            recruiterId,
        },

        include: {
            questions: {
                include: {
                    question: true,
                },
                orderBy: {
                    order: "asc",
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};


export const findJobById = async (
    jobId: string,
    recruiterId: string
) => {
    return prisma.job.findFirst({
        where: {
            id: jobId,
            recruiterId,
        },

        include: {
            questions: {
                include: {
                    question: true,
                },
                orderBy: {
                    order: "asc",
                },
            },

            recruiter: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
};


export const deleteJobById = async (
    jobId: string,
    recruiterId: string
) => {
    return prisma.job.deleteMany({
        where: {
            id: jobId,
            recruiterId,
        },
    });
};