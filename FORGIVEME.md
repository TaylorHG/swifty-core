# Forgive Me
Forgive me for not having done the following yet:

### TODO List for 0.1.0 Beta version:
- Figure out how to allow files to declare independence from the resolver (not be included by it).
- Better Error Handling for swifty-rest package. When it can't find a route it just sticks it just logs some bullshit and errors out.
- Clean up files that should be ignored by npm and git
- Move Layer States to Layer Instances
- Protect against circular dependencies
- Remove all these `process.cwd()` calls. Instead pass it around where needed. This allows the CLI to run projects in any directories and makes everything less brittle.
- Better Configuration, possibly through `.js` file rather than `.json` file.
- Allow for configuration of logger.
- CLI to generate project
