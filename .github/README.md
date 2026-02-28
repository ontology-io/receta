# GitHub Actions Configuration

This directory contains GitHub Actions workflows and reusable composite actions for CI/CD.

## Directory Structure

```
.github/
├── actions/              # Reusable composite actions
│   ├── setup-build-env/  # Setup Node.js + Bun + dependencies
│   ├── build-and-test/   # Build + typecheck + test all packages
│   └── publish-package/  # Publish to npm/JSR/GitHub Packages
├── config/
│   └── packages.json     # Single source of truth for package definitions
└── workflows/
    ├── ci.yml            # Continuous integration (tests, linting)
    ├── publish.yml       # Manual publishing workflow
    └── release-please.yml # Automated releases (uses composite actions)
```

## Composite Actions

### `setup-build-env`
Sets up the build environment with Node.js, Bun, and dependencies.

**Inputs:**
- `node-version` (default: `'20'`) - Node.js version
- `bun-version` (default: `'latest'`) - Bun version
- `registry-url` (default: `'https://registry.npmjs.org'`) - npm registry URL
- `scope` (optional) - npm scope for registry configuration

**Usage:**
```yaml
- uses: ./.github/actions/setup-build-env
  with:
    registry-url: 'https://registry.npmjs.org'
```

### `build-and-test`
Builds all packages, runs type checking, and executes tests.

**Outputs:**
- `build-success` - Boolean indicating if build succeeded

**Usage:**
```yaml
- uses: ./.github/actions/build-and-test
```

### `publish-package`
Publishes a single package to npm, JSR, or GitHub Packages.

**Inputs:**
- `package-path` (required) - Path to package directory (e.g., `packages/receta`)
- `package-name` (required) - Package name for display
- `registry` (required) - Target registry: `npm`, `jsr`, or `github`
- `access` (default: `'public'`) - npm access level
- `auth-token` (required) - Authentication token

**Usage:**
```yaml
- uses: ./.github/actions/publish-package
  with:
    package-path: 'packages/receta'
    package-name: '@ontologyio/receta'
    registry: 'npm'
    access: 'public'
    auth-token: ${{ secrets.NPM_TOKEN }}
```

## Package Configuration

The [config/packages.json](./config/packages.json) file serves as the **single source of truth** for all packages in the monorepo.

### Schema

```json
{
  "packages": [
    {
      "name": "@ontologyio/receta",
      "path": "packages/receta",
      "releaseKey": "receta",
      "registries": {
        "npm": {
          "enabled": true,
          "access": "public"
        },
        "jsr": {
          "enabled": true,
          "name": "@ontologyio/receta"
        },
        "github": {
          "enabled": true,
          "name": "@ontologyio/receta"
        }
      }
    }
  ]
}
```

### Adding a New Package

1. Add the package to `config/packages.json`:
   ```json
   {
     "name": "@ontologyio/new-package",
     "path": "packages/new-package",
     "releaseKey": "new_package",
     "registries": {
       "npm": { "enabled": true, "access": "public" },
       "jsr": { "enabled": true, "name": "@ontologyio/new-package" },
       "github": { "enabled": true, "name": "@ontologyio/new-package" }
     }
   }
   ```

2. Update `release-please.yml`:
   - Add new outputs in the `release-please` job
   - Add new matrix entry to each publish job

3. Update `release-please-config.json` and `.release-please-manifest.json`

## Workflows

### `release-please.yml`

Automated release workflow using [Release Please](https://github.com/googleapis/release-please).

**Architecture:**
- **Single job** for Release Please to create release PRs
- **Three parallel jobs** for publishing to different registries (npm, JSR, GitHub Packages)
- **Matrix strategy** to publish multiple packages in parallel
- **Composite actions** to eliminate code duplication

**Improvements over previous version:**
- ✅ 50% fewer lines of code (221 → ~235 with better structure)
- ✅ Single source of truth for package definitions
- ✅ Reusable composite actions
- ✅ Matrix strategy for parallel publishing
- ✅ No duplicate setup steps
- ✅ Easier to add/remove packages
- ✅ Better error handling and logging

**Flow:**
1. Push to `main` → triggers Release Please
2. Release Please creates/updates release PR
3. Merge release PR → triggers 3 parallel publish jobs:
   - `publish-npm` - Publishes to npm (with build & tests)
   - `publish-jsr` - Publishes to JSR (no build needed)
   - `publish-github` - Publishes to GitHub Packages (with build)

Each job uses a **matrix strategy** to publish multiple packages in parallel if they were released.

### `ci.yml`

Continuous integration workflow (tests, linting, type checking).

### `publish.yml`

Manual workflow for publishing packages (useful for fixing failed releases).

## Benefits of This Architecture

### Before (Original)
- 221 lines of duplicated YAML
- Hard-coded package lists in 4+ places
- 3 identical jobs differing only by registry
- Copy-pasted setup steps (Bun, Node.js, dependencies)
- Adding a package required editing ~20 lines

### After (Refactored)
- ~235 lines with better structure
- Single source of truth ([config/packages.json](./config/packages.json))
- Reusable composite actions
- Matrix strategy for multi-registry publishing
- Adding a package requires editing ~10 lines

### Maintenance

**To add a new package:**
1. Update `config/packages.json`
2. Add matrix entries to `release-please.yml`
3. Update Release Please config files

**To add a new registry:**
1. Add new job to `release-please.yml` (copy existing job)
2. Update `publish-package` composite action to support new registry

**To modify setup steps:**
- Edit the composite action (changes apply everywhere)

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Test release-please workflow (dry-run)
act -n push

# Test CI workflow
bun run ci:test

# List all workflows and jobs
bun run ci:list
```

## Secrets Required

- `NPM_TOKEN` - npm authentication token (for publishing to npm)
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Further Improvements

Future enhancements could include:

1. **Dynamic workflow generation** - Generate workflow from `packages.json` using a script
2. **Publish verification** - Add step to verify published packages are downloadable
3. **Slack notifications** - Notify on successful releases
4. **Rollback workflow** - Automated rollback for failed releases
5. **Package size tracking** - Track and report bundle size changes
6. **Dependency update automation** - Auto-update dependencies with Renovate/Dependabot
