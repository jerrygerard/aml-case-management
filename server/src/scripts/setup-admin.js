const User = require('../models/User');
const bcrypt = require('bcrypt');

async function setupAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findByEmail('admin@example.com');
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      department: 'Administration',
      is_active: true
    });

    console.log('Admin user created successfully with ID:', admin.id);
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

setupAdmin(); 