# NestJS Backend Common

All the utility functions and common modules I usually use in my NestJS applications will be published and maintained here.

| Module                | description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `CorrelationIdModule` | Adds a correlation ID to each request (`RPC`, `GraphQL`, `HTTP`) |

---

| Decorator | Description                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------- |
| `AnyOf`   | Client has to at least send of the two fields, they can of course provide both.                 |
| `GetIp`   | Returns the IP.                                                                                 |
| `OneOf`   | Throws an error if more than one of the properties are present in the request body/querystring. |

## Why `nestjs-cls` Is Peer Dependency?

This is because we wanna share the same storage between our App and this library. Thus we have to define it as peer dependency;

> **Peer Dependencies**: These are dependencies that your project hooks into or modifies in the parent project, usually a plugin for some other library or tool. Peer dependencies are not automatically installed by npm. Instead, they are only checked for, ensuring that the parent project (the project that will depend on your project) has a dependency on the project you hook into. For example, if you create a plugin for a library like Chai, you would specify Chai as a peer dependency. This ensures that the user of your plugin has the correct version of Chai installed.
