# NestJS Backend Common

All the utility functions and common modules I usually use in my NestJS applications will be published and maintained here.

📚 **[View Full API Documentation](https://kasir-barati.github.io/nestjs-backend-common/)**.

📦 **[View the package on NPM](https://www.npmjs.com/package/nestjs-backend-common)**.

## Why `nestjs-cls` Is Peer Dependency?

This is because we wanna share the same storage between our App and this library. Thus we have to define it as peer dependency;

> **Peer Dependencies**: These are dependencies that your project hooks into or modifies in the parent project, usually a plugin for some other library or tool. Peer dependencies are not automatically installed by npm. Instead, they are only checked for, ensuring that the parent project (the project that will depend on your project) has a dependency on the project you hook into. For example, if you create a plugin for a library like Chai, you would specify Chai as a peer dependency. This ensures that the user of your plugin has the correct version of Chai installed.

## FAQ

- NPM ain't installing this library:
  ```cmd
  npm error Cannot read properties of null (reading 'matches')
  npm error A complete log of this run can be found in: /home/mjb/.npm/_logs/2026-02-21T20_28_22_477Z-debug-0.log
  ```
  tl;dr would be either remove it from `package.json` and try to install it. Or use pnpm ([learn more](https://github.com/npm/cli/issues/4367#issuecomment-3939448693)).
