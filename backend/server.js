const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors({
  origin: 'https://phish-guard-orpin.vercel.app',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isLoggedIn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const emailSchema = new mongoose.Schema({
  sender: String,
  subject: String,
  body: String,
  isPhishing: Boolean,
  indicators: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Email = mongoose.model('Email', emailSchema);

// Register (no hashing)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, error: 'User already exists' });

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login (plain-text password match)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password)
      return res.status(401).json({ success: false, error: 'Invalid credentials' });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Analyze Email (basic check)
app.post('/api/analyze', (req, res) => {
  const { sender, subject, body } = req.body;
  const indicators = analyzePhishingIndicators(subject, body);
  const isPhishing = indicators.length > 0;

  res.json({
    isPhishing,
    indicators,
    analysis: {
      sender: analyzeSender(sender),
      subject: analyzeSubject(subject),
      body: analyzeBody(body)
    }
  });
});

// Create Simulation
app.post('/api/simulations', async (req, res) => {
  try {
    const { sender, subject, body, userId } = req.body;

    if (!sender || !subject || !body || !userId)
      return res.status(400).json({ success: false, error: 'Missing fields' });

    const indicators = analyzePhishingIndicators(subject, body);
    const isPhishing = indicators.length > 0;

    const simulation = new Email({ sender, subject, body, isPhishing, indicators, createdBy: userId });
    await simulation.save();

    res.status(201).json({ success: true, message: 'Simulation saved', simulation });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Simulation failed' });
  }
});

// Get All Simulations for a User
app.get('/api/simulations/:userId', async (req, res) => {
  try {
    const simulations = await Email.find({ createdBy: req.params.userId }).populate('createdBy', 'email');
    res.json({ success: true, simulations });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch simulations' });
  }
});

// --- Phishing Detection Logic ---
function analyzePhishingIndicators(subject, body) {
  const indicators = [];
  const keywords = ['urgent', 'verify', 'account', 'suspended', 'login', 'confirm', 'bank', 'security', 'update', 'password'];

  if (keywords.some(k => subject.toLowerCase().includes(k))) indicators.push('Suspicious subject');
  if (subject.toLowerCase().includes('urgent')) indicators.push('Urgency in subject');
  if (keywords.some(k => body.toLowerCase().includes(k))) indicators.push('Suspicious content');
  if ((body.match(/https?:\/\/[^\s]+/g) || []).length > 0) indicators.push('Contains URL');
  if (body.toLowerCase().includes('credit card') || body.toLowerCase().includes('ssn')) indicators.push('Requests sensitive data');

  return indicators;
}

function analyzeSender(sender) {
  return { suspicious: false, reason: 'Basic sender check not implemented' };
}

function analyzeSubject(subject) {
  const suspiciousWords = ['urgent', 'immediate', 'verify'];
  const suspicious = suspiciousWords.some(w => subject.toLowerCase().includes(w));
  return { suspicious, reason: suspicious ? 'Urgent wording in subject' : 'No urgency detected' };
}

function analyzeBody(body) {
  const patterns = ['click here', 'verify your account', 'login now'];
  const suspicious = patterns.some(p => body.toLowerCase().includes(p));
  return { suspicious, reason: suspicious ? 'Suspicious call-to-action' : 'Clean body text' };
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
