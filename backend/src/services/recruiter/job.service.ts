import {
    createJob,
    findJobsByRecruiterId,
    findJobById,
    deleteJobById,
} from "../../repositories/recruiter/job.repository.js";

import type { CreateJobInput } from "../../validators/recruiter/job.validator.js";


export const createRecruiterJob = async (
    recruiterId: string,
    data: CreateJobInput
) => {
    return createJob({
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        recruiterId,
        questionIds: data.questionIds,

        ...(data.department !== undefined && {
            department: data.department,
        }),

        ...(data.location !== undefined && {
            location: data.location,
        }),
    });
};


export const getRecruiterJobs = async (
    recruiterId: string
) => {
    return findJobsByRecruiterId(recruiterId);
};


export const getRecruiterJobById = async (
    recruiterId: string,
    jobId: string
) => {
    const job = await findJobById(
        jobId,
        recruiterId
    );

    if (!job) {
        throw new Error("Job not found");
    }

    return job;
};


export const removeRecruiterJob = async (
    recruiterId: string,
    jobId: string
) => {
    const result = await deleteJobById(
        jobId,
        recruiterId
    );

    if (result.count === 0) {
        throw new Error("Job not found");
    }

    return {
        message: "Job deleted successfully",
    };
};