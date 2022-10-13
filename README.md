**NOTE**: Please, keep in mind that this repo is still in process of migration. Some of the scripts, CI actions or other tools may not work or be unstable. We hardly working on fixing all this issues. Please, if you find some problem with `pnpm`, testing, running or building, let us know about the problem by submitting issue on GitHub.

---

# Web widgets

A bundle of R&D Platform supported widgets & nanoflow actions for building web apps.

**For issues and bugs related to CSS, Widgets, Atlas or JS Actions, please contact** [Mendix Support](https://support.mendix.com)

## Developing

### Quick start

```sh
$ pnpm install
$ cd packages/<widget-you-wish-to-start-work-on>
$ pnpm start
```

### Prerequisites

-   `node` version 16 -- we recommend use [nvm](https://github.com/nvm-sh/nvm) for installing and managin node on you local env, but you can download and [install node from official website](https://nodejs.org/en/download/)
-   `pnpm` veresion 7.3.0 or higher – please visit [Installation](https://pnpm.io/installation) docs section to get instruction on how to install pnpm in your local env.

As we are using [`node-gyp`](https://github.com/nodejs/node-gyp) in our dependencies, please make sure to [install the required dependencies](https://github.com/nodejs/node-gyp#installation) for this library according to your OS.

### Developer flow

-   Mendix projects for each widget already comes with repo with folder called
    `packages/pluggableWidgets/<widgetName>/tests/testProject`.
-   Run `pnpm run pretest:e2e` to initialize Mendix project.
-   Run `pnpm run build` on a desired widget folder. For ex: `packages/pluggableWidgets/badge-web`. This will build and copy the mpk to
    each Mendix project's correct widget folder.
-   Open and run the project in `<widgetName>/tests/testProject` with Mendix Studio.
-   If you want to override your local test project with a test project from GitHub, execute the `test:e2e` npm script with the following command: `pnpm run test:e2e -- --update-test-project`.

### Adding new test project to the repo

-   Go to `https://github.com/mendix/testProjects` and create an appropriate branch name from master
-   Add your **.mpr** files, commit and push (remember your branch name)
-   Go to `web-widgets` monorepo and in the `package.json` of the widget insert the branch name in the test project section.

## Contributing

See [CONTRIBUTING.md](https://github.com/mendix/web-widgets/blob/main/CONTRIBUTING.md).

## Raising problems/issues

-   We encourage everyone to open a Support ticket on [Mendix Support](https://support.mendix.com) in case of problems with widgets or scaffolding tools (Pluggable Widgets Generator or Pluggable Widgets Tools)
