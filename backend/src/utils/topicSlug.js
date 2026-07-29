// ─────────────────────────────────────────────────────────────────────────────
// topicSlug.js
//
// Converts a human-readable Topic title stored in MongoDB
// (e.g. "Python Fundamentals") into the snake_case slug used as
// keys in the DKT model's skills.py TOPICS dict
// (e.g. "python_fundamentals").
//
// The mapping is an explicit lookup first so edge-cases that don't
// follow simple lowercasing/spacing rules are handled correctly.
// Falls back to a generic normaliser for unknown topics.
// ─────────────────────────────────────────────────────────────────────────────

/** Explicit title → DKT slug map (covers every topic in skills.py) */
const TITLE_TO_SLUG = {
  // Beginner
  'Python Fundamentals':             'python_fundamentals',
  'JavaScript Basics':               'javascript_basics',
  'Java Programming':                'java_programming',
  'HTML and CSS':                    'html_and_css',
  'Git and GitHub':                  'git_and_github',
  'Linux Fundamentals':              'linux_fundamentals',
  'Prompt Engineering':              'prompt_engineering',
  'Data Analysis with Python':       'data_analysis_python',
  'Data Analysis Python':            'data_analysis_python',

  // Intermediate
  'Data Structures and Algorithms':  'data_structures_and_algorithms',
  'Operating Systems':               'operating_systems',
  'Computer Networks':               'computer_networks',
  'Database Management':             'database_management',
  'React Development':               'react_development',
  'Node.js and Express':             'nodejs_and_express',
  'NodeJS and Express':              'nodejs_and_express',
  'REST API Design':                 'rest_api_design',
  'TypeScript Fundamentals':         'typescript_fundamentals',
  'Machine Learning Basics':         'machine_learning_basics',
  'Docker and Containers':           'docker_and_containers',
  'Web Application Security':        'web_application_security',
  'Cloud Computing Basics':          'cloud_computing_basics',
  'React Native':                    'react_native',

  // Advanced
  'System Design':                   'system_design',
  'Large Language Models':           'large_language_models',
  'Microservices Architecture':      'microservices_architecture',
  'Deep Learning Fundamentals':      'deep_learning_fundamentals',
};

/**
 * Convert a Topic title to its DKT slug.
 *
 * @param {string} title - Topic title as stored in MongoDB (e.g. "Python Fundamentals")
 * @returns {string}     - DKT slug (e.g. "python_fundamentals"), or null if unknown
 */
const titleToSlug = (title) => {
  if (!title) return null;

  // 1. Exact match
  if (TITLE_TO_SLUG[title]) return TITLE_TO_SLUG[title];

  // 2. Case-insensitive exact match
  const lower = title.trim().toLowerCase();
  const found = Object.entries(TITLE_TO_SLUG).find(
    ([k]) => k.toLowerCase() === lower
  );
  if (found) return found[1];

  // 3. Generic fallback: lowercase + replace spaces/hyphens/dots with underscore
  const generic = lower.replace(/[\s\-\.]+/g, '_').replace(/[^a-z0-9_]/g, '');
  console.warn(
    `[topicSlug] Unknown topic title "${title}" — using generic slug "${generic}". ` +
    'Add it to TITLE_TO_SLUG if the DKT model supports it.'
  );
  return generic;
};

module.exports = { titleToSlug };
