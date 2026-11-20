import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && specifier.endsWith(".js")) {
      const typescriptUrl = new URL(`${specifier.slice(0, -3)}.ts`, context.parentURL);

      if (existsSync(fileURLToPath(typescriptUrl))) {
        return nextResolve(typescriptUrl.href, context);
      }
    }

    return nextResolve(specifier, context);
  },
});
