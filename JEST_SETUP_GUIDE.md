# Jest Configuration Guide for TypeScript + ESM Projects

## Problem Overview

When setting up Jest with TypeScript in an ES Modules (ESM) project, several configuration issues can occur. This document explains why these issues happen and how to resolve them.

## Root Causes

### 1. **ES Modules vs CommonJS**

Your project uses ES Modules (`"type": "module"` in package.json), which means:

- Node.js treats all `.js` files as ES modules
- You use `import/export` syntax instead of `require()`
- Jest was originally designed for CommonJS and needs special configuration for ESM

### 2. **TypeScript Compilation**

Jest cannot directly execute TypeScript files. It needs a transformer to convert:

```
TypeScript (.ts) → JavaScript → Test Execution
```

### 3. **Type Checking vs Runtime**

TypeScript's type checker and ESLint need to know about Jest's global functions (`test`, `expect`, `describe`, etc.) which are injected at runtime.

---

## The Errors We Fixed

### Error 1: "Cannot use import statement outside a module"

**Why it occurred:**

- Jest tried to execute TypeScript files directly
- Jest didn't have a transformer configured to convert TypeScript to JavaScript
- Jest didn't know to treat files as ES modules

**Solution:**

```bash
npm install --save-dev ts-jest ts-node
```

Then configure `jest.config.ts`:

```typescript
preset: 'ts-jest',
extensionsToTreatAsEsm: ['.ts'],
transform: {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      useESM: true,
    },
  ],
},
```

**What this does:**

- `ts-jest`: Transforms TypeScript files before Jest runs them
- `extensionsToTreatAsEsm`: Tells Jest to treat `.ts` files as ES modules
- `useESM: true`: Enables ESM support in ts-jest

### Error 2: Experimental VM Modules Required

**Why it occurred:**

- Jest's default test runner doesn't fully support ESM yet
- Node.js requires experimental flag for ES module support in VM contexts

**Solution:**
Update package.json test script:

```json
"test": "NODE_OPTIONS=\"$NODE_OPTIONS --experimental-vm-modules\" jest"
```

**What this does:**

- Enables Node.js experimental VM modules feature
- Allows Jest to properly load and execute ES modules

### Error 3: TypeScript Warning - Missing File Extensions

**Error message:**

```
Relative import paths need explicit file extensions in ECMAScript imports
when '--moduleResolution' is 'node16' or 'nodenext'.
```

**Why it occurred:**

- TypeScript's `"module": "nodenext"` enforces ESM standards
- ESM requires explicit file extensions in imports
- You need to use `.js` extension even for `.ts` files

**Solution:**

```typescript
// ❌ Wrong
import sum from './src/utilis'

// ✅ Correct
import sum from './src/utilis.js'
```

**Important Note:** You write `.js` even though the file is `.ts`. TypeScript will resolve it correctly during compilation.

### Error 4: TypeScript Cannot Find 'test' and 'expect'

**Why it occurred:**

- Jest globals (`test`, `expect`, `describe`, etc.) are injected at runtime
- TypeScript doesn't know about these unless you include the type definitions

**Solution:**
Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

**What this does:**

- Includes `@types/jest` type definitions
- Tells TypeScript about Jest's global functions
- Provides autocomplete and type checking for Jest APIs

### Error 5: ESLint "Unsafe call of error typed value"

**Why it occurred:**

- TypeScript-ESLint's strict rules were enabled
- Jest globals are dynamically injected, causing type safety warnings
- ESLint treats test files with same strict rules as production code

**Solution:**
Update `eslint.config.mjs`:

```javascript
ignores: [
  'dist/',
  'node_modules/',
  'eslint.config.mjs',
  '**/*.test.ts',
  '**/*.spec.ts',
]
```

**What this does:**

- Excludes test files from ESLint checking
- Common practice since test files have different requirements
- Prevents false positives from dynamically injected test globals

### Error 6: TypeScript rootDir Issue

**Why it occurred:**

- `tsconfig.json` had `"rootDir": "./src"`
- Test file was at project root, outside the rootDir
- TypeScript couldn't properly type-check the test file

**Solution:**
Remove or adjust `rootDir`:

