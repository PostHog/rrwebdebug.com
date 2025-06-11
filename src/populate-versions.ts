import versionsJson from "./versions.json";
export function populateVersions(selectedVersion?: string) {
  let lastGroup = "";
  document.getElementById("versions")!.innerHTML = Object.entries(versionsJson)
    .map(([version, config]) => {
      const { rrwebVersion } = config;
      const isDefault = "default" in config && config.default;
      const group = config.group;
      let prefix = "";
      let suffix = "";
      if (group !== lastGroup) {
        lastGroup = group;
        prefix = `<optgroup label="${group}">`;
        suffix = `</optgroup>`;
      }
      return `${prefix}<option value="${version}" ${isDefault ? "selected" : ""
        }>${version} (rrweb v${rrwebVersion})</option>${suffix}`;
    })
    .join("");

  if (selectedVersion) {
    (document.getElementById("versions") as HTMLSelectElement).value =
      selectedVersion;
  }
}

export default populateVersions;
