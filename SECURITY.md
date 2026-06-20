# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Measures

### Client-Side Security

EcoLens implements multiple layers of security:

#### 1. Input Validation
- **Numeric Inputs**: Bounded and sanitized (min/max values)
- **String Inputs**: Length limits and character filtering
- **Enum Validation**: Whitelist-based selection validation
- **Date Validation**: Range checks and format verification

#### 2. Browser Security Headers
```html
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [configured]
```

#### 3. Content Security Policy
- `default-src 'self'` - Only load resources from same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Required for React dev mode
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src 'self' https://fonts.gstatic.com`
- `img-src 'self' data: https:`
- `connect-src 'self'`

#### 4. Data Protection
- **No Server Transmission**: All data stored client-side only
- **localStorage Quota Management**: Prevents storage overflow
- **Secure ID Generation**: Uses crypto.randomUUID when available
- **Error Handling**: Graceful degradation for storage failures

#### 5. XSS Prevention
- Input sanitization removes dangerous characters
- React's built-in XSS protection
- No `dangerouslySetInnerHTML` usage
- Proper escaping in all user content

### Known Limitations

#### Development vs Production
- **Dev Mode**: CSP allows `unsafe-inline` and `unsafe-eval` for hot reload
- **Production**: Should tighten CSP in production deployment

#### Browser Storage
- Data stored in localStorage is accessible to XSS attacks
- No sensitive personal information is stored
- Users should clear localStorage when using shared devices

#### Third-Party Dependencies
- Fonts loaded from Google Fonts CDN
- Recharts library for visualization
- All dependencies audited regularly

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns to project maintainers
3. Include detailed steps to reproduce
4. Allow reasonable time for fix before disclosure

### What to Report
- XSS vulnerabilities
- Input validation bypasses
- LocalStorage manipulation attacks
- CSP policy bypasses
- Dependency vulnerabilities

### What NOT to Report
- Issues already covered in "Known Limitations"
- Social engineering attacks
- Physical access to user device

## Security Best Practices for Users

1. **Use Updated Browsers**: Ensure browser supports modern security features
2. **Clear Storage**: Use incognito mode or clear localStorage on shared devices
3. **Verify URL**: Only use official deployment URLs
4. **Report Issues**: Report suspicious behavior immediately

## Security Checklist

- [x] Input validation and sanitization
- [x] Content Security Policy headers
- [x] XSS protection measures
- [x] Secure ID generation
- [x] Error handling for storage
- [x] No sensitive data transmission
- [x] HTTPS enforced (deployment)
- [x] Dependency audit (npm audit)
- [x] Regular security updates

## Dependency Security

```bash
# Run security audit
npm audit

# Fix automatically fixable issues
npm audit fix

# Check for outdated packages
npm outdated
```

## Updates

Security patches will be released as needed. Check releases for security updates.

---

Last Updated: 2026-06-20
