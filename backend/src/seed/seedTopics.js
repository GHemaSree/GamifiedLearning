require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Topic = require('../models/Topic');
const User = require('../models/User');

const buildConcepts = (names) => names.map((name, i) => ({ name, order: i }));

const topicsData = [
  {
    title: 'Python Fundamentals', icon: '🐍', level: 'Beginner', description: 'Core Python programming basics',
    concepts: buildConcepts(['Variables & Data Types', 'Operators', 'Conditionals', 'Loops', 'Functions', 'Lists & Tuples', 'Dictionaries', 'File Handling', 'Exception Handling', 'OOP Basics']),
  },
  {
    title: 'JavaScript Basics', icon: '📜', level: 'Beginner', description: 'Core JavaScript programming basics',
    concepts: buildConcepts(['Variables & Data Types', 'Operators', 'Conditionals', 'Loops', 'Functions', 'Arrays', 'Objects', 'DOM Basics', 'Events', 'Async Basics (Promises)']),
  },
  {
    title: 'Java Programming', icon: '☕', level: 'Beginner', description: 'Core Java programming',
    concepts: buildConcepts(['Variables', 'Data Types', 'Operators', 'Conditions', 'Loops', 'Arrays', 'Methods', 'OOP', 'Inheritance', 'Polymorphism', 'Collections', 'Multithreading']),
  },
  {
    title: 'Data Structures & Algorithms', icon: '🧩', level: 'Intermediate', description: 'Core DSA concepts',
    concepts: buildConcepts(['Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues', 'Recursion', 'Sorting', 'Searching', 'Trees', 'Graphs', 'Dynamic Programming']),
  },
  {
    title: 'Operating Systems', icon: '🖥️', level: 'Intermediate', description: 'OS fundamentals',
    concepts: buildConcepts(['Processes & Threads', 'CPU Scheduling', 'Memory Management', 'Virtual Memory', 'File Systems', 'Deadlocks', 'Synchronization', 'I/O Systems']),
  },
  {
    title: 'Computer Networks', icon: '🌐', level: 'Intermediate', description: 'Networking fundamentals',
    concepts: buildConcepts(['OSI/TCP-IP Models', 'Addressing (IP/MAC)', 'Routing', 'Switching', 'Transport Layer (TCP/UDP)', 'DNS', 'HTTP/HTTPS', 'Network Security Basics']),
  },
  {
    title: 'Database Management Systems', icon: '🗄️', level: 'Intermediate', description: 'DBMS fundamentals',
    concepts: buildConcepts(['ER Modeling', 'Relational Model', 'SQL Basics', 'Joins', 'Normalization', 'Transactions', 'Indexing', 'Concurrency Control']),
  },
  {
    title: 'System Design', icon: '🏗️', level: 'Advanced', description: 'Scalable system design',
    concepts: buildConcepts(['Scalability Basics', 'Load Balancing', 'Caching', 'Database Scaling', 'Microservices vs Monolith', 'Message Queues', 'CAP Theorem', 'Case Studies']),
  },
  {
    title: 'HTML & CSS Basics', icon: '🎨', level: 'Beginner', description: 'Web fundamentals',
    concepts: buildConcepts(['HTML Structure', 'Forms & Inputs', 'CSS Selectors', 'Box Model', 'Flexbox', 'Grid', 'Responsive Design', 'CSS Animation Basics']),
  },
  {
    title: 'React Development', icon: '⚛️', level: 'Intermediate', description: 'Building UIs with React',
    concepts: buildConcepts(['JSX & Components', 'Props & State', 'Event Handling', 'Hooks (useState/useEffect)', 'Conditional Rendering', 'Lists & Keys', 'Context API', 'Routing']),
  },
  {
    title: 'Node.js & Express', icon: '🟢', level: 'Intermediate', description: 'Backend with Node & Express',
    concepts: buildConcepts(['Node Basics', 'Modules', 'NPM', 'Express Setup', 'Routing', 'Middleware', 'Error Handling', 'Connecting a Database']),
  },
  {
    title: 'REST API Design', icon: '🔗', level: 'Intermediate', description: 'Designing REST APIs',
    concepts: buildConcepts(['HTTP Methods', 'Status Codes', 'Resource Naming', 'Request/Response Design', 'Authentication (JWT)', 'Pagination & Filtering', 'Versioning', 'Error Handling']),
  },
  {
    title: 'TypeScript Fundamentals', icon: '🔷', level: 'Intermediate', description: 'Typed JavaScript',
    concepts: buildConcepts(['Basic Types', 'Interfaces', 'Functions & Typing', 'Classes', 'Generics', 'Union/Intersection Types', 'Type Narrowing', 'Working with APIs']),
  },
  {
    title: 'Machine Learning Basics', icon: '🤖', level: 'Intermediate', description: 'Intro to ML',
    concepts: buildConcepts(['What is ML', 'Data Preprocessing', 'Regression', 'Classification', 'Overfitting/Underfitting', 'Model Evaluation', 'Decision Trees', 'Basic Neural Networks']),
  },
  {
    title: 'Prompt Engineering', icon: '✨', level: 'Beginner', description: 'Working effectively with LLMs',
    concepts: buildConcepts(['What is a Prompt', 'Zero-shot vs Few-shot', 'Instruction Design', 'Chain-of-Thought', 'Role Prompting', 'Output Formatting', 'Prompt Iteration', 'Common Pitfalls']),
  },
  {
    title: 'Large Language Models', icon: '🧠', level: 'Advanced', description: 'Understanding LLMs',
    concepts: buildConcepts(['What is an LLM', 'Tokens & Embeddings', 'Transformer Basics', 'Training vs Fine-tuning', 'Context Windows', 'Hallucination', 'Use Cases', 'Limitations']),
  },
  {
    title: 'Git & GitHub', icon: '🐙', level: 'Beginner', description: 'Version control basics',
    concepts: buildConcepts(['Git Basics (init/add/commit)', 'Branching', 'Merging', 'Remote Repos', 'Pull Requests', 'Merge Conflicts', 'Git Workflow Basics', 'GitHub Actions Basics']),
  },
  {
    title: 'Linux Fundamentals', icon: '🐧', level: 'Beginner', description: 'Linux basics',
    concepts: buildConcepts(['File System Structure', 'Basic Commands', 'File Permissions', 'Process Management', 'Package Management', 'Shell Scripting Basics', 'Networking Commands', 'Users & Groups']),
  },
  {
    title: 'Docker & Containers', icon: '🐳', level: 'Intermediate', description: 'Containerization basics',
    concepts: buildConcepts(['What is a Container', 'Images vs Containers', 'Dockerfile Basics', 'Docker Compose', 'Volumes', 'Networking in Docker', 'Container Registries', 'Basic Orchestration Concepts']),
  },
  {
    title: 'Web Application Security', icon: '🔒', level: 'Intermediate', description: 'Securing web apps',
    concepts: buildConcepts(['Common Vulnerabilities (OWASP)', 'SQL Injection', 'XSS', 'CSRF', 'Authentication Best Practices', 'Secure Session Management', 'HTTPS/TLS Basics', 'Input Validation']),
  },
  {
    title: 'Cloud Computing Basics', icon: '☁️', level: 'Intermediate', description: 'Cloud fundamentals',
    concepts: buildConcepts(['Cloud Fundamentals', 'IaaS/PaaS/SaaS', 'Virtualization', 'AWS/Azure/GCP Basics', 'Storage Services', 'Compute Services', 'Networking Basics', 'Security & IAM']),
  },
  {
    title: 'Data Analysis with Python', icon: '📊', level: 'Beginner', description: 'Analyzing data with Python',
    concepts: buildConcepts(['NumPy Basics', 'Pandas Basics', 'Data Cleaning', 'Data Visualization', 'Exploratory Data Analysis', 'Grouping & Aggregation', 'Working with CSV/Excel', 'Intro to Statistics']),
  },
  {
    title: 'React Native', icon: '📱', level: 'Intermediate', description: 'Cross-platform mobile apps with React',
    concepts: buildConcepts(['React Native Basics', 'Components & Styling', 'Navigation', 'State Management', 'Handling User Input', 'APIs & Networking', 'Device Features', 'Building & Deployment']),
  },
  {
    title: 'Microservices Architecture', icon: '🧱', level: 'Advanced', description: 'Designing microservice systems',
    concepts: buildConcepts(['Monolith vs Microservices', 'Service Decomposition', 'Inter-Service Communication', 'API Gateway', 'Service Discovery', 'Data Management Patterns', 'Resilience Patterns', 'Deployment & Orchestration']),
  },
  {
    title: 'Deep Learning Fundamentals', icon: '🧬', level: 'Advanced', description: 'Neural networks and deep learning',
    concepts: buildConcepts(['Neural Network Basics', 'Activation Functions', 'Forward & Backpropagation', 'Loss Functions & Optimizers', 'CNNs', 'RNNs', 'Overfitting & Regularization', 'Training Best Practices']),
  },
];

const seed = async () => {
  await connectDB();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('No admin user found. Promote a user to admin in MongoDB first, then re-run this script.');
    process.exit(1);
  }

  await Topic.deleteMany({}); // clears existing topics before reseeding

  const docs = topicsData.map((t, i) => ({ ...t, order: i, createdBy: admin._id }));
  await Topic.insertMany(docs);

  console.log(`Seeded ${docs.length} topics.`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});