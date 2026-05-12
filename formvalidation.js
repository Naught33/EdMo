/**
 * formvalidation.js — EdMo Elite Property Care
 * ─────────────────────────────────────────────
 * Write once, import anywhere.
 *
 * Usage:
 *   import { validateForm, clearErrors, showSuccess } from "./formvalidation.js";
 *
 *   form.addEventListener("submit", (e) => {
 *       e.preventDefault();
 *       clearErrors(form);
 *       if (validateForm(form)) {
 *           showSuccess(form, successEl);
 *           form.reset();
 *       }
 *   });
 */

// ── Validators ────────────────────────────────────────────────────────────────

const RULES = {
    required: (val) => val.trim() !== "" || "This field is required.",

    email: (val) =>
        !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
            ? true
            : "Please enter a valid email address.",

    tel: (val) =>
        !val || /^[\+\d][\d\s\-\(\)]{6,19}$/.test(val.trim())
            ? true
            : "Please enter a valid phone number.",

    minlength: (val, len) =>
        !val || val.trim().length >= Number(len)
            ? true
            : `Must be at least ${len} characters.`,

    select: (val) =>
        val && val !== "" ? true : "Please select an option.",
};

// ── Core: validate a single field ─────────────────────────────────────────────

/**
 * Validates one input/textarea/select element against its data attributes.
 * Supported data attributes on the element:
 *   data-validate="required email tel"   (space-separated rule names)
 *   data-minlength="10"                  (used with the minlength rule)
 *   data-label="Email Address"           (used in error messages; falls back to name/id)
 *
 * Returns the first error string, or null if valid.
 */
function validateField(el) {
    const rulesAttr = (el.dataset.validate || "").trim();
    if (!rulesAttr) return null; // no rules declared → skip

    const ruleNames = rulesAttr.split(/\s+/);
    const val = el.value;

    for (const rule of ruleNames) {
        const fn = RULES[rule];
        if (!fn) continue;

        const extra = rule === "minlength" ? el.dataset.minlength : undefined;
        const result = fn(val, extra);
        if (result !== true) return result;
    }

    return null; // all rules passed
}

// ── Error display helpers ─────────────────────────────────────────────────────

/**
 * Marks a field as invalid and injects an error message beneath it.
 */
function showFieldError(el, message) {
    el.classList.add("field-error");
    el.setAttribute("aria-invalid", "true");

    // Avoid double-injecting
    const existing = el.parentElement.querySelector(".field-error-msg");
    if (existing) { existing.textContent = message; return; }

    const msg = document.createElement("span");
    msg.className = "field-error-msg";
    msg.setAttribute("role", "alert");
    msg.textContent = message;
    el.parentElement.appendChild(msg);
}

/**
 * Clears error state from a single field.
 */
function clearFieldError(el) {
    el.classList.remove("field-error");
    el.removeAttribute("aria-invalid");
    const msg = el.parentElement.querySelector(".field-error-msg");
    if (msg) msg.remove();
}

/**
 * Clears all errors inside a form.
 */
export function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach(clearFieldError);
}

// ── Inline real-time feedback ─────────────────────────────────────────────────

/**
 * Attaches blur-time validation to every validatable field in the form.
 * Users see errors only after they leave a field (not while typing).
 */
export function attachInlineValidation(form) {
    form.querySelectorAll("[data-validate]").forEach((el) => {
        el.addEventListener("blur", () => {
            clearFieldError(el);
            const err = validateField(el);
            if (err) showFieldError(el, err);
        });

        // Clear the error as soon as the user starts correcting
        el.addEventListener("input", () => {
            if (el.classList.contains("field-error")) {
                clearFieldError(el);
            }
        });
    });
}

// ── Main: validate whole form ─────────────────────────────────────────────────

/**
 * Validates every field in the form that has a data-validate attribute.
 * Shows inline errors and focuses the first invalid field.
 * Returns true only if the entire form is valid.
 *
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
export function validateForm(form) {
    const fields = form.querySelectorAll("[data-validate]");
    let firstInvalid = null;

    fields.forEach((el) => {
        clearFieldError(el);
        const err = validateField(el);
        if (err) {
            showFieldError(el, err);
            if (!firstInvalid) firstInvalid = el;
        }
    });

    if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
    }

    return true;
}

// ── Success helper ────────────────────────────────────────────────────────────

/**
 * Shows a success message element and scrolls it into view.
 * @param {HTMLFormElement} form
 * @param {HTMLElement}     successEl  — the element to reveal (display: none → block)
 */
export function showSuccess(form, successEl) {
    if (!successEl) return;
    successEl.style.display = "block";
    successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Auto-hide after 6 seconds
    setTimeout(() => { successEl.style.display = "none"; }, 6000);
}

// ── CSS injection ─────────────────────────────────────────────────────────────
// Injects the minimal styles needed for error states. This keeps the module
// self-contained — no separate CSS file required. Runs once per page.

(function injectStyles() {
    if (document.getElementById("fv-styles")) return;
    const style = document.createElement("style");
    style.id = "fv-styles";
    style.textContent = `
        .field-error {
            border-color: #e53e3e !important;
            outline-color: rgba(229, 62, 62, 0.3) !important;
        }
        .field-error-msg {
            display: block;
            margin-top: 4px;
            font-family: "Raleway", sans-serif;
            font-size: 0.78rem;
            font-weight: 600;
            color: #e53e3e;
            line-height: 1.4;
        }
    `;
    document.head.appendChild(style);
})();