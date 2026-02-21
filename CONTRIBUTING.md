# Contributing to nestjs-backend-common

## Automated Version Bumping

**⚠️ Important: Manual version bumps are NOT allowed!**

Versions are automatically bumped based on [Conventional Commit](https://www.conventionalcommits.org/) messages. When you push commits to the `main` branch, the CI/CD pipeline analyzes your commit messages and automatically:

1. Determines the appropriate version bump
2. Updates `package.json`
3. Creates a git tag
4. Publishes to NPM (if tests pass)

### Commit Types and Version Bumps

| Commit Type                                       | Version Bump              | Example                    |
| ------------------------------------------------- | ------------------------- | -------------------------- |
| `fix:`                                            | **PATCH** (1.1.0 → 1.1.1) | Bug fixes                  |
| `feat:`                                           | **MINOR** (1.1.0 → 1.2.0) | New features               |
| `feat!:` or `BREAKING CHANGE:`                    | **MAJOR** (1.1.0 → 2.0.0) | Breaking changes           |
| `docs:`, `chore:`, `style:`, `refactor:`, `test:` | **No bump**               | Documentation, maintenance |

<details><summary>Some examples</summary>
<table>
  <thead>
    <tr>
      <th>Commit Message</th>
      <th>Description</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>git commit -m "fix: correct correlation ID header handling"</code></td>
      <td>Patch Release (Bug Fix)</td>
      <td><code>1.1.0</code> → <code>1.1.1</code></td>
    </tr>
    <tr>
      <td><code>git commit -m "feat: add new email validation decorator"</code></td>
      <td>Minor Release (New Feature)</td>
      <td><code>1.1.0</code> → <code>1.2.0</code></td>
    </tr>
    <tr>
      <td><code>git commit -m "feat!: change logger interface signature"</code></td>
      <td rowspan="2">Major Release (Breaking Change)</td>
      <td rowspan="2"><code>1.1.0</code> → <code>2.0.0</code></td>
    </tr>
    <tr>
      <td><pre><code>git commit -m "feat: redesign configuration module

BREAKING CHANGE: Configuration now requires explicit initialization call"</code></pre></td>

</tr>

  </tbody>
</table>
</details>

### No Release (Maintenance)

```bash
git commit -m "chore: update dependencies"
git commit -m "docs: fix typo in README"
git commit -m "test: add more test cases"
```

Result: No version change

## Multiple Commits

If you push multiple commits at once, the **highest** version bump will be applied:

```bash
git commit -m "fix: correct validation logic"
git commit -m "feat: add new utility function"
git commit -m "chore: update documentation"
git push
```

Result: `1.1.0` → `1.2.0` (minor bump from `feat:` takes precedence)

## Best Practices

1. **Write descriptive commit messages** that clearly explain what changed.
2. **Use the correct commit type** to ensure proper version bumping.
3. **Group related changes** in a single commit when possible.
4. **Test locally** before pushing to avoid failed CI runs.
5. **Use `BREAKING CHANGE:`** in the commit body or `!` after type for breaking changes.

## Questions?

If you have questions about the versioning system, please open an issue in the repository.
