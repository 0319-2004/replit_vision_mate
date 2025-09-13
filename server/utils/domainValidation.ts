/**
 * Domain validation utilities for Aoyama University email restrictions
 */

// Allowed domain patterns for Aoyama University
const ALLOWED_DOMAIN_PATTERNS = [
  /^aoyama\.jp$/i,
  /(^|\.)aoyama\.ac\.jp$/i,
];

/**
 * Validates if an email domain is allowed for Aoyama University users
 * @param email - The email address to validate
 * @returns boolean - true if domain is allowed, false otherwise
 */
export function isAllowedDomain(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return false;
  }

  // Check against allowed patterns
  return ALLOWED_DOMAIN_PATTERNS.some(pattern => pattern.test(domain));
}

/**
 * Gets a user-friendly error message for domain validation failures
 * @returns string - Error message in Japanese and English
 */
export function getDomainErrorMessage(): string {
  return 'このアプリケーションは青山学院大学のメールアドレス(@aoyama.ac.jp または @aoyama.jp)でのみご利用いただけます。\n\nThis application is only available for Aoyama Gakuin University email addresses (@aoyama.ac.jp or @aoyama.jp).';
}

/**
 * Middleware to validate domain restrictions
 */
export function validateDomainMiddleware(req: any, res: any, next: any) {
  const user = req.user as any;
  
  if (!user || !user.claims?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!isAllowedDomain(user.claims.email)) {
    return res.status(403).json({ 
      message: getDomainErrorMessage(),
      code: 'DOMAIN_NOT_ALLOWED'
    });
  }

  next();
}