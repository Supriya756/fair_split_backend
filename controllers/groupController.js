const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Group name and creator ID are required' });
    }

    // Verify creator exists
    const creator = await User.findById(createdBy);
    if (!creator) {
      return res.status(404).json({ error: 'Creator user not found' });
    }

    const group = new Group({
      name,
      description,
      createdBy,
      members: [createdBy] // Add creator as the first member automatically
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user to add by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ error: `User with email ${email} not found` });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is already a member
    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    group.members.push(userToAdd._id);
    await group.save();

    const updatedGroup = await Group.findById(id).populate('members', 'name email');
    res.status(200).json({ message: 'Member added successfully', group: updatedGroup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
