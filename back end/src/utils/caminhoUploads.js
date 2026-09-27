import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// src/utils/ -> sobe 2 níveis pra chegar na raiz do projeto -> /uploads
export const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
