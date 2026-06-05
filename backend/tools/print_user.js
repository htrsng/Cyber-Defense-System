require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
}

(async () => {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        const email = process.argv[2] || 'admin@cyberdef.io';
        const user = await User.findOne({ email }).lean();
        console.log(user ? { email: user.email, password: user.password, role: user.role } : 'User not found');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message || err);
        process.exit(1);
    }
})();
