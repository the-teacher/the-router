# Development Container for The Router

This folder contains configuration for using VS Code's Development Containers feature with this project.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Getting Started

1. Open this project in VS Code
2. When prompted to "Reopen in Container", click "Reopen in Container"
   - Alternatively, press F1, type "Remote-Containers: Reopen in Container" and press Enter

VS Code will build the container and set up the development environment automatically.

## Features

- Node.js 22 environment
- ESLint and Prettier configured
- TypeScript support
- Jest testing framework
- All project dependencies pre-installed

## Using the Dev Container

Once inside the container, you can:

- Run `yarn dev` to start the development server
- Run `yarn test` to run tests
- Run `yarn build` to build the project

All commands from the Makefile are also available. 