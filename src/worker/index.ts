import { Channel } from "amqplib";
import getQueue from "../RabitMQ/db.js";
import prisma from "../lib/prisma.js";
import { runCode } from "../e2b/createSandbox.js";
import { TestCase } from "../generated/prisma/client.js";

function generateExecutableCode(functionName: string, language: string, code: string, testCases: TestCase) {
    switch (language) {
        case "ts":
            return `
            
            let i = 0;

            try {
                ${code}
                for(i; i < ${testCases.length}; i++) {
                    const test = testCases[i];

                    const solution = new Solution();
                    const result = solution.${functionName}(test.input);

                    if (result !== test.expected) {
                        break;
                    }
                }

                if (i !== testCases.length) {
                    console.log('{
                        status: 'Failed',
                        pass: i/testCases.length,
                        error: 'test case failed'
                    }')
                } else {
                    console.log('{
                        status: 'Accepted',
                        pass: testCases.length/testCases.length
                    }')
                }
            } catch (err) {
                console.log('{
                    status: 'Failed',
                    pass: i/testCases.length,
                    error: err
                }')
            }
            `
    }

}

getQueue().then((queue: Channel) => {
    queue.consume("tasks", (async (msg) => {
        if (msg !== null) {
            console.log(msg.content.toString());
            const { language, code, functionName, probId, submissionId } = JSON.parse(msg.content.toString());

            const tests = prisma.testCase.findMany({
                where: {
                    problemId: probId
                }
            })

            const executableCode = generateExecutableCode(functionName, language, code, tests)!;


            const result = await runCode(language, executableCode);
            //EXECUTE USER CODE IN A SENDBOX AND UPDATE DB

            if (result.exitCode !== 0) {
                prisma.submission.update({
                    where: {
                        id: submissionId
                    },
                    data: {
                        resultStatus: "Failed",
                        result: {
                            status: 'Failed',
                            pass: '0/0',
                            error: result.stderr
                        }
                    }
                })
            } else {
                const final = JSON.parse(result.stdout);


                prisma.submission.update({
                    where: {
                        id: submissionId
                    },
                    data: {
                        resultStatus: final.status,
                        result: final
                    }
                })
            }

            queue.ack(msg);
        }
    }));
});