import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import { SalesforceAdapter } from './adapters/salesforce';

// Simple in-memory store for demo purposes
// In production, use a proper database
const users = new Map();
const sessions = new Map();
const connections = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use env variable in production

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// User registration
app.post('/api/register', 
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // In production, hash the password
    users.set(email, { email, password, connections: [] });
    
    res.status(201).json({ message: 'User created successfully' });
  }
);

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ email, id: email }, JWT_SECRET, { expiresIn: '24h' });
  sessions.set(token, { email, created: new Date() });
  
  res.json({ token });
});

// Register a new connection
app.post('/api/connections', authenticate, async (req, res) => {
  const { type, credentials } = req.body;
  const userEmail = req.user.email;
  
  if (!type || !credentials) {
    return res.status(400).json({ error: 'Missing connection details' });
  }
  
  const connectionId = `${type}_${Date.now()}`;
  const user = users.get(userEmail);
  
  // Store connection info (encrypt credentials in production)
  connections.set(connectionId, {
    id: connectionId,
    type,
    credentials,
    owner: userEmail
  });
  
  // Update user's connections
  user.connections.push(connectionId);
  
  res.status(201).json({ connectionId });
});

// List user's connections
app.get('/api/connections', authenticate, async (req, res) => {
  const userEmail = req.user.email;
  const user = users.get(userEmail);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const userConnections = user.connections
    .map(id => connections.get(id))
    .filter(conn => conn) // Filter out any deleted connections
    .map(conn => ({
      id: conn.id,
      type: conn.type,
      // Don't return credentials
    }));
  
  res.json(userConnections);
});

// MCP Server endpoint for handling requests
app.post('/api/mcp/:connectionId', authenticate, async (req, res) => {
  const { connectionId } = req.params;
  const userEmail = req.user.email;
  const connection = connections.get(connectionId);
  
  if (!connection) {
    return res.status(404).json({ error: 'Connection not found' });
  }
  
  if (connection.owner !== userEmail) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // MCP message from client
  const mcpMessage = req.body;
  
  try {
    // Route to appropriate adapter based on connection type
    let response;
    if (connection.type === 'salesforce') {
      const salesforceAdapter = new SalesforceAdapter(connection.credentials);
      response = await salesforceAdapter.handleMcpMessage(mcpMessage);
    } else {
      return res.status(400).json({ error: 'Unsupported connection type' });
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error handling MCP message:', error);
    res.status(500).json({ error: 'Failed to process MCP request' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`MCP Service running on port ${PORT}`);
});

export default app;
