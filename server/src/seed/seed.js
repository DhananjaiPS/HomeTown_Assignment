const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Article = require('../models/Article');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Activity = require('../models/Activity');

// Use relative path for env if run directly, or normal if run from scripts
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-ai-lms');
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n👉 It looks like MongoDB is not running locally on port 27017.');
      console.error('👉 Please start your local MongoDB server OR update the MONGO_URI in .env with a valid MongoDB Atlas connection string.\n');
    }
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    console.log('Clearing old data...');
    await User.deleteMany();
    await Article.deleteMany();
    await Assignment.deleteMany();
    await Submission.deleteMany();
    await Activity.deleteMany();

    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@lms.com',
      passwordHash: 'Admin@123', // Will be hashed by pre-save hook
      role: 'admin'
    });

    const user1 = await User.create({
      name: 'Learner One',
      email: 'user@lms.com',
      passwordHash: 'User@123',
      role: 'learner'
    });

    const user2 = await User.create({
      name: 'Learner Two',
      email: 'user2@lms.com',
      passwordHash: 'User@123',
      role: 'learner'
    });

    console.log('Creating articles...');
    const articles = await Article.insertMany([
      {
        title: 'Introduction to Artificial Intelligence',
        slug: 'intro-to-ai',
        content: 'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions...',
        tags: ['AI', 'Basics'],
        difficulty: 'beginner',
        status: 'published',
        createdBy: admin._id,
        readingTimeMinutes: 3
      },
      {
        title: 'Understanding Machine Learning',
        slug: 'understanding-ml',
        content: 'Machine learning is a subset of AI that focuses on building systems that learn—or improve performance—based on the data they consume...',
        tags: ['ML', 'Data'],
        difficulty: 'intermediate',
        status: 'published',
        createdBy: admin._id,
        readingTimeMinutes: 5
      }
    ]);

    console.log('Creating assignments...');
    const assignments = await Assignment.insertMany([
      {
        articleId: articles[0]._id,
        title: 'AI Basics Quiz',
        instructions: 'Answer the following questions based on the introduction to AI article.',
        totalMarks: 20,
        questions: [
          {
            questionText: 'What does AI stand for?',
            type: 'mcq',
            options: [
              { label: 'A', text: 'Artificial Intelligence', isCorrect: true },
              { label: 'B', text: 'Automated Inference', isCorrect: false },
              { label: 'C', text: 'Advanced Integration', isCorrect: false }
            ],
            marks: 10,
            difficulty: 'easy'
          },
          {
            questionText: 'Explain the main goal of AI in one sentence.',
            type: 'short_answer',
            expectedAnswer: 'To simulate human intelligence in machines to perform tasks.',
            rubric: 'Must mention simulating human intelligence or mimicking human actions.',
            marks: 10,
            difficulty: 'medium'
          }
        ]
      },
      {
        articleId: articles[1]._id,
        title: 'Machine Learning Concepts',
        instructions: 'Test your knowledge on Machine Learning.',
        totalMarks: 10,
        questions: [
          {
            questionText: 'Machine learning systems improve performance based on what?',
            type: 'mcq',
            options: [
              { label: 'A', text: 'Random guessing', isCorrect: false },
              { label: 'B', text: 'Data they consume', isCorrect: true },
              { label: 'C', text: 'Hardware upgrades', isCorrect: false }
            ],
            marks: 10,
            difficulty: 'easy'
          }
        ]
      }
    ]);

    console.log('Seeding successful!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
