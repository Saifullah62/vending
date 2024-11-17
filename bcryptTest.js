// Import bcryptjs for hashing passwords
import bcrypt from 'bcryptjs';

const testHashing = async () => {
    const password = 'password123';  // Sample password to hash
    try {
        console.log('Starting bcrypt hashing test...');
        
        // Attempt to hash the password with a salt of 10 rounds
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Log the hashed password to confirm it worked
        console.log('Hashed password:', hashedPassword);
    } catch (error) {
        // If an error occurs during hashing, log the error
        console.error('Error hashing password:', error);
    }
};

// Execute the testHashing function to test bcrypt hashing
testHashing();
