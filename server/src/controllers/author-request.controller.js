const AuthorRequest = require('../models/AuthorRequest');
const User = require('../models/User');

// Learner: Request Author Access
exports.createRequest = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Bad Request: No body received. Check your JSON headers.' });
    }
    let { message } = req.body;

    // 1. Validate input & sanitize
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        field: 'message',
        message: 'Validation Error: Message must be at least 10 characters long.'
      });
    }

    message = message.replace(/\s+/g, ' ').trim();

    // 2. Check user session
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Auth Error: No user session found.'
      });
    }

    // 3. Check existing role
    if (req.user.role === 'author' || req.user.role === 'admin') {
      return res.status(400).json({ 
        success: false, 
        message: `Role Error: User is already ${req.user.role}.` 
      });
    }

    // 4. Prevent duplicate pending requests
    const existingRequest = await AuthorRequest.findOne({ 
      user: req.user._id, 
      status: 'pending' 
    });

    if (existingRequest) {
      console.log(`Duplicate request found for user ${req.user._id}:`, existingRequest._id);
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate Error: You already have a pending request.' 
      });
    }

    // 5. Create request
    const newRequest = new AuthorRequest({
      user: req.user._id,
      message
    });

    const savedRequest = await newRequest.save();
    console.log(`New author request saved: ${savedRequest._id} for user ${req.user._id}`);

    return res.status(201).json({
      success: true,
      message: 'Request submitted successfully!',
      data: savedRequest
    });

  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error while processing request.' 
    });
  }
};

// Learner: Check Request Status
exports.getMyRequest = async (req, res) => {
  try {
    const request = await AuthorRequest.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .exec();
    
    res.status(200).json({ success: true, data: request || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching request status' });
  }
};

// Admin: Get All Requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await AuthorRequest.find()
      .populate('user', 'name email stats badges')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: requests.length,
      data: requests 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching author requests' });
  }
};

// Admin: Approve/Reject Request
exports.updateRequest = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const request = await AuthorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    request.adminNote = adminNote;
    request.reviewedAt = Date.now();
    await request.save();

    if (status === 'approved') {
      const user = await User.findById(request.user);
      if (user) {
        user.role = 'author';
        await user.save();
      }
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
