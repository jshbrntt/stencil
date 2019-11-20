# Commands to look for arguments after.
DOCKER := docker
DOCKER_COMPOSE := docker-compose
LATEST_TAG := latest
SERVICE := dev
SERVICES := dev prod

# Polyfilling CI variables for local usage.
ifndef CI_PROJECT_NAME
	CI_PROJECT_NAME := $(shell basename `pwd`)
endif

ifndef CI_REGISTRY_IMAGE
	CI_REGISTRY_IMAGE := $(CI_PROJECT_NAME)
endif

ifndef CI_COMMIT_SHA
	CI_COMMIT_SHA := $(shell git rev-parse HEAD)
endif

# Using COMMANDS populate ARGS with the arguments that came after 'make <target>'.
ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
$(eval $(ARGS):;@:)

# Ascertain targeted service from command, otherwise use default already set.
ifneq ($(filter $(firstword $(ARGS)),$(SERVICES)),)  
	SERVICE := $(firstword $(ARGS))
	ARGS := $(wordlist 2,$(words $(ARGS)),$(ARGS))
endif

## Development Targets
# These targets will commonly be used in dev.

# Create .env file from .env.template using variables set in environment.
.env: .env.template _clean_env
	eval "echo \"$$(cat .env.template)\"" > .env

# Docker command wrappers, with sensible defaults.
.PHONY: build
build: .env down clean pull
	$(DOCKER_COMPOSE) build $(SERVICE)

.PHONY: up
up: build
	$(DOCKER_COMPOSE) up --force-recreate $(SERVICE)

.PHONY: rm
rm: build
	$(DOCKER_COMPOSE) rm --force --stop -v $(SERVICE)

.PHONY: run
run: build
	$(DOCKER_COMPOSE) run --rm --service-ports $(SERVICE) $(ARGS)

.PHONY: down
down: .env
ifeq ($(firstword $(MAKECMDGOALS)),clean)
	$(DOCKER_COMPOSE) down --volumes --remove-orphans --rmi all
else
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
endif

.PHONY: login
login:
ifdef GITHUB_WORKFLOW
	$(DOCKER) login docker.pkg.github.com --username synthecypher
endif

# Clean targets.
.PHONY: _clean_docs
_clean_docs:
	rm -rf docs

.PHONY: _clean_node_modules
_clean_node_modules:
	rm -rf node_modules

.PHONY: _clean_npm
_clean_npm:
	rm -rf *.tgz

.PHONY: _clean_docker
_clean_docker:
	rm -rf *.tar

.PHONY: _clean_npmrc
_clean_npmrc:
	rm -rf .npmrc

.PHONY: _clean_env
_clean_env:
	rm -rf .env

.PHONY: _clean_logs
_clean_logs:
	rm -rf *.log

.PHONY: _clean_coverage
_clean_coverage: down
	rm -rf coverage .nyc_output

.PHONY: clean
clean: _clean_docs _clean_node_modules _clean_npm _clean_docker _clean_npmrc _clean_env _clean_logs _clean_coverage

# These targets are for GitLab CI to save and load the image used to run dev tasks between jobs.
.PHONY: push
push: build login
	$(DOCKER) tag $(CI_PROJECT_NAME)_$(SERVICE):$(LATEST_TAG) $(CI_REGISTRY_IMAGE)/$(SERVICE):$(CI_COMMIT_SHA)
	$(DOCKER) tag $(CI_PROJECT_NAME)_$(SERVICE):$(LATEST_TAG) $(CI_REGISTRY_IMAGE)/$(SERVICE):$(LATEST_TAG)
	$(DOCKER) push $(CI_REGISTRY_IMAGE)/$(SERVICE):$(CI_COMMIT_SHA)
	$(DOCKER) push $(CI_REGISTRY_IMAGE)/$(SERVICE):$(LATEST_TAG)

.PHONY: pull
pull: login
	-$(DOCKER) pull $(CI_REGISTRY_IMAGE)/$(SERVICE):$(LATEST_TAG)
	-$(DOCKER) tag $(CI_REGISTRY_IMAGE)/$(SERVICE):$(LATEST_TAG) $(CI_PROJECT_NAME)_$(SERVICE):$(LATEST_TAG)

# If we are running a functional test, the docker image becomes a dependency and therefore is built before running the test..
TEST_TARGETS := build
ifeq ($(ARGS),func)
ifndef GITHUB_WORKFLOW
	TEST_TARGETS += build-docker
endif
endif

# Run tests in a container.
.PHONY: test
test: $(TEST_TARGETS)
	$(DOCKER_COMPOSE) run --rm dev yarn test:$(ARGS)

# Run project with debugging enabled in an ephemeral dev container.
.PHONY: debug
debug: build
	$(DOCKER_COMPOSE) run --service-ports --rm dev yarn debug:$(ARGS)

## Continuous Integration Targets
# They can be run locally if needed to test they function as expected.
# Only the publish targets are not dependant on the build targets, because these are ran in seperate stages/jobs in the GitLab CI pipeline.

# Build the static project documentation site.
.PHONY: build-docs
build-docs: build
	$(DOCKER_COMPOSE) run --rm dev yarn build:docs

# Build the static project documentation site.
.PHONY: publish-docs
publish-docs: build
	$(DOCKER_COMPOSE) run --rm dev yarn publish:docs

# Build distributables in a container, then copy them out to the host.
.PHONY: build-npm
build-npm: _clean_npm build
	$(DOCKER_COMPOSE) run --rm dev yarn build:npm

# Publish built distributables, by copying into a container and running the publish script.
.PHONY: publish-npm
publish-npm: build
	$(DOCKER_COMPOSE) run --rm dev yarn publish:npm

# Build prod container.
.PHONY: build-docker
build-docker: .env _clean_docker
	-$(DOCKER) pull $(CI_REGISTRY_IMAGE):$(LATEST_TAG)
	-$(DOCKER) tag $(CI_REGISTRY_IMAGE):$(LATEST_TAG) $(CI_PROJECT_NAME):$(LATEST_TAG)
	$(DOCKER_COMPOSE) build prod
	$(DOCKER) tag $(CI_PROJECT_NAME)_prod:$(LATEST_TAG) $(CI_REGISTRY_IMAGE):$(LATEST_TAG)
	$(DOCKER) save $(CI_REGISTRY_IMAGE):$(LATEST_TAG) > $(CI_COMMIT_SHA).tar

# Publish prod container image to Docker registry.
.PHONY: publish-docker
publish-docker: login
	$(DOCKER) load -q -i $(CI_COMMIT_SHA).tar
	$(DOCKER) tag $(CI_REGISTRY_IMAGE):$(LATEST_TAG) $(CI_REGISTRY_IMAGE):$(CI_COMMIT_SHA)
	$(DOCKER) push $(CI_REGISTRY_IMAGE):$(LATEST_TAG)
	$(DOCKER) push $(CI_REGISTRY_IMAGE):$(CI_COMMIT_SHA)
