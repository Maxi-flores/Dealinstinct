# Dealinstinct V2 Architecture

## Current Structure

Dealinstinct V2 is a Next.js application.

Known top-level files:

- `README.md` - current Next.js template documentation.
- `package.json` - scripts and dependency metadata.

## Runtime Flow

Local development:

```powershell
npm run dev
```

Validation/build:

```powershell
npm run lint
npm run build
```

## Dependencies

Key dependencies listed in `package.json` include Next.js, React, React DOM, Tailwind, TypeScript, and ESLint.

## Integration Points

- Dealinstinct V2 frontend surface.
- Future deployment and product integrations to be documented when implemented.

## Known Boundaries

- Governance tasks must not change product source.
- Package files and lockfiles require explicit review.
- Environment and deployment settings are sensitive.

## Future Architecture Notes

- Replace template README with Dealinstinct V2-specific documentation.
- Document routes, data flow, authentication, and deployment target.
- Add validation scenarios for product-critical workflows.
