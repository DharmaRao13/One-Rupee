export function generateReferralCode(displayName: string): string {
  const slug = displayName.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6) || "USER";
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${slug}-${rand}`;
}
