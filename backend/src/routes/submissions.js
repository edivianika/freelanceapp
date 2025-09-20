const express = require('express');
const multer = require('multer');
const { supabaseAdmin } = require('../../lib/supabase');
const { authenticateToken, requireMarketer } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Get user's submissions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, date_from, date_to, search } = req.query;
    
    let query = supabaseAdmin
      .from('submissions')
      .select(`
        *,
        user:users(*),
        files:submission_files(*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%,project_interest.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create submission
router.post('/', authenticateToken, requireMarketer, async (req, res) => {
  try {
    const { name, phone_number, project_interest, notes } = req.body;

    // Validate required fields
    if (!name || !phone_number || !project_interest) {
      return res.status(400).json({ error: 'Name, phone number, and project interest are required' });
    }

    // Check if submission with same phone number already exists
    const { data: existingSubmissions, error: checkError } = await supabaseAdmin
      .from('submissions')
      .select('id, status, duplicate_count, user_id')
      .eq('phone_number', phone_number)
      .order('created_at', { ascending: true });

    if (checkError) {
      console.error('Error checking existing submissions:', checkError);
      return res.status(500).json({ error: 'Failed to check existing submissions' });
    }

    // If data exists and is owned by current user, block submission
    const ownedByCurrentUser = existingSubmissions?.find(sub => 
      sub.user_id === req.user.id && (sub.status === 'own' || sub.status === 'owned')
    );
    
    if (ownedByCurrentUser) {
      return res.status(400).json({ 
        error: 'Data dengan nomor telepon ini sudah Anda miliki dan berstatus "Owned". Tidak dapat menambah data yang sama lagi.' 
      });
    }

    // If data exists but owned by different user, allow as duplicate
    if (existingSubmissions && existingSubmissions.length > 0) {
      // Find the original submission (first one created)
      const originalSubmission = existingSubmissions[0];
      
      // Calculate next duplicate count
      const maxDuplicateCount = Math.max(...existingSubmissions.map(sub => sub.duplicate_count || 1));
      const nextDuplicateCount = maxDuplicateCount + 1;

      // Create duplicate submission
      const { data: submission, error } = await supabaseAdmin
        .from('submissions')
        .insert({
          user_id: req.user.id,
          name,
          phone_number,
          project_interest,
          notes,
          status: 'duplicate',
          duplicate_count: nextDuplicateCount,
          original_submission_id: originalSubmission.id
        })
        .select(`
          *,
          user:users(*),
          original_submission:submissions!original_submission_id(*)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json(submission);
    }

    // If no existing data, create as original submission
    const { data: submission, error } = await supabaseAdmin
      .from('submissions')
      .insert({
        user_id: req.user.id,
        name,
        phone_number,
        project_interest,
        notes,
        status: 'owned',
        duplicate_count: 1
      })
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(submission);
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update submission
router.put('/:id', authenticateToken, requireMarketer, async (req, res) => {
  try {
    const { id } = req.params;
    const { follow_up_status } = req.body;

    // Validate that user owns this submission
    const { data: existingSubmission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingSubmission) {
      return res.status(404).json({ error: 'Submission not found or access denied' });
    }

    // Update submission
    const { data: submission, error } = await supabaseAdmin
      .from('submissions')
      .update({ follow_up_status })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select(`
        *,
        user:users(*),
        files:submission_files(*)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(submission);
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload files for submission
router.post('/:id/files', authenticateToken, requireMarketer, upload.array('files', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Validate that user owns this submission
    const { data: existingSubmission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingSubmission) {
      return res.status(404).json({ error: 'Submission not found or access denied' });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('submission-files')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('submission-files')
        .getPublicUrl(fileName);

      // Save file record to database
      const { data: fileRecord, error: dbError } = await supabaseAdmin
        .from('submission_files')
        .insert({
          submission_id: id,
          file_url: publicUrl,
          file_name: file.originalname,
          file_size: file.size,
          mime_type: file.mimetype
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        continue;
      }

      uploadedFiles.push(fileRecord);
    }

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hot leads
router.get('/hot-leads', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select(`
        *,
        user:users(*),
        files:submission_files(*)
      `)
      .eq('is_hot_lead', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get hot leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get submission stats for marketer
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Stats endpoint - User ID:', userId);

    // Single optimized query to get all data at once
    const { data: submissions, error } = await supabaseAdmin
      .from('submissions')
      .select('id, status, is_hot_lead, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions data:', error);
      return res.status(500).json({ error: 'Failed to fetch submissions data' });
    }

    // Calculate stats from single query result
    const totalSubmissions = submissions.length;
    
    // Count by status
    const statusCounts = submissions.reduce((acc, submission) => {
      acc[submission.status] = (acc[submission.status] || 0) + 1;
      return acc;
    }, {});

    // Count hot leads
    const hotLeadsCount = submissions.filter(s => s.is_hot_lead).length;

    // Count recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubmissions = submissions.filter(s => 
      new Date(s.created_at) >= sevenDaysAgo
    ).length;

    const stats = {
      total_submissions: totalSubmissions,
      valid_submissions: statusCounts.own || 0,
      duplicate_submissions: statusCounts.duplicate || 0,
      expired_submissions: statusCounts.expired || 0,
      hot_leads: statusCounts.hot_lead || 0,
      total_marketers: 1 // Marketer stats only show their own data
    };

    res.json(stats);
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
