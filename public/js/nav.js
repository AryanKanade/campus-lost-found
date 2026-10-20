
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll(".site-nav a[href]").forEach((link) => {
        const linkUrl = new URL(link.href, window.location.origin);

        if (linkUrl.origin !== window.location.origin) {
            return;
        }

        const linkPath = normalizePath(linkUrl.pathname);
        const isActive = linkPath === currentPath;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
});

function normalizePath(path) {
    const normalized = path.replace(/\/+$/, "") || "/";

    if (normalized === "/index.html") {
        return "/";
    }

    return normalized;
}
