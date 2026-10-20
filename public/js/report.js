const reportForm = document.getElementById("reportForm");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

const fieldNames = [
    "report_type",
    "item_name",
    "category",
    "item_date",
    "location",
    "description",
    "contact_name",
    "contact_email",
    "contact_phone"
];

const allowedCategories = [
    "Electronics",
    "ID or Wallet",
    "Keys",
    "Clothing",
    "Books or Stationery",
    "Accessories",
    "Other"
];

function valueOf(name) {
    return String(reportForm.elements[name]?.value || "").trim();
}

function showFieldError(name, message) {
    const field = reportForm.elements[name];
    const errorElement = document.getElementById(`${name}Error`);

    if (!field || !errorElement) return;

    errorElement.textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    field.classList.toggle("is-valid", !message && Boolean(field.value.trim()));
    field.setAttribute("aria-invalid", message ? "true" : "false");
}

function clearFieldErrors() {
    fieldNames.forEach((name) => {
        const field = reportForm.elements[name];
        const errorElement = document.getElementById(`${name}Error`);

        if (field) {
            field.classList.remove("is-invalid", "is-valid");
            field.removeAttribute("aria-invalid");
        }

        if (errorElement) errorElement.textContent = "";
    });
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `alert alert-${type}`;
}

function hideFormMessage() {
    formMessage.textContent = "";
    formMessage.className = "alert d-none";
}

function localDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isValidDateOnly(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const parsed = new Date(`${value}T00:00:00Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value
    );
}

function validateField(name) {
    const value = valueOf(name);
    let error = "";

    switch (name) {
        case "report_type":
            if (!["LOST", "FOUND"].includes(value)) {
                error = "Please select Lost or Found.";
            }
            break;

        case "item_name":
            if (!value) {
                error = "Item name is required.";
            } else if (value.length > 100) {
                error = "Item name must not exceed 100 characters.";
            }
            break;

        case "category":
            if (!value) {
                error = "Please select a category.";
            } else if (!allowedCategories.includes(value)) {
                error = "Please select a valid category.";
            }
            break;

        case "item_date":
            if (!value) {
                error = "Date is required.";
            } else if (!isValidDateOnly(value)) {
                error = "Please enter a valid date.";
            } else if (value > localDateString()) {
                error = "The date cannot be in the future.";
            }
            break;

        case "location":
            if (!value) {
                error = "Location is required.";
            } else if (value.length > 150) {
                error = "Location must not exceed 150 characters.";
            }
            break;

        case "description":
            if (value.length > 2000) {
                error = "Description must not exceed 2000 characters.";
            }
            break;

        case "contact_name":
            if (!value) {
                error = "Your name is required.";
            } else if (value.length > 100) {
                error = "Name must not exceed 100 characters.";
            }
            break;
    }

    showFieldError(name, error);
    return !error;
}

function validateContacts() {
    const email = valueOf("contact_email");
    const phone = valueOf("contact_phone");

    let emailError = "";
    let phoneError = "";

    if (!email && !phone) {
        emailError = "Enter an email address or phone number.";
        phoneError = "Enter an email address or phone number.";
    } else {
        if (email) {
            if (email.length > 254) {
                emailError = "Email must not exceed 254 characters.";
            } else if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
            ) {
                emailError = "Enter a valid email, e.g. name@example.com.";
            }
        }

        if (phone) {
            const digitCount = phone.replace(/\D/g, "").length;

            if (
                phone.length > 25 ||
                !/^[+()\d\s-]+$/.test(phone) ||
                digitCount < 7 ||
                digitCount > 15
            ) {
                phoneError =
                    "Enter a valid phone number containing 7–15 digits.";
            }
        }
    }

    showFieldError("contact_email", emailError);
    showFieldError("contact_phone", phoneError);

    return !emailError && !phoneError;
}

function validateAll() {
    let valid = true;

    fieldNames
        .filter((name) => !["contact_email", "contact_phone"].includes(name))
        .forEach((name) => {
            if (!validateField(name)) valid = false;
        });

    if (!validateContacts()) valid = false;

    return valid;
}

function handleFieldChange(event) {
    const name = event.target.name;

    if (!fieldNames.includes(name)) return;

    hideFormMessage();

    if (name === "contact_email" || name === "contact_phone") {
        validateContacts();
    } else {
        validateField(name);
    }
}

// Set today's date as the maximum selectable date.
reportForm.elements.item_date.max = localDateString();

// Validate while typing and changing fields.
reportForm.addEventListener("input", handleFieldChange);
reportForm.addEventListener("change", handleFieldChange);
reportForm.addEventListener("focusout", handleFieldChange, true);

// Submit only after client-side validation succeeds.
reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideFormMessage();

    if (!validateAll()) {
        const firstInvalid = reportForm.querySelector(".is-invalid");

        if (firstInvalid) {
            firstInvalid.focus();
        }

        return;
    }

    const formData = Object.fromEntries(
        new FormData(reportForm).entries()
    );

    formData.report_type = formData.report_type.toUpperCase();

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        const response = await fetch("/api/reports", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            if (result.errors) {
                let mappedErrors = false;

                Object.entries(result.errors).forEach(([name, message]) => {
                    if (name === "contact") {
                        showFieldError("contact_email", message);
                        showFieldError("contact_phone", message);
                        mappedErrors = true;
                    } else if (fieldNames.includes(name)) {
                        showFieldError(name, message);
                        mappedErrors = true;
                    }
                });

                if (mappedErrors) {
                    const firstInvalid =
                        reportForm.querySelector(".is-invalid");

                    if (firstInvalid) firstInvalid.focus();
                } else {
                    showFormMessage(
                        result.message || "Please correct the form errors.",
                        "danger"
                    );
                }
            } else {
                showFormMessage(
                    result.message || "Unable to submit the report.",
                    "danger"
                );
            }

            return;
        }

        reportForm.reset();
        clearFieldErrors();

        showFormMessage(
            `Report submitted successfully! Report ID: ${result.reportId}`,
            "success"
        );
    } catch (error) {
        showFormMessage(
            "Could not connect to the server. Check that it is running.",
            "danger"
        );
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Report";
    }
});