import { Sandbox } from 'e2b'

export async function runCode(code: string) {
    let sandbox;
    let result;
    try {
        sandbox = await Sandbox.create()
        await sandbox.files.write('/tmp/solution.js', code);
        result = await sandbox.commands.run('node /tmp/solution.js');
    } catch (err) {
        console.error(err)
        result = {
            stdout: "",
            stderr: "Error running code",
            exitCode: 1
        }
    } finally {
        if (sandbox) {
            await sandbox.kill();
        }
    }
    console.log(result);

    return result;
}