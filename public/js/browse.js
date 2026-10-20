const browseForm = document.getElementById("browseForm");
const reportResults = document.getElementById("reportResults");
const resultsSummary = document.getElementById("resultsSummary");
const browseMessage = document.getElementById("browseMessage");
const applyFiltersButton = document.getElementById("applyFiltersButton");
const clearFiltersButton = document.getElementById("clearFiltersButton");

function showBrowseMessage(message, type = "info") {
    browseMessage.textContent = message;
    browseMessage.className = `alert alert-${type}`;
}

function hideBrowseMessage() {
    browseMessage.textContent = "";
    browseMessage.className = "alert d-none";
}

function addItemDetail(container, label, value) {
    const line = document.createElement("p");
    line.className = "item-detail";

    const heading = document.createElement("strong");
    heading.textContent = `${label}: `;

    const content = document.createElement("span");
    content.textContent = value || "Not provided";

    line.append(heading, content);
    container.appendChild(line);
}

function createReportCard(report) {
    const column = document.createElement("div");
    column.className = "col-12 col-md-6";

    const card = document.createElement("article");
    card.className = "card item-result-card";

    const body = document.createElement("div");
    body.className = "card-body";

    const header = document.createElement("div");
    header.className =
        "d-flex justify-content-between align-items-center gap-2";

    const typeBadge = document.createElement("span");
    const isFound = report.report_type === "FOUND";

    typeBadge.className = `badge rounded-pill ${
        isFound ? "text-bg-success" : "text-bg-danger"
    }`;
    typeBadge.textContent = isFound ? "FOUND ITEM" : "LOST ITEM";

    const reportId = document.createElement("span");
    reportId.className = "report-id";
    reportId.textContent = `Report #${report.id}`;

    header.append(typeBadge, reportId);

    const title = document.createElement("h3");
    title.className = "h5 item-card-title mt-3 mb-2";
    title.textContent = report.item_name || "Untitled item";

    const category = document.createElement("span");
    category.className = "item-category";
    category.textContent = report.category || "Uncategorized";

    const details = document.createElement("div");
    details.className = "mt-3";

    addItemDetail(details, "Date", report.item_date);
    addItemDetail(details, "Location", report.location);

    body.append(header, title, category, details);

    if (report.description) {
        const description = document.createElement("p");
        description.className = "item-description text-secondary";
        description.textContent = report.description;
        body.appendChild(description);
    }

    card.appendChild(body);
    column.appendChild(card);

    return column;
}

async function loadReports() {
    const search = document.getElementById("searchKeyword").value.trim();
    const reportType = document.getElementById("filterReportType").value;
    const category = document.getElementById("filterCategory").value;
    const location = document.getElementById("filterLocation").value.trim();

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (reportType) params.set("report_type", reportType);
    if (category) params.set("category", category);
    if (location) params.set("location", location);

    const queryString = params.toString();
    const url = queryString
        ? `/api/reports?${queryString}`
        : "/api/reports";

    applyFiltersButton.disabled = true;
    clearFiltersButton.disabled = true;
    applyFiltersButton.textContent = "Searching...";
    resultsSummary.textContent = "Loading reports...";
    reportResults.replaceChildren();
    hideBrowseMessage();

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Unable to load reports."
            );
        }

        const reports = Array.isArray(result.reports)
            ? result.reports
            : [];

        const count = Number.isInteger(result.count)
            ? result.count
            : reports.length;

        resultsSummary.textContent =
            `${count} ${count === 1 ? "report" : "reports"} found`;

        if (reports.length === 0) {
            showBrowseMessage(
                "No matching items found. Try changing your search or clearing the filters.",
                "info"
            );
            return;
        }

        const fragment = document.createDocumentFragment();

        reports.forEach((report) => {
            fragment.appendChild(createReportCard(report));
        });

        reportResults.appendChild(fragment);
    } catch (error) {
        console.error("Browse reports error:", error);

        resultsSummary.textContent = "Unable to load reports.";

        showBrowseMessage(
            error.message ||
                "Could not connect to the server. Please try again.",
            "danger"
        );
    } finally {
        applyFiltersButton.disabled = false;
        clearFiltersButton.disabled = false;
        applyFiltersButton.textContent = "Search & Filter";
    }
}

browseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadReports();
});

clearFiltersButton.addEventListener("click", () => {
    browseForm.reset();
    loadReports();
});

loadReports();