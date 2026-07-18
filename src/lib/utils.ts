export function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean })[]) {
  const classes: string[] = [];
  inputs.forEach((input) => {
    if (!input) return;
    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      Object.entries(input).forEach(([key, value]) => {
        if (value) {
          classes.push(key);
        }
      });
    }
  });
  return classes.join(" ");
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return d.toISOString().replace("T", " ").substring(0, 16); // YYYY-MM-DD HH:MM
}

export function formatDateShort(date: string | Date | number): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}
