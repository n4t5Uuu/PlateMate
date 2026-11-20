import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

// Endpoint, region and credentials come from the AWS_* variables Neon injects. "assets" is declared in neon.ts.
export const files = new Files({ adapter: neon({ bucket: "assets" }) });
