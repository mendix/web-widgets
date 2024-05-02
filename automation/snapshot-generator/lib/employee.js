const ROLES = require("./sets/roles");
const COLOR_ENUM = require("./sets/color-enum");
const { includesSimilarObject } = require("./utils");

/**
 * @typedef {object} Country
 * @property {number} _id - country ID.
 * @property {string} name - country name.
 */

/**
 * @typedef {object} Company
 * @property {number} _id - company ID.
 * @property {string} name - company name.
 * @property {Country} country - home country.
 */

/**
 * @typedef {object} Role
 * @property {number} _id - role ID.
 * @property {string} name - role name.
 */

/**
 * @typedef {object} Employee
 * @property {number} _id - employee ID.
 * @property {string} birth_date - employee birthday as ISO string.
 * @property {number} birth_day - day between 1 and 31.
 * @property {number} birth_month - month between 1 and 12.
 * @property {number} birth_year - birth year.
 * @property {number} children - number of employee children.
 * @property {number} favorite_color - string with color (eg. "Aqua")
 * @property {string} first_name - employee name.
 * @property {string} last_name - employee last name.
 * @property {boolean} have_pets - does employee has pets?
 * @property {string} profile_picture - employee profile picture URL.
 * @property {Role[]} roles
 * @property {Company} company
 * @property {"Male"|"Female"} gender
 * @property {string} phone_number
 * @property {string} email
 */

class EmployeeGenerator {
    constructor(chance, options = {}) {
        this.options = {
            ...options,
            roles: ROLES,
            colorEnum: COLOR_ENUM,
            profilePictureSize: 500
        };
        this.chance = chance;
    }

    /** @returns {number} */
    id() {
        return this.chance.integer({ min: 10000, max: 99999 });
    }

    /** @returns {Country} */
    country() {
        return {
            _id: this.id(),
            name: this.chance.country({ full: true })
        };
    }

    /**
     * Create random company. Sets country if provided.
     * @param {Country=} country
     * @returns {Company}
     */
    company(country) {
        return {
            _id: this.id(),
            name: this.chance.company(),
            country: country ?? this.country()
        };
    }

    /** @returns {Role} */
    role() {
        return {
            _id: this.id(),
            name: this.chance.pickone(this.options.roles)
        };
    }

    /** @returns {Role[]} */
    uniqueRoles() {
        return this.chance.unique(() => this.role(), this.chance.natural({ min: 1, max: 4 }), {
            comparator: includesSimilarObject
        });
    }

    /** @returns {string} */
    profilePicture() {
        const seed = this.chance.hash();
        const size = this.options.profilePictureSize;

        return encodeURI(`https://picsum.photos/seed/${seed}/${size}`);
    }

    /** @requires {string} */
    phoneNumber() {
        const nat = this.chance.natural.bind(this.chance);
        let phone_number = [
            nat({ min: 30, max: 39 }),
            nat({ min: 0, max: 9 }),
            nat({ min: 10, max: 99 }),
            nat({ min: 10, max: 99 }),
            nat({ min: 10, max: 99 }),
            nat({ min: 10, max: 99 })
        ];
        phone_number = "+" + phone_number.join(" ");
        return phone_number;
    }

    /**
     *
     * @param {Company=} company
     * @param {Role[]=} roles
     * @returns {Employee}
     */
    employee(company, roles) {
        /** @type {Date} */
        const birthDate = this.chance.birthday({
            string: false,
            yield: this.chance.year({ min: 1950, max: 2006 })
        });
        birthDate.setUTCHours(0, 0, 0, 0);

        const gender = this.chance.gender();

        const first_name = this.chance.first({ nationality: "en", gender });
        const last_name = this.chance.last({ nationality: "en", gender });

        const email = this.chance.email();

        /** @type {Employee} */
        const person = {
            _id: this.id(),
            birth_date: birthDate.toISOString(),
            birth_day: birthDate.getDate(),
            birth_month: birthDate.getMonth() + 1,
            birth_year: birthDate.getFullYear(),
            children: this.chance.integer({ min: 0, max: 5 }),
            favorite_color: this.chance.pickone(this.options.colorEnum),
            first_name,
            have_pets: this.chance.bool(),
            last_name,
            profile_picture: this.profilePicture(),
            phone_number: this.phoneNumber(),
            gender,
            email,
            company: company ?? this.company(),
            roles: roles ?? this.uniqueRoles()
        };

        return person;
    }
}

exports.EmployeeGenerator = EmployeeGenerator;
