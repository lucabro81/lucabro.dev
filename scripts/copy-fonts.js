import { cpSync, mkdirSync } from "fs";

const src = (pkg, file) => `node_modules/@fontsource/${pkg}/files/${file}`;
const dest = "public/fonts";

mkdirSync(dest, { recursive: true });

const fonts = [
  ["ibm-plex-serif", "ibm-plex-serif-latin-400-normal.woff2"],
  ["ibm-plex-serif", "ibm-plex-serif-latin-400-italic.woff2"],
  ["ibm-plex-serif", "ibm-plex-serif-latin-700-normal.woff2"],
  ["ibm-plex-mono",  "ibm-plex-mono-latin-400-normal.woff2"],
  ["ibm-plex-mono",  "ibm-plex-mono-latin-400-italic.woff2"],
];

for (const [pkg, file] of fonts) {
  cpSync(src(pkg, file), `${dest}/${file}`);
  console.log(`copied ${file}`);
}
