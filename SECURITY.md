# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in Receta, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **[Your security email here]**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (optional)

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
2. **Investigation**: We will investigate and validate the reported vulnerability.
3. **Updates**: We will keep you informed about the progress of fixing the issue.
4. **Resolution**: Once fixed, we will release a security patch and publicly disclose the vulnerability (with credit to you, if desired).

### Security Best Practices

When using Receta:

1. **Keep dependencies updated**: Regularly update Receta and Remeda to the latest versions.
2. **Validate user input**: Always validate and sanitize user input, especially when using `string` utilities like `template` or `escapeHtml`.
3. **Use Result types**: Leverage `Result<T, E>` for error handling to avoid uncaught exceptions.
4. **Review async operations**: Be mindful of concurrency limits and timeout settings in production.

### Known Security Considerations

- **HTML escaping**: The `escapeHtml` function in the `string` module provides basic XSS protection. For complex scenarios, consider using a dedicated library like DOMPurify.
- **Template strings**: The `template` function performs simple interpolation. Always sanitize user input before passing to templates.
- **Regular expressions**: When using `matches` or `escapeRegex`, be aware of ReDoS (Regular Expression Denial of Service) risks with complex patterns.

## Attribution

We appreciate security researchers who help us keep Receta secure. We will publicly acknowledge your contribution (with your permission) in:
- The security advisory
- The CHANGELOG.md file
- The project README (Security Hall of Fame section)

Thank you for helping keep Receta and its users safe!
