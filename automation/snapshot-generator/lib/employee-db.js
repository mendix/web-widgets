const Chance = require("chance");
const { EmployeeGenerator } = require("./employee");
const { includesSimilarObject, toRef, escapeSingleQuotes, removeUTF8 } = require("./utils");

const DEFAULT_QUANTITY = {
    country: 1,
    company: 1,
    role: 1,
    employee: 1
};

const SCHEMA_VERSION = 2;

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
        const emp = new EmployeeGenerator(chance);

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
            schema_version: SCHEMA_VERSION,
            countries,
            companies,
            roles,
            employees
        };
    }

    static toJSON(data) {
        data = JSON.stringify(data, null, 2);
        data = removeUTF8(data);
        data = escapeSingleQuotes(data);
        return data;
    }
}

exports.EmployeeDB = EmployeeDB;
