// template.ts
import { Template, waitForTimeout } from 'e2b';

export const template = Template()
  .fromBaseImage()
  .setEnvs({
    HELLO: "Hello, World!",
  })
  .setStartCmd("echo $HELLO", waitForTimeout(5_000));