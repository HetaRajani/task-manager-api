const jwt = require('jsonwebtoken');

// ==========================================
// VIVA TOPIC: JWT Authentication Middleware
// ==========================================
// What the auth middleware verifies:
// 1. Token Presence: Checks that the HTTP "Authorization" header exists and follows the
//    "Bearer <token>" convention.
// 2. Cryptographic Signature: Verifies that the token was signed using the server's private
//    secret (process.env.JWT_SECRET) and has not been tampered with or forged.
// 3. Expiration & Validity: Verifies that the token is within its active lifespan (not expired)
//    and conforms to the valid JWT structure.
// 4. Caller Identity: Attaches the decoded token payload to `req.user`, allowing downstream
//    protected route handlers to safely identify the user without re-checking credentials.
function auth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = auth;
