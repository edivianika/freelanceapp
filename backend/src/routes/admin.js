const express = require('express');
const { supabaseAdmin } = require('../../lib/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all submissions (admin only)
router.get('/submissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, marketer_id, date_from, date_to, search } = req.query;
    
    let query = supabaseAdmin
      .from('submissions')
      .select(`
        *,
        user:users(*),
        files:submission_files(*)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (marketer_id) {
      query = query.eq('user_id', marketer_id);
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
    console.error('Get all submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all marketers
router.get('/marketers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone, role, created_at, updated_at')
      .eq('role', 'marketer')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get marketers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create marketer
router.post('/marketers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create marketer
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        phone,
        password_hash: hashedPassword,
        role: 'marketer'
      })
      .select('id, name, email, phone, role, created_at, updated_at')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error('Create marketer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update marketer
router.put('/marketers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ name, email, phone })
      .eq('id', id)
      .eq('role', 'marketer')
      .select('id, name, email, phone, role, created_at, updated_at')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!user) {
      return res.status(404).json({ error: 'Marketer not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update marketer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete marketer
router.delete('/marketers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'marketer');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Marketer deleted successfully' });
  } catch (error) {
    console.error('Delete marketer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Override submission ownership
router.post('/override-ownership', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { submission_id, new_owner_id, reason } = req.body;

    // Validate required fields
    if (!submission_id || !new_owner_id || !reason) {
      return res.status(400).json({ error: 'Submission ID, new owner ID, and reason are required' });
    }

    // Get current submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('id, user_id')
      .eq('id', submission_id)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Verify new owner exists and is a marketer
    const { data: newOwner, error: ownerError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', new_owner_id)
      .eq('role', 'marketer')
      .single();

    if (ownerError || !newOwner) {
      return res.status(404).json({ error: 'New owner not found or not a marketer' });
    }

    // Update submission ownership
    const { data: updatedSubmission, error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({ 
        user_id: new_owner_id,
        status: 'own',
        ownership_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })
      .eq('id', submission_id)
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Log the override
    const { error: logError } = await supabaseAdmin
      .from('override_logs')
      .insert({
        admin_id: req.user.id,
        submission_id,
        old_owner_id: submission.user_id,
        new_owner_id,
        reason
      });

    if (logError) {
      console.error('Log override error:', logError);
      // Don't fail the request if logging fails
    }

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Override ownership error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get override logs
router.get('/override-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('override_logs')
      .select(`
        *,
        admin:users!override_logs_admin_id_fkey(*),
        old_owner:users!override_logs_old_owner_id_fkey(*),
        new_owner:users!override_logs_new_owner_id_fkey(*),
        submission:submissions(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get override logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get submission counts
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select('status');

    if (submissionsError) {
      return res.status(400).json({ error: submissionsError.message });
    }

    // Get marketer count
    const { data: marketers, error: marketersError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'marketer');

    if (marketersError) {
      return res.status(400).json({ error: marketersError.message });
    }

    // Calculate statistics
    const stats = submissions?.reduce((acc, submission) => {
      acc.total_submissions++;
      
      switch (submission.status) {
        case 'own':
          acc.valid_submissions++;
          break;
        case 'duplicate':
          acc.duplicate_submissions++;
          break;
        case 'expired':
          acc.expired_submissions++;
          break;
        case 'hot_lead':
          acc.hot_leads++;
          break;
      }
      
      return acc;
    }, {
      total_submissions: 0,
      valid_submissions: 0,
      duplicate_submissions: 0,
      hot_leads: 0,
      expired_submissions: 0,
      total_marketers: marketers?.length || 0
    });

    res.json(stats || {
      total_submissions: 0,
      valid_submissions: 0,
      duplicate_submissions: 0,
      hot_leads: 0,
      expired_submissions: 0,
      total_marketers: 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


