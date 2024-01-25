<p align="center">
  <h1 align="center">Cairo VM Codes</h1>
</p>
<p align="center">
  <strong><i>An interactive reference to Cairo Virtual Machine</i></strong>
  <img width="1408" alt="screenshot" src="https://user-images.githubusercontent.com/5113/142245431-08ad9922-9115-43fd-9572-8b33cde75bb0.png">
</p>

This is the frontend source code that runs [cairovm.codes](http://cairovm.codes) web application. Repository with the backend code can be found [here](https://github.com/walnuthq/cairovm.codes-server). Below you will find the docs on how to contribute to the project and get it up and running locally for further development.

cairovm.codes is brought to you by [Walnut](https://www.walnut.dev).

## ⚙️ Installation

The app requires the following dependencies:

- [NodeJS](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/)

## 👩‍💻 Local Development

For contributing to the project, you can quickly get the application running by following these steps:

Clone this repository:

    git clone git@github.com:walnuthq/cairovm.codes.git

Install the dependencies:

    npm install

Start up the app and see it running at http://localhost:3000

    npm run dev

## 🚀 Deploying

Deployments are handled automatically by [Cloudflare](https://www.cloudflare.com/), as soon as your PR is merged to `main`.

## 🤗 Contributing

cairovm.codes is built and maintained by a small team, so we would definitely love your help to fix bugs, add new features and improvements. Head on to the [issues tab](https://github.com/walnuthq/cairovm.codes/issues) to find a list of open contributions.

Before you submit a pull request, please make sure there isn't an existing [GitHub issue](https://github.com/walnuthq/cairovm.codes/issues). If there isn't, create one first to discuss the best way to approach it and also get some feedback from the team.

Once you are about to submit a pull request, prefix the name with either `chore:` (small improvements and regular maintenance), `fix:` (bugs and hot fixes), or `feat:` (new features) to help us quickly look up the type of the issue from the Git history.

### Coding conventions

The project is already pre-configured with [Eslint](.eslintrc.js), [TypeScript](tsconfig.json), and [Prettier](.prettierrc). Here are some useful commands you can run to ensure your changes follow the project's coding conventions:

Check for any linting issues and fix:

    npm run lint --fix

Check for any TypeScript issues:

    npm run typecheck

Sort the `package.json`:

    npm run lint:package

## Architecture

If you would like to contribute, make sure to check the [architecture document](docs/ARCHITECTURE.md) to learn about the code structure, and how the app is built.

## License

[MIT](LICENSE)
