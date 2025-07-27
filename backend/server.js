const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://phish-guard-orpin.vercel.app',
  credentials: true
}));
app.use(express.json());

mongoose 
.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err)=>console.log(err))

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Email Schema
const emailSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    isPhishing: {
        type: Boolean,
        required: true
    },
    indicators: [{
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
const Email = mongoose.model('Email', emailSchema);

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({ success: false, error: 'No token provided, authorization denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(403).json({ success: false, error: 'Token is not valid' });
        }
        req.user = userPayload; 
        next();
    });
};

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

       
        const newUser = new User({
            email: email.toLowerCase(),
            password: password
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Error registering user' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const validPassword = await (password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Create JWT Payload
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        // Sign the token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 

        // Optionally update isLoggedIn status if still needed for other purposes
        user.isLoggedIn = true;
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            token: token, 
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'An error occurred while logging in' });
    }
});

// Logout endpoint
// With JWT, logout is primarily handled client-side by deleting the token.
// This endpoint can be used for any server-side cleanup if necessary.
app.post('/api/logout', authenticateToken, async (req, res) => { 
    try {
        // req.user is available here from authenticateToken
        const user = await User.findById(req.user.id);
        if (user) {
            user.isLoggedIn = false; 
            await user.save();
        }
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Error logging out' });
    }
});

// NEW: Analyze Email Endpoint (Mocked) - Protected Route
app.post('/api/analyze-email', authenticateToken, async (req, res) => {
    try {
        const { sender, subject, body } = req.body;
        const userId = req.user.id; // From authenticateToken middleware

        // Basic validation
        if (!sender || !subject || !body) {
            return res.status(400).json({ success: false, error: 'Sender, subject, and body are required.' });
        }

        console.log(`[Mock Analysis] Received for user ${userId}:`);
        console.log(`  Sender: ${sender}`);
        console.log(`  Subject: ${subject}`);
        // console.log(`  Body: ${body}`); // Body can be long, log cautiously

        // --- MOCK RESPONSE ---
        // This is where you would eventually call your Python ML service
        // For now, we return a hardcoded or slightly randomized mock response.

        const isActuallyPhishing = Math.random() > 0.5; // Randomly decide if it's phishing for mock purposes
        let mockIndicators = [];
        if (isActuallyPhishing) {
            mockIndicators = [
                "Urgent language detected (mocked).",
                "Contains a generic greeting (mocked).",
                "Requests sensitive information (mocked)."
            ];
            if (subject.toLowerCase().includes("invoice") || subject.toLowerCase().includes("payment")) {
                mockIndicators.push("Subject line mentions a financial transaction.");
            }
             if (body.toLowerCase().includes("click here") || body.toLowerCase().includes("verify your account")) {
                mockIndicators.push("Body contains suspicious call-to-action phrases.");
            }
        } else {
            mockIndicators = ["Email appears to be a standard communication (mocked)."];
        }

        const mockResult = {
            isPhishing: isActuallyPhishing,
            indicators: mockIndicators,
            score: Math.random(), // Mock confidence score (0.0 to 1.0)
            analyzedAt: new Date().toISOString(),
            // The frontend will use its own formData for 'Submitted Email Details'
        };

        // Simulate a delay as if an ML model was processing
        setTimeout(() => {
            res.status(200).json(mockResult);
        }, 1500); // 1.5 second delay

    } catch (error) {
        console.error('Mock Analyze Email error:', error);
        res.status(500).json({ success: false, error: 'An error occurred during mock analysis.' });
    }
});

// Create Phishing Simulation - Protected Route
app.post('/api/simulations', authenticateToken, async (req, res) => {
    try {
        // req.user is available here from authenticateToken, contains {id, email, role}
        const { sender, subject, body } = req.body;

        if (!sender || !subject || !body) {
            return res.status(400).json({ success: false, error: 'Sender, subject, and body are required' });
        }

        // Analyze the email (using your existing function)
        const indicators = analyzePhishingIndicators(subject, body);
        const isPhishing = indicators.length > 0;

        const simulation = new Email({
            sender,
            subject,
            body,
            isPhishing,
            indicators,
            createdBy: req.user.id 
        });

        await simulation.save();
        res.status(201).json({
            success: true,
            message: 'Simulation created successfully',
            simulation
        });
    } catch (error) {
        console.error('Error creating simulation:', error);
        res.status(500).json({ success: false, error: 'Server error while creating simulation' });
    }
});

// Get User Simulations - Protected Route
app.get('/api/simulations', authenticateToken, async (req, res) => { 
    try {
        // req.user.id is the ID of the authenticated user
        const simulations = await Email.find({ createdBy: req.user.id }).populate('createdBy', 'email');
        res.json({
            success: true,
            simulations
        });
    } catch (error) {
        console.error('Error fetching simulations:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching simulations' });
    }
});

// Analyze Email
app.post('/api/analyze', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper Functions
function analyzePhishingIndicators(subject, body) {
    const indicators = [];
    const phishingKeywords = [
        'urgent', 'verify', 'account', 'suspended', 'login',
        'confirm', 'bank', 'security', 'update', 'password'
    ];

    // Check subject
    const subjectLower = subject.toLowerCase();
    if (phishingKeywords.some(keyword => subjectLower.includes(keyword))) {
        indicators.push('Suspicious subject keywords');
    }

    // Check urgency in subject
    if (subjectLower.includes('urgent') || subjectLower.includes('immediate')) {
        indicators.push('Urgency in subject');
    }

    // Check body
    const bodyLower = body.toLowerCase();
    if (phishingKeywords.some(keyword => bodyLower.includes(keyword))) {
        indicators.push('Suspicious body keywords');
    }

    // Check for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = body.match(urlRegex) || [];
    if (urls.length > 0) {
        indicators.push('Contains URLs');
    }

    // Check for personal information requests
    if (bodyLower.includes('ssn') || bodyLower.includes('credit card') || 
        bodyLower.includes('password')) {
        indicators.push('Requests personal information');
    }

    return indicators;
}

function analyzeSender(sender) {
    // Add sender analysis logic
    return {
        suspicious: false,
        reason: 'Sender analysis not implemented'
    };
}

function analyzeSubject(subject) {
    const subjectLower = subject.toLowerCase();
    const urgencyWords = ['urgent', 'immediate', 'action required', 'important'];
    const hasUrgency = urgencyWords.some(word => subjectLower.includes(word));

    return {
        suspicious: hasUrgency,
        reason: hasUrgency ? 'Contains urgency indicators' : 'No urgency detected'
    };
}

function analyzeBody(body) {
    const bodyLower = body.toLowerCase();
    const suspiciousPatterns = [
        'verify your account',
        'confirm your identity',
        'update your information',
        'click here',
        'login to continue'
    ];

    const matches = suspiciousPatterns.filter(pattern => 
        bodyLower.includes(pattern.toLowerCase())
    );

    return {
        suspicious: matches.length > 0,
        matches,
        reason: matches.length > 0 ? 'Contains suspicious patterns' : 'No suspicious patterns detected'
    };
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
