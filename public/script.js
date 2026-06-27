// ================================
// DOM Elements
// ================================
const productsDiv = document.getElementById("products");
const categoryPills = document.getElementById("categoryPills");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const skeleton = document.getElementById("skeleton");
const productCount = document.getElementById("productCount");
const pageIndicator = document.getElementById("pageIndicator");

// ================================
// State
// ================================
let currentCategory = "";
let currentPage = 1;
let isLoading = false;

// Cursor history: cursorHistory[0] = null (page 1), cursorHistory[1] = cursor for page 2, etc.
let cursorHistory = [null];
let hasMore = false;

// ================================
// Category badge helper
// ================================
const badgeClass = {
    Electronics: "badge-electronics",
    Books: "badge-books",
    Fashion: "badge-fashion",
    Sports: "badge-sports",
    Home: "badge-home",
    Beauty: "badge-beauty",
    Toys: "badge-toys",
};

// ================================
// Format price with commas
// ================================
function formatPrice(price) {
    return Number(price).toLocaleString("en-IN");
}

// ================================
// Format date
// ================================
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ================================
// Load a specific page
// ================================
async function loadPage(page) {
    if (isLoading) return;
    isLoading = true;

    // Clear current products
    productsDiv.innerHTML = "";

    // Show skeleton, disable buttons
    skeleton.style.display = "grid";
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    // Get cursor for this page
    const cursor = cursorHistory[page - 1] || null;

    // Build URL
    let url = "/products?limit=20";

    if (currentCategory) {
        url += `&category=${encodeURIComponent(currentCategory)}`;
    }

    if (cursor) {
        url += `&cursorUpdatedAt=${encodeURIComponent(cursor.updatedAt)}`;
        url += `&cursorId=${cursor.id}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        // Render cards with staggered animation
        data.products.forEach((product, i) => {
            const card = document.createElement("div");
            card.className = "card card-animated";
            card.style.animationDelay = `${i * 30}ms`;

            const badge = badgeClass[product.category] || "";

            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${product.name}</h3>
                    <span class="category-badge ${badge}">${product.category}</span>
                </div>
                <div class="card-price">
                    <span class="currency">₹</span>${formatPrice(product.price)}
                </div>
                <div class="card-footer">
                    <span class="card-id">#${product.id}</span>
                    <span class="card-date">${formatDate(product.updated_at)}</span>
                </div>
            `;

            productsDiv.appendChild(card);
        });

        // Update state
        currentPage = page;
        hasMore = data.hasMore;

        // Store cursor for the NEXT page
        if (data.hasMore && data.nextCursor) {
            cursorHistory[page] = data.nextCursor;
        }

        // Update UI
        const catLabel = currentCategory || "All Categories";
        productCount.textContent = `${catLabel} — Page ${currentPage} — ${data.count} products`;
        pageIndicator.textContent = `Page ${currentPage}`;

        // Enable/disable buttons
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = !hasMore;

        // Scroll to top of products
        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
        console.error("Failed to load products:", err);
        productCount.textContent = "⚠ Failed to load products";
    } finally {
        skeleton.style.display = "none";
        isLoading = false;
    }
}

// ================================
// Category Pills Click
// ================================
categoryPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;

    // Update active state
    categoryPills.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");

    // Reset everything for new category
    currentCategory = pill.dataset.category;
    cursorHistory = [null];
    loadPage(1);
});

// ================================
// Previous / Next Buttons
// ================================
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        loadPage(currentPage - 1);
    }
});

nextBtn.addEventListener("click", () => {
    if (hasMore) {
        loadPage(currentPage + 1);
    }
});

// ================================
// Initial Load
// ================================
loadPage(1);