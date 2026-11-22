import pkg from "../../package.json";

/** Versión publicada de Gamarra Conecta. Coincide con la etiqueta de Git y la versión de Jira. */
export const APP_VERSION: string = pkg.version;

export function versionLabel(version: string = APP_VERSION): string {
  return `v${version}`;
}
