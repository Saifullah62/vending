import bcrypt from 'bcryptjs';

const testHashing = async () => {
    const password = 'password123';
    try {
        console.log('Starting bcrypt test...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
    } catch (error) {
        console.error('Error hashing password:', error);
    }
};

testHashing();
