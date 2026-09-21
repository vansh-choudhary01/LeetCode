// build.dev.ts
import 'dotenv/config';
import { Template, defaultBuildLogger } from 'e2b';
import { template } from './template.js';

async function main() {
  await Template.build(template, 'template-tag-dev', {
    cpuCount: 1,
    memoryMB: 256,
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);