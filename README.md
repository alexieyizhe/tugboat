<p align="center">
    <a href="https://intern.plus/" target="_blank" rel="noopener noreferrer" >
        <img alt="Site logo" src="./src/assets/img/logo-text.svg" width="200" />
    </a>
</p>
<p align="center">
    <img src="https://github.com/alexieyizhe/intern.plus/workflows/ci/badge.svg">
    <img src="https://img.shields.io/github/v/tag/alexieyizhe/intern.plus?label=version">
    <p align="center">
        ✨ intern+ aggregates information about the quality of a company's internship program, sourced directly through reviews from your peers – all designed to help you make an informed decision when it comes to choosing your next internship.</p>
</p>

## 🎨 Design

Interested in how it was built? Check out a [timelapse of the design process](https://youtu.be/0Ioruq2xIXw) on YouTube or see [the preliminary mocks](https://www.figma.com/file/FyfrbCpoSGAeY3eTROqPx5/intern?node-id=0%3A1) on Figma!

## 🥞 Tech Stack

Created with [React](https://reactjs.org/) and bootstrapped with [`create-react-app`](https://create-react-app.dev/).  
Developed in [TypeScript](https://www.typescriptlang.org/).  
API powered by [GraphQL](https://graphql.org/), [Apollo](https://www.apollographql.com/), and [Vercel serverless](https://vercel.com).  
Styled with [styled-components](https://www.styled-components.com).  
Tested through [Cypress](https://www.cypress.io/) and [Percy](https://percy.io/).  
Code style enforced with [eslint](https://eslint.org/) and [Prettier](https://prettier.io/).  
Continuous integration through [Github Actions](https://github.com/features/actions).  
Hosted and deployed on [Vercel](https://vercel.com) and [Firebase](https://firebase.google.com/).

## 🚀 Development

To get started:

```sh
git clone https://github.com/alexieyizhe/intern.plus.git
cd intern.plus
npm i
npm start
```

### Project structure

The project is split into the following parts:

- `/api` contains the code for the GraphQL server & API.
- `/src` contains the code for the React frontend:
  - `/api` contains client code for interacting with the graphql api.
  - `/assets` contains images, fonts, and other static assets.
  - `/components` contains all components that are shared between different parts of the project.
  - `/context` contains the global state management system.
  - `/pages` is relatively self-explanatory: it holds the pages of the app.
  - `/shared` contains all shared code like constants, etc that are used in _multiple_ parts of the project.
  - `/theme` contains all code dealing with styles and theming of the app.
- `/cypress` holds logic for the Cypress end-to-end testing suite tool, as well as E2E tests.

For more information, consult the README in the root of each directory.

#### GraphQL

All code dealing with GraphQL resides in `/graphql` directories. These directories are co-located next to the parts of the applications using them.

Each of these will contain logic like queries, fragments, etc. The types associated with the logic (auto-generated by Apollo tooling) reside in a `/graphql/types` subdirectory.

### Development conventions

This project (loosely) follows a [trunk based development](https://trunkbaseddevelopment.com/) style.

- Branches are split off from the `master` branch for features, fixes, and all other development.
- The `release` branch contains production code that is able to be hosted live.

#### Branch naming

Branches are prefixed with the following codes to denote their purpose:

- `feat[-XX]/`: A larger feature or enhancement for the site.
- `fix[-XX]/`: A fix or patch for bugs or errors.
- `chore[-XX]/`: Development on aspects with no production changes (documentation, refactoring, style).

Branch names contain the issue number on which the development efforts are focused, if any.

#### Commits into `master` branch

When branches are merged back into `master`, they must be squashed committed.

The commit name must be prefixed with one of the following, according to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines:

- `feat:` new feature
- `bug:` bug fixes
- `chore:` refactoringchore-related changes
- `docs:` documentation

#### Releasing a new version

When code is ready to be reflected on production, cut a Github release with an appropriate version tag. This will trigger a Github Actions workflow that bumps the version according to the tag and pushes this to both `master` and `release`.

Any new changes on the `release` branch is automatically built by Vercel and made live.

###### Wanna get in touch? [Shoot Alex an email](mailto:hi@alexxie.ca).
