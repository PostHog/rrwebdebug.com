import versionsJson from "./versions.json";
export function populateVersions(selectedVersion?: string) {
  const groupedSelects: Record<string, string> = {};

  Object.entries(versionsJson).forEach(([version, config]) => {
    const { group, rrwebVersion } = config;
    const isDefault = "default" in config && config.default;
    if (!groupedSelects[group]) {
      groupedSelects[group] = "";
    }
    groupedSelects[group] +=
      `<option value="${version}" ${isDefault ? "selected" : ""}>${version} (rrweb v${rrwebVersion})</option>`;
  });

  document.getElementById("versions")!.innerHTML = Object.entries(
    groupedSelects,
  )
    .map(([group, options]) => {
      return `<optgroup label="${group}">${options}</optgroup>`;
    })
    .join("");

  if (selectedVersion) {
    (document.getElementById("versions") as HTMLSelectElement).value =
      selectedVersion;
  }
}

export default populateVersions;
