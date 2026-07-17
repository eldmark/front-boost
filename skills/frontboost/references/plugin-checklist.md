# Plugin Checklist

When designing a new FrontBoost framework plugin:

1. Define how the framework is detected.
2. Define which file types and entrypoints it owns.
3. Register parser capabilities.
4. Add framework-specific project facts.
5. Implement rules against normalized contracts where possible.
6. Emit diagnostics in the universal schema.
7. Keep adapter formatting out of the plugin.

Minimum plugin outputs:

- framework identity
- parser registry
- rule registry
- recommendation metadata

If the plugin cannot fit without editing `core`, the core contract is probably not ready yet.
