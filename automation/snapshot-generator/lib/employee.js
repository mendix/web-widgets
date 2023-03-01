const ROLES = require("./sets/roles");
const COLOR_ENUM = require("./sets/color-enum");
const { includesSimilarObject } = require("./utils");

class Employee {
    constructor(chance, roles = ROLES, colorEnum = COLOR_ENUM) {
        this.chance = chance;
        this.data = {
            roles,
            colorEnum
        };
    }

    id() {
        return this.chance.integer({ min: 10000, max: 99999 });
    }

    country() {
        return {
            _id: this.id(),
            name: this.chance.country({ full: true })
        };
    }

    company(country) {
        return {
            _id: this.id(),
            name: this.chance.company(),
            country: country ?? this.country()
        };
    }

    role() {
        return {
            _id: this.id(),
            name: this.chance.pickone(this.data.roles)
        };
    }

    uniqueRoles() {
        return this.chance.unique(() => this.role(), this.chance.natural({ min: 1, max: 4 }), {
            comparator: includesSimilarObject
        });
    }

    employee(company, roles) {
        const birthDate = this.chance.birthday({
            string: false,
            yield: this.chance.year({ min: 1950, max: 2004 })
        });

        const person = {
            _id: this.id(),
            birth_date: birthDate.toISOString(),
            birth_day: birthDate.getDate(),
            birth_month: birthDate.getMonth() + 1,
            birth_year: birthDate.getFullYear(),
            children: this.chance.integer({ min: 0, max: 5 }),
            favorite_color: this.chance.pickone(this.data.colorEnum),
            first_name: this.chance.first({ nationality: "en" }),
            have_pets: this.chance.bool(),
            last_name: this.chance.last({ nationality: "en" })
        };

        person.company = company ?? this.company();
        person.roles = roles ?? this.uniqueRoles();

        return person;
    }
}

exports.Employee = Employee;
