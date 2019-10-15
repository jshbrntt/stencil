The aim of this project was to provide a foundation for anyone who wants to work with [Node.js][nodejs].

Complete with necessary boilerplate, example code, build targets, and GitLab CI configuration.

The intent is that once you understand this project you can base your own project off of it by forking it.

By forking this project, it enables you to potentially merge back future updates to this project into your own if you wish.

## Features

Most of the features contained in this project and illustrated in this guide are just to serve guidance there is no strict requirement to adhere to the boilerplate offered by the project. Feel free to customize and remove the parts you do not need or want as you see fit.

### Development environment

This project provides a service in the `docker-compose.yml` file which enables you to execute commands necessary for development such as installing dependencies or running the project scripts with their dependencies available.

You can access this development environment and a shell within it using the following command.

```shell
$ make run dev
make run dev
docker-compose down --volumes --remove-orphans
# ...
root@c2348503d6a6:/usr/src#
```

To see what scripts can be run in the development environment check the `scripts` section of the `package.json` file.

### Example code

In the `./src` directory, there is example source code that demonstrates implementation of the following.

- A CLI script.
- A HTTP server.
- A HTTP client.
- A GRPC server.
- A GRPC client.
- A common module used by all of the above to implement shared "business logic".

### API documentation

The example code is also annotated with [JSDoc][jsdoc] which is utilized when building out the documentation for the project. This documentation is then deployed to the project's [GitLab Pages][gitlab/pages].

### Changelog

In the `CHANGELOG.md` file, there is an example changelog (that represents the changes to this project).

This changelog format is based on [keep a changelog][keepachangelog] version `1.0.0`.

Its intended to be a human readable piece of project documentation not a dump of your git logs.

One of the notably nice features is it provides links to diffs between project versions, including the latest release and the current `HEAD` of the project.

### .gitignore

In the `.gitignore` file, there are many boilerplate rules provided by <gitignore.io> as well as some additional rules for this project.

### Linting

The project uses [StandardJS][standardjs] as its style guide for any JavaScript code.

You can test the code of the project via the `yarn test:lint` script in the development environment.

You can also run the same script from the host using the `make test list` command.

### Testing

In addition to the example code the project offers there are also tests that back it.

The boilerplate testing framework provided is [Mocha][mochajs] in conjunction with the [Chai][chaijs] assertion library.

#### Unit

The project expects unit tests to be kept alongside the code it is testing.

See in the `./src/hello` module there is a `world.js` and `world.test.js` file.

The latter is code to test the former.

You can test the code of the project via the `yarn test:unit` script in the development environment.

You can also run the same script from the host using the `make test unit` command.

#### Functional

Example functional testing of the Docker image and container that the project produces as a distributable is also provided.

In order to run these functional tests you will need the following.

- The `.tar` file produced when building the Docker image distributable.
- A Docker host expected by default to be communicable through the unix socket file at `/var/run/docker.sock`.

If you run `make test func` command, on your host this will also ensure that this `.tar` is built and available.

You can also run these tests in the development environment using the  `yarn test:func` script.

### Debugging

The project provides targets and scripts to easily run the example code and tests with debugging enabled.

Once either the example code or tests are running with debugging enabled it will wait for a debugger to attach on port `9229` (which is the default).

You can use a IDE with any Node.js debugger to attach, in addition to this notably the Chrome web browser now offers a Node.js debugger built in to the DevTools as standard.

You can run the following commands from the host to start example code or tests with debugging enabled.

- `make debug start`
- `make debug func`
- `make debug unit`

In the development environment the same can be done through the following commands.

- `yarn debug:start`
- `yarn debug:func`
- `yarn debug:unit`

[nodejs]: https://nodejs.org
[jsdoc]: http://usejsdoc.org/
[gitlab/pages]: https://about.gitlab.com/features/pages/
[keepachangelog]: http://keepachangelog.com/en/1.0.0/
[standardjs]: https://standardjs.com/
[mochajs]: https://mochajs.org/
[chaijs]: http://chaijs.com/
