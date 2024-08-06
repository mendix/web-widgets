# Web Widgets E2E testing

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#structure">Structure</a></li>
    <li><a href="#executing-e2e-tests-locally">Executing E2E tests locally</a>
      <ul>
        <li><a href="#focusing-a-test">Focusing a test</a></li>
      </ul>
    </li>
    <li><a href="#updating-the-test-project">Updating the test project</a></li>
    <li><a href="#updating-the-visual-screenshots-baseline">Updating the visual screenshots baseline</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

## Prerequisites

Please note that it is necessary to have `pnpm`, `node`, and `docker` installed as part of the environment setup.

-   ![Current node engine](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmendix%2Fweb-widgets%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&color=%23339933&logo=node.js) version of [Node.js](https://nodejs.org/en/download)

-   ![Current pnpm version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmendix%2Fweb-widgets%2Fmain%2Fpackage.json&query=%24.engines.pnpm&label=pnpm&color=%23f69220&logo=pnpm) version of [pnpm](https://pnpm.io/installation)

-   ![Current docker version](https://img.shields.io/badge/docker_engine-%5E25-blue?logo=docker) version of [docker](https://docs.docker.com/engine/install/)

## Structure

This automation testing structure consists of two scripts for running e2e tests using [Playwright](https://playwright.dev/). The first script, `pnpm run e2e`, is utilized in our CI process on GitHub Actions. This script calls a Docker file which sets up the environment to execute the testProject using Mendix Runtime and MxBuild. The test execution happens automatically, and you can view the results in the terminal. More details you can check in the Github Workflow file `BuildJobs.yml` in the job section `e2e`.

The second script, `pnpm run e2edev`, is used for running or debugging an e2e test execution locally. It downloads the test project and updates all dependencies. This allows you to run the test project in the Studio Pro and monitor the script execution. At the end, it launches the Playwright GUI, providing a visual interface to easily modify the test specification.

All these files are part of an internal package called `run-e2e`, where all the configurations and scripts are located. The test specification files are placed in the widget folder in a folder called `e2e` following the tree file below:

```sh
├── <widgetPackageName>
│    └── e2e
│        └── <widgetName>.spec.js
├── tests
│   └── testProject
├── package.json
└── playwright.config.cjs
```

## Executing E2E tests locally

Please make sure to follow these steps:

1. Clone the repository:

    ```sh
    $ git clone https://github.com/mendix/web-widgets.git
    ```

2. Install the dependencies:

    ```sh
    $ cd web-widgets
    $ pnpm install
    ```

3. Go to the {widgetName} (package) folder you want to test on, set `GITHUB_TOKEN` environment variable. You can create a Github token through your [Github profile settings](https://github.com/settings/tokens).

    ```sh
    $ cd packages/pluggableWidgets/<widgetPackageName>/

    # Mac and Linux:
    $ export GITHUB_TOKEN="<GithubTokenCreatedValue>"
    ```

4. Run `pnpm run e2edev` and follow the instructions in the terminal.
5. Locate the desired widget path in the test project.
6. Run the test project in Mendix Studio Pro.
7. Once the project is running, proceed with the next step of the script in the terminal to verify if the desired test project port is listening. If it is, the Playwright GUI will be initiated.
8. In the Playwright GUI interface, select the test spec and execute it. From there, you can debug or fix the test case in your preferred IDE.

### Focusing a test

To focus a test to only execute it instead of the whole suite, for that is possible to use `test.only` annotation in the test specification. You can see more details [here](https://playwright.dev/docs/test-annotations#focus-a-test).

## Updating the test project

As these packages are separated by widget we have 1-1 test project and widgets.

In this [GitHub repository](https://github.com/mendix/testProjects). These projects are separated by branches. Each branch should have the same name as the widget package name. In the package.json file of the widget, you should declare the branch name using the template of the test project section below:

```json
"testProject": {
    "githubUrl": "https://github.com/mendix/testProjects",
    "branchName": “<branch Name>”
  }
```

To update the test project you can follow the steps below:

1. Clone this repository;
2. Open the existent mpr file in the Studio Pro;
3. Do your changes and Save All;
4. Commit the changes in the mpr file;
5. Execute the `e2e` or `e2edev` script to use the updated project.

## Updating the visual screenshots baseline

In Github Action, we run the runtime and mxbuild in Docker containers. This means that the visual screenshot test is based on a Linux machine, resulting in differing pixel resolutions when running the `e2e` script on a Windows or Mac machine.

Currently, we don't have a script that updates these screenshots independently of your machine, so we have 2 options to address this:

1. Commit your changes to GitHub and wait for the screenshot to fail. This will generate an workflow artifact with the failed screenshot, which you can download following the steps explained [here](https://docs.github.com/en/actions/managing-workflow-runs/downloading-workflow-artifacts). Then, place these image files in the e2e snapshots folders, following the same file name pattern `<snapshotName>-chromium-linux.png`. Commit these files to have a green build.

2. Alternatively, you can use a Linux Virtual Machine locally, using Parallels or Virtual Box. For this, you can use Ubuntu 22.04 and follow the steps described in the "Running E2E locally" guide. The only difference is using the script `e2e` instead of `e2edev`.

## Contributing

See [CONTRIBUTING.md](https://github.com/mendix/web-widgets/blob/main/CONTRIBUTING.md).
