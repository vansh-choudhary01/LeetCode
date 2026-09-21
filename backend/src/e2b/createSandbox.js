import { Sandbox } from 'e2b';
export async function runCode(code) {
    const sandbox = await Sandbox.create({ template: "template-tag-dev" });
    const result = await sandbox.commands.run(code);
    sandbox.kill();
    return result;
}
