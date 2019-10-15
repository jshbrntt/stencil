# stencil

A Node.js microservice template.

## Quick Start

1. Clone the project.
2. Run `make run dev` to start the development environment and attach to a shell process within it.
3. Execute commands necessary for development (e.g. `yarn start`, `yarn debug:start`, and `yarn add [packages ...]`).
4. Read the [Introduction][introduction] tutorial.

## Documentation

### [Changelog][changelog]

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

### [JSDocs][docs]

You can access the latest version of the JSDoc documentation through this link.

This documentation is built and published on every [tagged][tags] release.

### Services

- `dev`, this service represents the development environment.
- `prod`, this service represents distributable containerized version of the project.

### Makefile

#### Targets

```shell
## Development Targets
make build [--] [options] [SERVICE...]    # Build or rebuild services.
make up [--] [options] [SERVICE...]       # Builds, (re)creates, starts, and attaches to development service.
make rm [--] [options] [SERVICE...]       # Force stop and remove service containers, and any anonymous volumes attached to containers.
make run [dev|prod]                       # Run a project service.
make down [--] [options]                  # Stop and remove all service containers, volumes, and networks.
make clean                                # Clean the project of stateful files.
make test [lint|unit|func]                # Run the project tests (lint, unit, func).
make debug [start|func|unit]              # Run the project scripts with debugging enabled.

## Continuous Integration Targets
make build-npm                            # Build the Node.js module and pack it as a tarball.
make publish-npm                          # Publish the Node.js module from the packaged tarball.
make build-docker                         # Build the production Docker image and save it as a tarball.
make publish-docker                       # Publish the production Docker image from the saved tarball.
make build-docs                           # Build the project documentation.
make publish-docs                         # Publish the project documentation.
```

[introduction]: https://synthecypher.gitlab.io/stencil/tutorial-Introduction.html
[docs]: https://synthecypher.gitlab.io/stencil/
[changelog]: ./CHANGELOG.md
[tags]: ./tags