```json
{
  "compilerOptions": {
    // Remove "rootDir": "./src" or adjust to include tests
    "outDir": "./dist"
  }
}
```

---

## Complete Configuration Reference

### package.json

```json
{
  "type": "module",
  "scripts": {
    "test": "NODE_OPTIONS=\"$NODE_OPTIONS --experimental-vm-modules\" jest"
  },
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "jest": "^30.2.0",
    "ts-jest": "^29.x.x",
    "ts-node": "^10.x.x",
    "typescript": "^5.x.x"
  }
}
```

### jest.config.ts

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  clearMocks: true,
  coverageProvider: 'v8',
}

export default config
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "types": ["node", "jest"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleDetection": "force"
  }
}
```

### eslint.config.mjs

```javascript
export default defineConfig(
  {
    ignores: ['dist/', 'node_modules/', '**/*.test.ts', '**/*.spec.ts'],
  },
  // ... other configs
)
```

---

## Key Concepts to Remember

### 1. File Extensions in TypeScript ESM

- **Always use `.js` extension** in imports, even for `.ts` files
- TypeScript resolves `.js` imports to `.ts` source files
- This is required by ESM specification and TypeScript's `nodenext` module resolution

### 2. Jest + TypeScript + ESM Stack

```
Your Test File (.ts)
    ↓
ts-jest (transforms to JS)
    ↓
Jest (with ESM support)
    ↓
Node.js (with --experimental-vm-modules)
    ↓
Test Results
```

### 3. Type Definitions

- Runtime behavior ≠ TypeScript types
- Jest injects globals at runtime
- Need `@types/jest` for TypeScript to understand these globals

### 4. Configuration Files

- `package.json`: Defines ESM mode and test script
- `jest.config.ts`: Configures Jest transformation and ESM support
- `tsconfig.json`: Configures TypeScript compilation and types
- `eslint.config.mjs`: Configures linting rules and ignores

---

## Troubleshooting Checklist

When you encounter Jest/TypeScript issues:

1. ✅ Is `"type": "module"` in package.json?
2. ✅ Is `ts-jest` installed?
3. ✅ Is `preset: 'ts-jest'` in jest.config.ts?
4. ✅ Is `useESM: true` configured in jest transform?
5. ✅ Does test script include `--experimental-vm-modules`?
6. ✅ Are imports using `.js` extensions?
7. ✅ Is `"jest"` in tsconfig types array?
8. ✅ Are test files ignored in ESLint config?

---

## Common Patterns

### Writing Tests

```typescript
import { functionName } from './module.js' // Note .js extension

describe('Feature Name', () => {
  test('should do something', () => {
    expect(functionName(input)).toBe(expected)
  })
})
```

### Async Tests

```typescript
test('async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})
```

### Mocking

```typescript
import { jest } from '@jest/globals' // For ESM

const mockFn = jest.fn()
```

---

## Why This Configuration is Necessary

**Without proper configuration:**

- ❌ Jest can't parse TypeScript
- ❌ ES modules aren't recognized
- ❌ Type checking fails
- ❌ IDE shows errors

**With proper configuration:**

- ✅ Jest transforms TypeScript → JavaScript
- ✅ ES modules work correctly
- ✅ Full type safety
- ✅ Clean IDE experience
- ✅ Reliable test execution

---

## Alternative Approaches

### Option 1: Use CommonJS (Simpler but outdated)

Remove `"type": "module"` and use `require()` syntax. Not recommended for new projects.

### Option 2: Use Vitest (Modern alternative)

Vitest has native ESM and TypeScript support with zero configuration.

### Option 3: Use tsx for testing

Run tests with `tsx` directly, though you lose Jest's features.

---

## Resources

- [Jest ESM Support](https://jestjs.io/docs/ecmascript-modules)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)

---

## Summary

The complexity comes from combining three modern technologies:

1. **TypeScript** - Type safety and compilation
2. **ES Modules** - Modern JavaScript module system
3. **Jest** - Testing framework designed for CommonJS

Each has different expectations and requirements. The configuration bridges these differences to make them work together seamlessly.

**Key takeaway:** This setup is a one-time configuration. Once done, you can write tests normally without worrying about these underlying complexities.
