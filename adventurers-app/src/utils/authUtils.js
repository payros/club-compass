/**
 * Returns true if the given email is in the ALLOWED_EMAILS whitelist.
 * If ALLOWED_EMAILS is empty or unset, all emails are allowed.
 */
export function isEmailAllowed(email) {
  console.log("process.env.ALLOWED_EMAILS", process.env.ALLOWED_EMAILS);
  const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowedEmails.includes(email.toLowerCase());
}
