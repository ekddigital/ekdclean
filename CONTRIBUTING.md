# Contributing to EKD Clean

Thank you for your interest in contributing to EKD Clean! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and considerate of others
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ekdclean.git
   cd ekdclean
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/ekddigital/ekdclean.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   cd packages/renderer && npm install && cd ../..
   ```

5. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Environment

```bash
# Start with hot-reload
npm run dev

# Or use the convenience script
./start.sh
```

### Building

```bash
# Build for development
npm run build

# Build for production
npm run package
```

### Code Quality

Before committing, ensure your code passes all checks:

```bash
# Lint your code
npm run lint

# Format your code
npm run format

# Type check
cd packages/renderer && npm run type-check
```

## Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new files
- Follow the existing code style (enforced by ESLint and Prettier)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer `const` over `let`, avoid `var`

### React Components

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props
- Follow the component structure:
  ```tsx
  // 1. Imports
  // 2. Types/Interfaces
  // 3. Component definition
  // 4. Styles (if inline)
  ```

### File Organization

- Place components in `packages/renderer/src/components/`
- Place shared types in `packages/shared/src/types.ts`
- Place utilities in appropriate `utils/` directories
- Keep related files together

### Naming Conventions

- **Components**: PascalCase (e.g., `MainDashboard.tsx`)
- **Files**: camelCase or kebab-case (e.g., `utils.ts`, `scan-engine.ts`)
- **Functions**: camelCase (e.g., `handleScan`, `formatBytes`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Interfaces/Types**: PascalCase (e.g., `ScanResult`, `UserSettings`)

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

### Examples

```bash
feat(scanner): add duplicate file detection

Implement advanced duplicate file finder using hash-based comparison.
Supports multiple hash algorithms and configurable matching criteria.

Closes #123
```

```bash
fix(ui): resolve dark mode toggle state persistence

Fixed issue where dark mode preference wasn't saved across sessions.
Updated localStorage handling and added migration for existing users.

Fixes #456
```

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** if applicable
3. **Ensure all tests pass** and code is formatted
4. **Update the CHANGELOG** if applicable
5. **Create a pull request** with a clear title and description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Windows
- [ ] Tested on macOS
- [ ] Tested on Linux
- [ ] Added/updated tests

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #(issue number)
```

## Testing

### Manual Testing

Test your changes on your target platform:

1. **Build the application**: `npm run build`
2. **Run the application**: `npm start`
3. **Test the affected features**
4. **Check for console errors**
5. **Verify UI/UX changes**

### Platform-Specific Testing

When making changes that affect specific platforms:

- **Windows**: Test file system operations, registry access
- **macOS**: Test with System Integrity Protection enabled
- **Linux**: Test on multiple distributions if possible

### Performance Testing

For performance-critical changes:

- Test with large datasets (thousands of files)
- Monitor memory usage during scans
- Check CPU utilization
- Verify UI remains responsive

## Documentation

### Code Documentation

- Add JSDoc comments for exported functions and classes
- Include parameter descriptions and return types
- Provide usage examples for complex APIs

```typescript
/**
 * Scans the file system for junk files
 * @param options - Scan configuration options
 * @returns Promise resolving to scan results
 * @example
 * ```ts
 * const results = await scanForJunkFiles({ deep: true });
 * ```
 */
export async function scanForJunkFiles(options: ScanOptions): Promise<ScanResult[]> {
  // Implementation
}
```

### README Updates

Update the README.md when:

- Adding new features
- Changing installation/build process
- Adding new dependencies
- Modifying project structure

### API Documentation

For changes to IPC or native modules:

- Document the API endpoints
- Specify parameter types
- Describe return values
- Include error handling

## Questions?

If you have questions or need help:

- Open an issue with the `question` label
- Check existing issues and documentation
- Reach out to maintainers

## Recognition

Contributors will be recognized in:

- The project README (for significant contributions)
- Release notes
- GitHub contributors page

Thank you for contributing to EKD Clean! 🎉
