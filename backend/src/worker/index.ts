import { Channel } from "amqplib";
import getQueue from "../RabitMQ/db.js";
import prisma from "../lib/prisma.js";
import { runCode } from "../e2b/createSandbox.js";
import { TestCase } from "../generated/prisma/client.js";
import dotenv from "dotenv";
dotenv.config();

function generateExecutableCode(functionName: string, language: string, code: string, testCases: TestCase[]) {
    switch (language) {
        case "js":
            return `let i = 0;

            try {
                ${code}

                const testCases = JSON.parse('${JSON.stringify(testCases)}');
                for(i; i < testCases.length; i++) {
                    const test = testCases[i];

                    const solution = new Solution();
                    const result = solution.${functionName}(test.input);

                    if (result !== test.expected) {
                        break;
                    }
                }

                if (i !== testCases.length) {
                    console.log(JSON.stringify({
                        status: 'Failed',
                        pass: i/testCases.length,
                        error: 'test case failed'
                    }))
                } else {
                    console.log(JSON.stringify({
                        status: 'Accepted',
                        pass: testCases.length/testCases.length
                    }))
                }
            } catch (err) {
                console.log(JSON.stringify({
                    status: 'Failed',
                    pass: i/testCases.length,
                    error: err
                }))
            }
            `
    }
}

getQueue.getQueue().then((queue: Channel) => {
    queue.consume("tasks", (async (msg) => {
        if (msg !== null) {
            console.log(msg.content.toString());
            const { language, code, functionName, probId, submissionId } = JSON.parse(msg.content.toString());

            const tests = await prisma.testCase.findMany({
                where: {
                    problemId: parseInt(probId)
                }
            })

            const executableCode = generateExecutableCode(functionName, language, code, tests)!;

            const result = await runCode(executableCode);
            //EXECUTE USER CODE IN A SENDBOX AND UPDATE DB

            if (result.exitCode !== 0 || result.stderr !== '') {
                await prisma.submission.update({
                    where: {
                        id: submissionId
                    },
                    data: {
                        resultStatus: false,
                        result: {
                            status: 'Failed',
                            pass: '0/0',
                            error: result.stderr
                        }
                    }
                })
            } else {
                const final = result.stdout !== '' ? JSON.parse(result.stdout) : {
                    status: 'Failed',
                    pass: '0/0',
                    error: 'no output'
                }


                await prisma.submission.update({
                    where: {
                        id: submissionId
                    },
                    data: {
                        resultStatus: final.status === "Accepted",
                        result: final
                    }
                })
            }

            queue.ack(msg);
        }
    }));
});