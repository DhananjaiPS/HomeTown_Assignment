const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const natural = require('natural');
const PredefinedQA = require('../src/models/PredefinedQA');

dotenv.config({ path: path.join(__dirname, '../.env') });

const tokenizer = new natural.WordTokenizer();

const normalizeString = (str = '') => {
  const lower = str.toLowerCase();

  const cleaned = lower
    .replace(/[^\w\s]/g, ' ')
    .replace(/\b(tell me about|explain|what is|what are|define|meaning of|mujhe batao|kya hai)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = tokenizer.tokenize(cleaned);
  return tokens.join(' ');
};

const predefinedQuestions = [
  // PLATFORM SPECIFIC
  {
    intent: 'platform_intro',
    q: 'what is mini ai lms',
    patterns: [
      'what is mini ai lms',
      'what is this website',
      'ye website kya hai',
      'explain this platform',
      'what is my website'
    ],
    a: 'Mini AI LMS ek AI-powered Learning Management System hai jahan learners articles read kar sakte hain, assignments attempt kar sakte hain, AI hints le sakte hain, article summaries generate kar sakte hain, aur real-time leaderboard par apni performance track kar sakte hain. Iska goal learning ko interactive, measurable aur AI-assisted banana hai.',
    category: 'LMS',
    difficulty: 'beginner'
  },
  {
    intent: 'platform_features',
    q: 'what can this platform do',
    patterns: [
      'what can this platform do',
      'features kya hai',
      'what are the features',
      'platform me kya kya hai',
      'kya kar sakte ho'
    ],
    a: 'Mini AI LMS ke main features hain: learner/admin dashboards, article reading, assignments, AI article summarization, AI hints, subjective answer grading, real-time leaderboard, badges, token quota tracking, caching, and secure JWT-based authentication. Ye platform normal LMS se better hai because AI learning support directly integrated hai.',
    category: 'LMS',
    difficulty: 'beginner'
  },
  {
    intent: 'tech_stack',
    q: 'tech stack kya hai',
    patterns: [
      'tech stack kya hai',
      'which technologies used',
      'frontend backend kya use hua',
      'project kis tech par bana hai'
    ],
    a: 'Is project ka frontend React, Vite, Tailwind CSS, TanStack Query, Axios, React Router aur Socket.IO Client se bana hai. Backend Node.js, Express, MongoDB Atlas, Mongoose aur Socket.IO use karta hai. AI ke liye Google Gemini API integrated hai. Security ke liye JWT, bcrypt, Helmet, express-rate-limit aur Zod validation use hua hai.',
    category: 'LMS',
    difficulty: 'beginner'
  },
  {
    intent: 'ai_features',
    q: 'ai features explain karo',
    patterns: [
      'ai features explain karo',
      'ai tools kya hai',
      'ai kya karta hai',
      'gemini ka use kaha hai'
    ],
    a: 'AI tools ka use article summarization, question hints, aur subjective answer grading ke liye hota hai. Example: agar learner ko article samajhna hai toh AI summary de sakta hai; agar question difficult hai toh AI hint de sakta hai; aur subjective answer me AI answer evaluate karke feedback de sakta hai.',
    category: 'LMS',
    difficulty: 'beginner'
  },
  {
    intent: 'ai_optimization',
    q: 'token kaise save hote hain',
    patterns: [
      'token kaise save hote hain',
      'gemini api cost kaise reduce hoti hai',
      'tf idf kya use hai',
      'ai optimization kya hai'
    ],
    a: 'Mini AI LMS me AI Optimization Engine hai jo natural library ke TF-IDF based local sentence extraction ka use karta hai. Iska matlab hai ki Gemini ko pura large article bhejne ke bajay sirf important sentences/context bheja jata hai. Isse token usage kam hota hai, response faster hota hai, aur API cost reduce hoti hai.',
    category: 'LMS',
    difficulty: 'intermediate'
  },
  {
    intent: 'leaderboard_logic',
    q: 'leaderboard rank kaise calculate hoti hai',
    patterns: [
      'leaderboard rank kaise calculate hoti hai',
      'leaderboard kya hai',
      'rank kaise calculate hoti hai',
      'final rank score kya hai',
      'leaderboard logic explain karo'
    ],
    a: 'Leaderboard learners ko performance ke basis par rank karta hai. Rank MongoDB aggregation pipeline se calculate hoti hai. Formula hai: finalRankScore = scorePercentage * 0.7 + completionRate * 0.3. Iska matlab score ko 70% weightage aur completion/activity ko 30% weightage milti hai.',
    category: 'Leaderboard',
    difficulty: 'intermediate'
  },
  {
    intent: 'real_time_leaderboard',
    q: 'real time leaderboard kya hai',
    patterns: [
      'real time leaderboard kya hai',
      'leaderboard live update hota hai',
      'socket io ka use kaha hai'
    ],
    a: 'Haan, leaderboard real-time update hota hai using Socket.IO. Jab koi learner assignment submit karta hai, backend score update karta hai aur Socket.IO ke through connected clients ko updated leaderboard data mil sakta hai. Isse refresh ke bina rank update ho sakti hai.',
    category: 'Leaderboard',
    difficulty: 'beginner'
  },
  {
    intent: 'demo_credentials',
    q: 'demo credentials',
    patterns: [
      'demo credentials',
      'demo login kya hai',
      'admin password kya hai',
      'learner credentials',
      'test user login'
    ],
    a: 'Demo credentials: Admin login ke liye admin@lms.com / Admin@123, aur Learner login ke liye user@lms.com / User@123. Inhe local seeded database ke baad testing ke liye use kar sakte ho.',
    category: 'LMS',
    difficulty: 'beginner'
  },
  {
    intent: 'local_setup',
    q: 'how to run locally',
    patterns: [
      'how to run locally',
      'project locally kaise run kare',
      'setup kaise kare',
      'run locally',
      'local installation steps'
    ],
    a: 'Project locally run karne ke liye pehle server aur client folders me dependencies install karo. Server me .env file banao, MongoDB URI aur Gemini API key add karo. Then cd server && npm install && npm run seed && npm run dev. Frontend ke liye cd client && npm install && npm run dev.',
    category: 'Setup',
    difficulty: 'intermediate'
  },

  // GENERAL
  {
    intent: 'greeting',
    q: 'hi',
    patterns: ['hi', 'hello', 'hey', 'namaste', 'hii', 'helo'],
    a: 'Hi! 👋 Welcome to Mini AI LMS. Main tumhari learning assistant hoon 😊 Tum articles padh sakte ho, assignments solve kar sakte ho, ya mujhse doubt puch sakte ho. Batao kya help chahiye?',
    category: 'General',
    difficulty: 'beginner'
  },
  {
    intent: 'how_are_you',
    q: 'kaise ho',
    patterns: ['kaise ho', 'how are you', 'kya haal hai'],
    a: 'Main bilkul ready hoon tumhari help ke liye 😄 Tum batao — kya seekhna hai aaj?',
    category: 'General',
    difficulty: 'beginner'
  },
  {
    intent: 'help',
    q: 'help',
    patterns: ['help', 'madad chahiye', 'what can you do', 'tum kya kar sakte ho'],
    a: 'Sure 👍 Tum mujhse ye sab puch sakte ho: Explain IoT, Give me practice questions, Summarize this topic, Assignment hint do, ya Interview prep start karo.',
    category: 'General',
    difficulty: 'beginner'
  },

  // NAVIGATION
  {
    intent: 'start_learning',
    q: 'kaise start karu',
    patterns: [
      'kaise start karu',
      'mujhe samajh nahi aa raha kaha se start karu',
      'where should i start',
      'main kaunsa topic choose karu'
    ],
    a: 'No worries 👍 Start simple: 1. Explore Articles section me jao. 2. Beginner level ka article choose karo. 3. Pura read karo. 4. Assignment attempt karo. Bas ye flow follow karo, gradually sab clear ho jayega.',
    category: 'Guidance',
    difficulty: 'beginner'
  },
  {
    intent: 'article_not_visible',
    q: 'article not showing',
    patterns: [
      'article not showing',
      'article nahi dikh raha',
      'article kaha hai',
      'why article not open',
      'article open nahi ho raha'
    ],
    a: 'Only published articles learners ko visible hote hain. Agar article inactive, archived, draft ya unpublished hai, toh wo public article list me show nahi hoga. Admin/author dashboard me article visible ho sakta hai, but learner side par sirf status: published articles show hone chahiye.',
    category: 'Article Help',
    difficulty: 'beginner'
  },
  {
    intent: 'assignment_location',
    q: 'assignment kaha hai',
    patterns: [
      'assignment kaha hai',
      'assignment not showing',
      'assignment nahi dikh raha',
      'why assignment not visible',
      'assignment open nahi ho raha'
    ],
    a: 'Assignment usually article ke niche show hota hai. Agar assignment nahi dikh raha, toh possible reasons hain: assignment create nahi hua, assignment inactive hai, article unpublished hai, ya user ke role/access me issue hai. Pehle article open karo, scroll karo, aur assignment section check karo.',
    category: 'Assignment',
    difficulty: 'beginner'
  },
  {
    intent: 'direct_assignment',
    q: 'kya main direct assignment kar sakta hoon',
    patterns: [
      'kya main direct assignment kar sakta hoon',
      'can i directly attempt assignment',
      'direct assignment karu kya'
    ],
    a: 'Kar sakte ho, but recommended nahi hai ❌ Pehle article read karo, concepts samjho, phir assignment attempt karo. Isse score better aayega aur learning bhi strong hogi.',
    category: 'Assignment',
    difficulty: 'beginner'
  },
  {
    intent: 'hint_request',
    q: 'mujhe hint chahiye answer nahi',
    patterns: [
      'mujhe hint chahiye answer nahi',
      'hint do',
      'assignment hint do',
      'question hint do',
      'answer mat do hint do'
    ],
    a: 'Perfect 👍 Main direct answer nahi dunga, but guided hint de sakta hoon. Step 1: concept recall karo. Step 2: problem ko smaller parts me break karo. Step 3: jo data diya hai usko required output se connect karo. Try karo, phir agar stuck ho toh next hint maang lena.',
    category: 'Assignment',
    difficulty: 'beginner'
  },

  // LEADERBOARD
  {
    intent: 'leaderboard_not_showing_user',
    q: 'my name not showing in leaderboard',
    patterns: [
      'my name not showing in leaderboard',
      'leaderboard me mera naam nahi hai',
      'user not showing in leaderboard',
      'rank nahi dikh rahi'
    ],
    a: 'Leaderboard me naam usually tab show hota hai jab user ne assignment attempt kiya ho ya score generate hua ho. Agar tumhara naam nahi dikh raha, toh pehle koi assignment submit karo. Backend side par bhi ensure karna chahiye ki zero-score users aur required roles properly include ho rahe hain.',
    category: 'Leaderboard',
    difficulty: 'beginner'
  },

  // LEARNING ADVICE
  {
    intent: 'improvement_tracking',
    q: 'kaise pata chale ki main improve kar raha hoon',
    patterns: [
      'kaise pata chale ki main improve kar raha hoon',
      'am i improving',
      'progress kaise track hota hai',
      'improvement kaise dekhu'
    ],
    a: 'Tum improvement ko Assignment scores, Leaderboard rank, Badges, confidence level aur repeated practice ke basis par track kar sakte ho. Agar score gradually improve ho raha hai aur tum concepts explain kar pa rahe ho, toh clear sign hai ki tum improve kar rahe ho.',
    category: 'Learning Advice',
    difficulty: 'beginner'
  },
  {
    intent: 'fast_learning',
    q: 'fast kaise seekhu',
    patterns: ['fast kaise seekhu', 'how to learn fast', 'jaldi kaise seekhe'],
    a: 'Fast learning ka real formula hai: Practice + Consistency + Revision + Real examples. Shortcuts avoid karo. Har topic ko pehle simple language me samjho, phir example dekho, phir assignment/practice karo.',
    category: 'Learning Advice',
    difficulty: 'beginner'
  },
  {
    intent: 'notes',
    q: 'kya mujhe notes banana chahiye',
    patterns: ['kya mujhe notes banana chahiye', 'should i make notes', 'notes kaise banau'],
    a: 'Haan 👍 Short notes banana very useful hai. Har topic ke 3 parts likho: definition, example, aur use case. Revision ke time ye notes bahut fast help karenge.',
    category: 'Learning Advice',
    difficulty: 'beginner'
  },
  {
    intent: 'confused',
    q: 'samajh nahi aaya',
    patterns: ['samajh nahi aaya', 'i dont understand', 'confuse ho gaya', 'explain again'],
    a: 'Koi problem nahi 👍 Main aur simple bana deta hoon. Tum topic ka naam batao, main usko step-by-step, example ke saath aur beginner-friendly language me explain kar dunga.',
    category: 'Learning Advice',
    difficulty: 'beginner'
  },
  {
    intent: 'forgetting',
    q: 'main sab bhool jata hoon',
    patterns: ['main sab bhool jata hoon', 'i forget everything', 'revision kaise karu'],
    a: 'Revision + Practice = Retention 👍 Spaced repetition follow karo: Day 1 revise, Day 3 revise, Day 7 revise. Saath me 2-3 practice questions solve karo. Isse concept long-term memory me jayega.',
    category: 'Learning Advice',
    difficulty: 'beginner'
  },

  // WEB DEV
  {
    intent: 'html_intro',
    q: 'what is html',
    patterns: ['what is html', 'explain html', 'html kya hai', 'define html', 'html ka use kya hai'],
    a: 'HTML ka full form HyperText Markup Language hai. Ye website ka basic structure banata hai. Jaise human body me skeleton hota hai, waise webpage ka skeleton HTML hota hai. Headings, paragraphs, images, links, buttons aur forms HTML se define hote hain.',
    category: 'Web Dev',
    difficulty: 'beginner'
  },
  {
    intent: 'css_intro',
    q: 'what is css',
    patterns: ['what is css', 'explain css', 'css kya hai', 'how to style website', 'css ka use kya hai'],
    a: 'CSS ka full form Cascading Style Sheets hai. Ye webpage ko design aur style dene ke liye use hota hai. HTML structure banata hai, aur CSS us structure ko beautiful banata hai — jaise colors, fonts, spacing, layout, animations, responsiveness, etc.',
    category: 'Web Dev',
    difficulty: 'beginner'
  },
  {
    intent: 'javascript_intro',
    q: 'what is javascript',
    patterns: [
      'what is javascript',
      'tell me about javascript',
      'explain javascript',
      'javascript kya hai',
      'js kya hota hai',
      'define javascript',
      'javascript ka use kya hai'
    ],
    a: "JavaScript ek programming language hai jo websites ko interactive banati hai. HTML page ka structure banata hai, CSS design deta hai, aur JavaScript behavior add karta hai — jaise button click, dropdown open hona, form validation, popup, live search, dynamic content update, etc. Simple words me: JavaScript website ko 'alive' banata hai.",
    category: 'Web Dev',
    difficulty: 'beginner'
  },
  {
    intent: 'react_intro',
    q: 'what is react',
    patterns: ['what is react', 'react kya hai', 'tell me about react', 'explain react', 'react ka use kya hai'],
    a: 'React ek JavaScript library hai jo fast aur reusable user interfaces banane ke liye use hoti hai. React me UI ko chhote reusable components me divide karte hain, jaise Navbar, Button, Card, Dashboard. Isse code clean, maintainable aur scalable banta hai.',
    category: 'Web Dev',
    difficulty: 'intermediate'
  },
  {
    intent: 'nodejs_intro',
    q: 'what is nodejs',
    patterns: ['what is nodejs', 'nodejs kya hai', 'tell me about nodejs', 'explain node js', 'node js ka use kya hai'],
    a: 'Node.js JavaScript runtime hai jo JavaScript ko browser ke bahar server par run karne deta hai. Iska use backend APIs, authentication, database connection, file handling, real-time apps aur server-side logic banane ke liye hota hai.',
    category: 'Backend',
    difficulty: 'intermediate'
  },
  {
    intent: 'mongodb_intro',
    q: 'what is mongodb',
    patterns: ['what is mongodb', 'mongodb kya hai', 'tell me about mongodb', 'explain mongodb', 'mongodb ka use kya hai'],
    a: 'MongoDB ek NoSQL database hai jo data ko JSON-like documents me store karta hai. Ye flexible schema provide karta hai, isliye changing data structure wale apps ke liye useful hota hai. Mini AI LMS me users, articles, assignments, chat logs aur AI usage data store karne ke liye MongoDB use ho sakta hai.',
    category: 'Database',
    difficulty: 'beginner'
  },

  // PERFORMANCE
  {
    intent: 'api_slow',
    q: 'app slow hai',
    patterns: [
      'app slow hai',
      'chatbot slow hai',
      'api slow hai',
      'response slow aa raha hai',
      'antigravity slow hai'
    ],
    a: 'Slow response ke common reasons hain: repeated Gemini API calls, cache missing, heavy MongoDB aggregation, large payloads, frontend re-renders, ya network delay. Best fix: cache use karo, repeated queries ko predefined Q&A se answer karo, TanStack Query staleTime set karo, aur heavy computations backend/cache layer me precompute karo.',
    category: 'Performance',
    difficulty: 'intermediate'
  }
];

const removeDuplicates = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = normalizeString(item.q || item.question || item.intent);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const seedQAs = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('No MongoDB URI provided in env. Exiting.');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    await PredefinedQA.deleteMany({});
    console.log('Cleared existing Q&As...');

    const uniqueQuestions = removeDuplicates(predefinedQuestions);

    const formattedQAs = uniqueQuestions.map((item) => {
      const allPatterns = Array.from(
        new Set([item.q, ...(item.patterns || [])].filter(Boolean))
      );

      return {
        intent: item.intent || normalizeString(item.q).replace(/\s+/g, '_'),
        question: item.q,
        normalizedQuestion: normalizeString(item.q),
        patterns: allPatterns,
        normalizedPatterns: allPatterns.map(normalizeString),
        answer: item.a,
        category: item.category || 'General',
        tags: [
          (item.category || 'general').toLowerCase(),
          ...(item.tags || [])
        ],
        difficulty: item.difficulty || 'beginner',
        isActive: true,
        usageCount: 0
      };
    });

    await PredefinedQA.insertMany(formattedQAs);

    console.log(`Successfully seeded ${formattedQAs.length} predefined Q&As!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedQAs();