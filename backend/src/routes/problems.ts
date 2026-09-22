import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";
import z from "zod";
import prisma from "../lib/prisma.js";
import getQueue from "../RabitMQ/db.js"
import { Prisma } from "../generated/prisma/client.js";

const router = Router();

const quaryValidator = z.object({
    page: z.string().default("1"),
    limit: z.string().default("10"),
    solved: z.enum(["true", "false"]).optional(),
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.query;
        const validate = quaryValidator.safeParse(data);

        if (!validate.success) {
            return res.status(400).json({
                status: false,
                message: "query validation failed" + validate.error,
            });
        }

        const { page, limit, solved } = validate.data;
        const skip: number = (parseInt(page) - 1) * parseInt(limit);

        // get data from db
        const [probs, total] = await prisma.$transaction([
            prisma.problem.findMany({
                skip,
                take: parseInt(limit),
                orderBy: { id: "asc" }
            }),
            prisma.problem.count(),
        ])

        return res.status(200).json({
            status: true,
            message: "problems fetched successfully",
            data: { probs, total },
        });
    } catch (err) {
        next(err);
    }
});

const paramValidator = z.object({
    probId: z.string()
});

router.get("/:probId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = req.params;

        const validate = paramValidator.safeParse(params);

        if (!validate.success) {
            return res.status(400).json({
                status: false,
                message: "params validation failed"
            })
        }

        const { probId } = validate.data;

        // with two first testcases
        const prob = await prisma.problem.findFirst({
            where: {
                id: parseInt(probId),
            },
            include: {
                tests: {
                    take: 2,
                    select: {
                        input: true,
                        expected: true
                    }
                }
            },
        })

        if (!prob) {
            return res.status(404).json({
                status: false,
                message: "problem not found"
            })
        }

        return res.status(200).json({
            status: true,
            message: "problem fetched successfully",
            data: prob,
        });
    } catch (err) {
        next(err);
    }
});

const bodyValidator = z.object({
    language: z.enum(["ts", "js", "python"]),
    code: z.string()
})

router.post("/submission/:probId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = req.params;
        const body = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({});

        const validateParams = paramValidator.safeParse(params);
        const validateBody = bodyValidator.safeParse(body);

        if (!validateParams.success || !validateBody.success) {
            return res.status(400).json({
                status: false,
                message: "validation failed"
            })
        }

        const { probId } = validateParams.data;
        const { language, code } = validateBody.data;

        const prob = await prisma.problem.findFirst({
            where: {
                id: parseInt(probId),
            },
        })

        if (!prob) {
            return res.status(404).json({
                status: false,
                message: "problem not found"
            })
        }

        const submissionProps: Prisma.SubmissionCreateInput = {
            userId: user.id,
            problemId: probId,
            code,
            language: language as string,
            resultStatus: undefined,
            result: undefined

        }

        const submission = await prisma.submission.create({
            data: submissionProps
        })

        // send to queue for execution in sandbox
        const queue = await getQueue.getQueue();

        queue.sendToQueue(
            "tasks",
            Buffer.from(JSON.stringify({ language, code, functionName: prob.functionName, probId, submissionId: submission.id })),
            { persistent: true }
        );

        return res.status(200).json({
            status: true,
            message: "successfully submitted, executing in background",
            data: submission
        });
    } catch (err) {
        next(err)
    }
})

const queryValidator = z.object({
    probId: z.string()
})

router.get("/submission", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query

        const validate = queryValidator.safeParse(query);

        if (!validate.success) {
            return res.status(401).json({
                status: false,
                message: "query invalid"
            })
        }

        const { probId } = validate.data;
        const user = req.user;

        if (!user) return res.status(401).json({});

        const submissions = await prisma.submission.findMany({
            where: {
                userId: user.id,
                problemId: probId
            }
        });

        return res.status(200).json({
            status: true,
            message: "submission fetched successfully",
            data: submissions
        });
    } catch (err) {
        next(err);
    }
})

const querySubIdValidator = z.object({
    subId: z.string()
})

router.get("/submission/:subId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.params;

        const validate = querySubIdValidator.safeParse(query);

        if (!validate.success) {
            return res.status(401).json({
                status: false,
                message: "query invalid"
            })
        }

        const { subId } = validate.data;
        const user = req.user;

        if (!user) return res.status(401).json({});

        const submission = await prisma.submission.findFirst({
            where: {
                id: parseInt(subId),
                userId: user.id
            }
        });

        if (!submission) {
            return res.status(400).json({
                status: false,
                message: "incorrect subId"
            });
        }

        return res.status(200).json({
            status: true,
            message: "submission fetched successfully",
            data: submission
        });
    } catch (err) {
        next(err);
    }
})

export default router;
