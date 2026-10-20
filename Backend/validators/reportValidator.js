
const allowedCategories = new Set([
    "Electronics",
    "ID or Wallet",
    "Keys",
    "Clothing",
    "Books or Stationery",
    "Accessories",
    "Other"
]);

const allowedReportTypes = new Set(["LOST", "FOUND"]);

function isValidDateOnly(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        return false;
    }

    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    return value <= today;
}


function isValidEmail(email) {
    if (!email || email.length > 254 || /\s/.test(email)) {
        return false;
    }

    const parts = email.split("@");

    if (parts.length !== 2) {
        return false;
    }

    const [local, domain] = parts;

    // Validate the part before @
    if (
        !local ||
        local.length > 64 ||
        local.startsWith(".") ||
        local.endsWith(".") ||
        local.includes("..") ||
        !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
    ) {
        return false;
    }

    // Validate the domain
    if (
        !domain ||
        domain.length > 253 ||
        domain.startsWith(".") ||
        domain.endsWith(".") ||
        domain.includes("..")
    ) {
        return false;
    }

    const labels = domain.split(".");

    if (labels.length < 2) {
        return false;
    }

    // Reject empty labels, invalid characters and misplaced hyphens.
    const validLabels = labels.every((label) =>
        label.length <= 63 &&
        /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label)
    );

    if (!validLabels) {
        return false;
    }

    // Require a conventional alphabetic top-level domain.
    const tld = labels[labels.length - 1];

    return /^[A-Za-z]{2,63}$/.test(tld);
}


function validateReport(body) {
    const source =
        body && typeof body === "object" && !Array.isArray(body)
            ? body
            : {};

    const read = (key) =>
        typeof source[key] === "string"
            ? source[key].trim()
            : "";

    const data = {
        report_type: read("report_type").toUpperCase(),
        item_name: read("item_name"),
        category: read("category"),
        item_date: read("item_date"),
        location: read("location"),
        description: read("description"),
        contact_name: read("contact_name"),
        contact_email: read("contact_email"),
        contact_phone: read("contact_phone")
    };

    const errors = {};

    if (!allowedReportTypes.has(data.report_type)) {
        errors.report_type = "Please select Lost or Found.";
    }

    if (!data.item_name) {
        errors.item_name = "Item name is required.";
    } else if (data.item_name.length > 100) {
        errors.item_name =
            "Item name must not exceed 100 characters.";
    }

    if (!data.category) {
        errors.category = "Category is required.";
    } else if (!allowedCategories.has(data.category)) {
        errors.category = "Please select a valid category.";
    }

    if (!data.item_date) {
        errors.item_date = "Date is required.";
    } else if (!isValidDateOnly(data.item_date)) {
        errors.item_date =
            "Enter a valid date that is not in the future.";
    }

    if (!data.location) {
        errors.location = "Location is required.";
    } else if (data.location.length > 150) {
        errors.location =
            "Location must not exceed 150 characters.";
    }

    if (data.description.length > 2000) {
        errors.description =
            "Description must not exceed 2000 characters.";
    }

    if (!data.contact_name) {
        errors.contact_name = "Your name is required.";
    } else if (data.contact_name.length > 100) {
        errors.contact_name =
            "Name must not exceed 100 characters.";
    }

    if (data.contact_email && !isValidEmail(data.contact_email)) {
        errors.contact_email =
            "Enter a valid email address.";
    }

    const phoneDigits = data.contact_phone.replace(/\D/g, "");

    if (
        data.contact_phone.length > 25 ||
        (
            data.contact_phone &&
            (
                !/^[+()\d\s-]+$/.test(data.contact_phone) ||
                phoneDigits.length < 7 ||
                phoneDigits.length > 15
            )
        )
    ) {
        errors.contact_phone =
            "Enter a valid phone number containing 7–15 digits.";
    }

    if (!data.contact_email && !data.contact_phone) {
        errors.contact_email =
            "Enter an email address or phone number.";
        errors.contact_phone =
            "Enter an email address or phone number.";
    }

    return { data, errors };
}

module.exports = {
    validateReport,
    allowedCategories,
    allowedReportTypes
};

