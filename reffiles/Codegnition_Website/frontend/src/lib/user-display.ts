export function getUserDisplayName(fullName: string) {
  const clean = fullName.trim().replace(/\s+/g, " ");
  if (!clean) {
    return "Guest";
  }

  const parts = clean.split(" ");
  const firstName = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() : "";

  if (firstName.length > 7) {
    return `${firstName.slice(0, 7)}...`;
  }

  return lastInitial ? `${firstName}.${lastInitial}` : firstName;
}

export function getAvatarLabel(fullName: string) {
  const clean = fullName.trim().replace(/\s+/g, " ");
  if (!clean) {
    return "G";
  }

  const parts = clean.split(" ");
  const firstInitial = parts[0][0]?.toUpperCase() ?? "G";
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() : "";

  return `${firstInitial}${lastInitial}` || "G";
}
