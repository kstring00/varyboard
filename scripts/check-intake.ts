/**
 * Build gate: every valid intake combination must have content.
 *   npm run check:intake   (runs in prebuild)
 */
import { assertIntakeComplete } from "../lib/intake";

try {
  const n = assertIntakeComplete();
  console.log(`✓ intake content complete for ${n} plan combinations`);
} catch (err) {
  console.error(`✗ ${(err as Error).message}`);
  process.exit(1);
}
