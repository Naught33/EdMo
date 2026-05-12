/**
 * emailservice.js — EdMo Elite Property Care
 * ─────────────────────────────────────────────
 * Write once, import anywhere.
 *
 * SETUP (do once before importing):
 *   1. Replace the three constants below with your real EmailJS credentials.
 *   2. Add this script to any page that uses a contact form — it self-initialises.
 *
 * Usage:
 *   import { sendFormEmail } from "./emailservice.js";
 *
 *   form.addEventListener("submit", async (e) => {
 *       e.preventDefault();
 *       clearErrors(form);
 *       if (!validateForm(form)) return;
 *
 *       const result = await sendFormEmail(form, "Home Page");
 *       if (result.success) {
 *           showSuccess(form, successEl);
 *           form.reset();
 *       } else {
 *           showEmailError(form, errorEl);
 *       }
 *   });
 */

// ── ⚙️  YOUR EMAILJS CREDENTIALS ─────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY             = "8Ki61h4jInyc23rv1";
const EMAILJS_SERVICE_ID             = "service_478pkaw";
const EMAILJS_TEMPLATE_ID            = "template_fsnz3uy";    // → notifies you (EdMo team)
const EMAILJS_AUTOREPLY_TEMPLATE_ID  = "template_405nuwl";    // → confirms to the client
// ─────────────────────────────────────────────────────────────────────────────

// ── Lazy-load & initialise EmailJS SDK ────────────────────────────────────────
let _sdkReady = false;

async function ensureSDK() {
    if (_sdkReady) return;
    if (typeof emailjs !== "undefined") {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        _sdkReady = true;
        return;
    }

    await new Promise((resolve, reject) => {
        const script   = document.createElement("script");
        script.src     = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        script.onload  = () => {
            emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            _sdkReady = true;
            resolve();
        };
        script.onerror = () => reject(new Error("EmailJS SDK failed to load."));
        document.head.appendChild(script);
    });
}

// ── Field extraction helpers ──────────────────────────────────────────────────

/**
 * Extracts all named form field values into a plain object.
 * Works with input, textarea, and select elements.
 */
function extractFields(form) {
    const data = {};
    form.querySelectorAll("[name]").forEach((el) => {
        data[el.name] = el.value ?? "";
    });
    return data;
}

/**
 * Returns a human-readable local date/time string, e.g. "May 12, 2026, 3:45 PM".
 */
function nowString() {
    return new Date().toLocaleString("en-US", {
        month:   "long",
        day:     "numeric",
        year:    "numeric",
        hour:    "numeric",
        minute:  "2-digit",
        hour12:  true,
    });
}

/**
 * Derives initials (up to 2 chars) from a name fragment.
 * "John" → "J", "" → "?"
 */
function initial(name = "") {
    return (name.trim()[0] ?? "?").toUpperCase();
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Builds the template variables object and sends the email via EmailJS.
 *
 * @param {HTMLFormElement} form        — the form whose fields to read
 * @param {string}          sourcePage  — human label for where the form lives,
 *                                        e.g. "Home Page", "Contact Page"
 * @returns {Promise<{ success: boolean, error?: unknown }>}
 *
 * Template variables sent (match these names in your EmailJS template):
 *   {{first_name}}         first name field
 *   {{last_name}}          last name field
 *   {{first_name_initial}} first letter of first name (for avatar)
 *   {{last_name_initial}}  first letter of last name (for avatar)
 *   {{email}}              email field
 *   {{phone}}              phone field (blank-safe)
 *   {{service}}            service dropdown value
 *   {{message}}            message / textarea field
 *   {{submission_time}}    auto-generated local date + time
 *   {{source_page}}        the sourcePage argument you pass in
 *   {{form_id}}            auto-generated short ID for the submission
 */
export async function sendFormEmail(form, sourcePage = "Website") {
    try {
        await ensureSDK();

        const f = extractFields(form);

        const templateParams = {
            first_name:         f["first-name"]  ?? f["first_name"]  ?? "",
            last_name:          f["last-name"]   ?? f["last_name"]   ?? "",
            first_name_initial: initial(f["first-name"]  ?? f["first_name"]  ?? ""),
            last_name_initial:  initial(f["last-name"]   ?? f["last_name"]   ?? ""),
            email:              f["email"]   ?? "",
            phone:              f["phone"]   || "Not provided",
            service:            f["service"] || "Not specified",
            message:            f["message"] ?? "",
            submission_time:    nowString(),
            source_page:        sourcePage,
            form_id:            `EDMO-${Date.now().toString(36).toUpperCase()}`,
        };

        // Fire both emails simultaneously — neither waits on the other
        await Promise.all([
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,           templateParams),
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE_ID, templateParams),
        ]);

        return { success: true };

    } catch (error) {
        console.error("[EmailJS] Send failed:", error);
        return { success: false, error };
    }
}

// ── Optional: show a send-error message in the UI ────────────────────────────

/**
 * Reveals an error element (similar to showSuccess in formvalidation.js).
 * Pass an element with a class like .form-error (display: none by default).
 * Auto-hides after 8 seconds.
 *
 * @param {HTMLFormElement} form
 * @param {HTMLElement}     errorEl
 */
export function showEmailError(form, errorEl) {
    if (!errorEl) return;
    errorEl.style.display = "block";
    errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => { errorEl.style.display = "none"; }, 8000);
}