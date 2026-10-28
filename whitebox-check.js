
const { validateReport } = require("./Backend/validators/reportValidator");

function makeValidReport(overrides = {}) {
    return {
        report_type: "LOST",
        item_name: "Wallet",
        category: "Electronics",
        item_date: "2026-10-20",
        location: "Library",
        description: "Blue wallet",
        contact_name: "Test User",
        contact_email: "user@example.com",
        contact_phone: "",
        ...overrides
    };
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const futureDate = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0")
].join("-");

const tests = [
    {
        id: "WB-01",
        name: "Invalid email with consecutive dots",
        description: "Checks whether an email containing consecutive dots in its domain is rejected.",
        input: makeValidReport({ contact_email: "aryan@domain..com" }),
        expectedError: "contact_email",
        expected: "Email validation error should be returned."
    },
    {
        id: "WB-02",
        name: "Valid category",
        description: "Checks whether the supported Electronics category passes validation.",
        input: makeValidReport({ category: "Electronics" }),
        expectedError: null,
        expected: "No validation errors should be returned."
    },
    {
        id: "WB-03",
        name: "Valid report",
        description: "Checks whether a report with valid required fields and contact details is accepted.",
        input: makeValidReport(),
        expectedError: null,
        expected: "The report data should pass validation without errors."
    },
    {
        id: "WB-04",
        name: "Invalid category",
        description: "Checks whether a category not present in the allowed category list is rejected.",
        input: makeValidReport({ category: "InvalidCategory" }),
        expectedError: "category",
        expected: "A category validation error should be returned."
    },
    {
        id: "WB-05",
        name: "Future date",
        description: "Checks whether the validator rejects an item date that is later than today.",
        input: makeValidReport({ item_date: futureDate }),
        expectedError: "item_date",
        expected: "A date validation error should be returned."
    },
    {
        id: "WB-06",
        name: "Invalid phone number",
        description: "Checks whether a phone number containing fewer than seven digits is rejected.",
        input: makeValidReport({
            contact_phone: "12345",
            contact_email: ""
        }),
        expectedError: "contact_phone",
        expected: "A phone validation error should be returned."
    }
];

let passed = 0;
let failed = 0;

console.log("\n==============================================");
console.log(" CAMPUS LOST & FOUND - WHITE-BOX TESTING");
console.log("==============================================\n");

for (const test of tests) {
    const result = validateReport(test.input);

    const success = test.expectedError === null
        ? Object.keys(result.errors).length === 0
        : Boolean(result.errors[test.expectedError]);

    if (success) {
        passed++;
    } else {
        failed++;
    }

    console.log(`${test.id}: ${test.name} - ${success ? "PASS" : "FAIL"}`);
    console.log(`Test: ${test.description}`);
    console.log(`Result: ${success ? test.expected : "Expected validation behavior was not observed."}`);
    console.log("----------------------------------------------");
}

console.log("\n=============== FINAL SUMMARY ===============");
console.log(`Total Test Cases : ${tests.length}`);
console.log(`Passed           : ${passed}`);
console.log(`Failed           : ${failed}`);
console.log(`Overall Status   : ${failed === 0 ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
console.log("==============================================\n");
