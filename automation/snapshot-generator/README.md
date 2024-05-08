## Snapshot generator for EmployeeDB

A small utility tool for generating and seeding databases with fake data.

### Usage

```sh
$ pnpm install
$ node bin/gen-employee-snapshot.js sample
```

### FAQ

**What this package for?**

This is a tool for creating data snapshots in JSON. Later, you can import this data into a Mendix application using import mapping.

**What is sample?**

Sample is just a small db snapshot with 1 user. Its just usefully to be copied and pasted to JSON structure in the Mendix application.

**How can I use this data in mendix app?**

This snapshots already available in EmployeeDB module. Module can be found at [testProjects repo](https://github.com/mendix/testProjects/tree/employee-db-main).

**Where I can get EmployeeDB module?**

Module can be found at [testProjects repo](https://github.com/mendix/testProjects/tree/employee-db-main). Branch `employee-db-main`.

**How I can add new field?**

To add a new field you can modify Employee class, generate new snapshot, update EmployeeDB module and you are ready to go.

**How to update snapshot in EmployeeDB?**

1. Clone `employee-db-main` branch from testProjects repo.
2. Open app in Studio Pro.
3. Generate snapshot of the size you need.
4. Find `JSON_SNAPSHOT_<YOUR SIZE>` microflow and save snapshot as a string to a variable (yes, there no other way right now).
5. Run the app and test your changes.
6. Bump version, add changelog.
7. Commit, add version tag, push.
