import { Router, } from "express";
import z from "zod";
import prisma from "../lib/prisma.js";
import getQueue from "../RabitMQ/db.js";
const router = Router();
const quaryValidator = z.object({
    page: z.string().default("1"),
    limit: z.string().default("10"),
    solved: z.enum(["true", "false"]).optional(),
});
router.get("/", async (req, res, next) => {
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
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // get data from db
        const [probs, total] = await prisma.$transaction([
            prisma.problem.findMany({
                skip,
                take: parseInt(limit),
                orderBy: { id: "asc" }
            }),
            prisma.problem.count(),
        ]);
        return res.status(200).json({
            status: true,
            message: "problems fetched successfully",
            data: { probs, total },
        });
    }
    catch (err) {
        next(err);
    }
});
const paramValidator = z.object({
    probId: z.string()
});
router.get("/:probId", (req, res, next) => {
    try {
        const params = req.params;
        const validate = paramValidator.safeParse(params);
        if (!validate.success) {
            return res.status(400).json({
                status: false,
                message: "params validation failed"
            });
        }
        const { probId } = validate.data;
        const prob = prisma.problem.findFirst({
            where: {
                id: parseInt(probId),
            },
        });
        if (!prob) {
            return res.status(404).json({
                status: false,
                message: "problem not found"
            });
        }
        return res.status(200).json({
            status: true,
            message: "problem fetched successfully",
            data: prob,
        });
    }
    catch (err) {
        next(err);
    }
});
const bodyValidator = z.object({
    language: z.enum(["ts", "python"]),
    code: z.string()
});
router.post("/submission/:probId", async (req, res, next) => {
    try {
        const params = req.params;
        const body = req.body;
        const user = req.user;
        if (!user)
            return res.status(401).json({});
        const validateParams = paramValidator.safeParse(params);
        const validateBody = bodyValidator.safeParse(body);
        if (!validateParams.success || !validateBody.success) {
            return res.status(400).json({
                status: false,
                message: "validation failed"
            });
        }
        const { probId } = validateParams.data;
        const { language, code } = validateBody.data;
        const prob = await prisma.problem.findFirst({
            where: {
                id: parseInt(probId),
            },
        });
        if (!prob) {
            return res.status(404).json({
                status: false,
                message: "problem not found"
            });
        }
        const submissionProps = {
            userId: user.id,
            problemId: probId,
            code,
            language: language,
            resultStatus: undefined,
            result: undefined
        };
        const submission = await prisma.submission.create({
            data: submissionProps
        });
        // send to queue for execution in sandbox
        const queue = await getQueue();
        queue.sendToQueue("tasks", Buffer.from(JSON.stringify({ language, code, functionName: prob.functionName, probId, submissionId: submission.id })), { persistent: true });
        return res.status(200).json({
            status: true,
            message: "successfully submitted, executing in background",
            data: submission
        });
    }
    catch (err) {
        next(err);
    }
});
const queryValidator = z.object({
    probId: z.string()
});
router.get("/submission", async (req, res, next) => {
    try {
        const query = req.query;
        const validate = queryValidator.safeParse(query);
        if (!validate.success) {
            return res.status(401).json({
                status: false,
                message: "query invalid"
            });
        }
        const { probId } = validate.data;
        const user = req.user;
        if (!user)
            return res.status(401).json({});
        const submission = prisma.submission.findMany({
            where: {
                userId: user.id,
                problemId: probId
            }
        });
        return res.status(200).json({
            status: true,
            message: "submission fetched successfully",
            data: submission
        });
    }
    catch (err) {
        next(err);
    }
});
const querySubIdValidator = z.object({
    subId: z.string()
});
router.get("/submission/:subId", async (req, res, next) => {
    try {
        const query = req.params;
        const validate = querySubIdValidator.safeParse(query);
        if (!validate.success) {
            return res.status(401).json({
                status: false,
                message: "query invalid"
            });
        }
        const { subId } = validate.data;
        const user = req.user;
        if (!user)
            return res.status(401).json({});
        const submission = prisma.submission.findFirst({
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
    }
    catch (err) {
        next(err);
    }
});
export default router;
