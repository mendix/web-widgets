## Snapshot generator for EmployeeDB

A small utility to generate and seed databases with fake data.

### Usage

```sh
$ pnpm install
$ node bin/gen-employee-snapshot.js sample
```

### FAQ

**What this package for?**

This is a tool for creating data snapshots in JSON. Later, you can import this data into a Mendix application using import mapping.

**What is sample?**

Sample is just a small db snapshot with 1 user. It is just useful to copy and paste into the JSON structure in the Mendix application.

**How can I use this data in the Mendix app?**

These snapshots are already available in EmployeeDB module. The module can be found on [testProjects repo](https://github.com/mendix/testProjects/tree/employee-db-main).

**Where can I get EmployeeDB module?**

Module can be found on [testProjects repo](https://github.com/mendix/testProjects/tree/employee-db-main). Branch name `employee-db-main`.

**How can I add a new field?**

To add a new field you can modify Employee class, generate new snapshot, update EmployeeDB module and you are ready to go.

**How to update snapshot in EmployeeDB?**

1. Clone `employee-db-main` branch from testProjects repo.
2. Open the app in Studio Pro.
3. Generate a snapshot of the size you need.
4. Find `JSON_SNAPSHOT_<YOUR SIZE>` microflow and save the snapshot as a string to a variable (yes, there no other way right now).
5. Run the app and test your changes.
6. Bump version, add changelog.
7. Commit, add version tag, push.
