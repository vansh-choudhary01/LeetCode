import { Channel } from "amqplib";
import getQueue from "../RabitMQ/db";
import prisma from "../lib/prisma";

getQueue().then((queue: Channel) => {
    queue.consume("tasks", ((msg): void => {
        if (msg !== null) {
            console.log(msg.content.toString());
            const { language, code, probId, submissionId } = JSON.parse(msg.content.toString());

            const tests = prisma.testCase.findMany({
                where: {
                    problemId: probId
                }
            })

            //EXECUTE USER CODE IN A SENDBOX AND UPDATE DB
            const result = {
                status: "ACCEPTED",
                time: 10,
                memory: 100
                
            }

            prisma.submission.update({
                where: {
                    id: submissionId
                },
                data: {
                    resultStatus: result.status,
                    result: result
                }
            })

            queue.ack(msg); 
        }
    }));
});