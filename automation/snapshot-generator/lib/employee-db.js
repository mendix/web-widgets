const Chance = require("chance");
const { Employee } = require("./employee");
const { includesSimilarObject, toRef, escapeSingleQuotes } = require("./utils");

const DEFAULT_QUANTITY = {
    country: 1,
    company: 1,
    role: 1,
    employee: 1
};

class EmployeeDB {
    /**
     * @param {object} quantity - number of entities
     * @param {number} quantity.country
     * @param {number} quantity.company
     * @param {number} quantity.role
     * @param {number} quantity.employee
     */
    static create(quantity = DEFAULT_QUANTITY) {
        const chance = new Chance();
        const emp = new Employee(chance);

        const unique = (gen, n) => {
            return chance.unique(gen, n, {
                comparator: includesSimilarObject
            });
        };

        const countries = unique(() => emp.country(), quantity.country);

        const companies = unique(() => emp.company(toRef(chance.pickone(countries))), quantity.company);

        const roles = unique(() => emp.role(), quantity.role);

        const employees = chance.unique(
            () => {
                const companyRef = toRef(chance.pickone(companies));
                const roleRefs = chance.pickset(roles.map(toRef), chance.natural({ min: 1, max: 4 }));

                return emp.employee(companyRef, roleRefs);
            },
            quantity.employee,
            {
                comparator: (arr, value) => arr.some(o => o._id === value._id)
            }
        );

        return {
            snapshot_id: chance.guid(),
            snapshot_version: 1,
            countries,
            companies,
            roles,
            employees
        };
    }

    static toJSON(data) {
        return escapeSingleQuotes(JSON.stringify(data, null, 2));
    }
}

exports.EmployeeDB = EmployeeDB;
