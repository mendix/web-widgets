/* eslint-disable no-console */
const readXlsxFile = require("read-excel-file/node");

const readExcelFile = filename => {
    console.log("reading Excel file %s", filename);
    console.log("from cwd %s", process.cwd());

    return readXlsxFile(filename);
};

module.exports = { readExcelFile };
