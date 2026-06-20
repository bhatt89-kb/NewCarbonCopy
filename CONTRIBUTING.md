# Contributing to EcoLens

Thank you for your interest in contributing to EcoLens! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Respecting differing viewpoints
- Accepting constructive criticism
- Focusing on what's best for the community

**Unacceptable behavior includes:**
- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ecolens.git
cd ecolens

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `perf/` - Performance improvements

### 2. Make Changes

- Write clean, readable code
- Follow coding standards (below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build production
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new carbon offset calculator"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Coding Standards

### JavaScript/React

**Style Guide:**
- Use ES6+ features
- Prefer functional components with hooks
- Use descriptive variable names
- Add JSDoc comments for functions

**Example:**
```javascript
/**
 * Calculate carbon footprint from user input
 * @param {Object} input - User input data
 * @returns {Object} Calculated footprint
 */
export function calculateFootprint(input) {
  // Implementation
}
```

### File Organization

```
src/
├── components/       # React components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── constants/       # Constants and config
├── tests/           # Test files
└── engine.js        # Core calculation logic
```

### Component Structure

```javascript
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Component.css';

/**
 * Component description
 */
export default function Component({ prop1, prop2 }) {
  // Hooks
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

Component.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};
```

### CSS Guidelines

- Use CSS variables for theming
- Follow BEM naming convention
- Mobile-first responsive design
- Accessible color contrasts

**Example:**
```css
.component {
  /* Layout */
  display: flex;
  
  /* Spacing */
  padding: 1rem;
  
  /* Colors */
  background: var(--surface);
  color: var(--text);
  
  /* Transitions */
  transition: all 0.3s var(--ease);
}

.component__element {
  /* Element styles */
}

.component--modifier {
  /* Modifier styles */
}
```

---

## Testing Guidelines

### Test Structure

```javascript
import { describe, it, expect } from 'vitest';
import { functionToTest } from './module';

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should do something specific', () => {
      const result = functionToTest(input);
      expect(result).toBe(expected);
    });

    it('should handle edge cases', () => {
      const result = functionToTest(edgeCase);
      expect(result).toBeDefined();
    });
  });
});
```

### What to Test

**Required:**
- All public functions
- Component rendering
- User interactions
- Edge cases
- Error handling

**Not Required:**
- Private/internal functions (test through public API)
- Third-party libraries
- Trivial getters/setters

### Coverage Goals

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Test additions/updates
- `chore` - Build process/tooling changes
- `perf` - Performance improvements

### Examples

**Good:**
```
feat(calculator): add electric car option

Added electric vehicle as a fuel type option with emission
factor of 0.047 kg CO₂e per km based on DEFRA 2023 data.

Closes #123
```

**Bad:**
```
update stuff
```

### Rules

- Use imperative mood ("add" not "added")
- First line ≤ 72 characters
- Capitalize first letter
- No period at the end
- Reference issues when applicable

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No linter errors
- [ ] Documentation updated
- [ ] Self-review completed

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Accessibility checked
```

### Review Process

1. Automated checks must pass (tests, lint)
2. At least one approval required
3. Resolve all comments
4. Squash and merge

---

## Areas for Contribution

### High Priority

- [ ] TypeScript migration
- [ ] Backend API integration
- [ ] User authentication
- [ ] More chart types
- [ ] Carbon offset recommendations

### Medium Priority

- [ ] Additional diet options
- [ ] More transport modes
- [ ] International emission factors
- [ ] Social sharing features
- [ ] Mobile app version

### Low Priority

- [ ] Theme customization
- [ ] Language translations
- [ ] More achievement badges
- [ ] Community features

---

## Questions?

- Check existing issues
- Review documentation
- Ask in discussions
- Contact maintainers

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to EcoLens! 🌱
