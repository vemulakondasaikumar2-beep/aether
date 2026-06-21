const MOCK_DATA = {
  academicAnswers: {
    photosynthesis: {
      title: "Photosynthesis Explained",
      subject: "Biology",
      content: `**Photosynthesis** is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy.
      
**The Chemical Equation:**
$$\\text{6CO}_2 + \\text{6H}_2\\text{O} + \\text{light energy} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$

**Key Stages:**
1. **Light-dependent Reactions:** Occur in the thylakoid membranes. Solar energy is captured by chlorophyll and converted into ATP and NADPH, releasing oxygen as a byproduct.
2. **Light-independent Reactions (Calvin Cycle):** Occur in the stroma. Uses ATP and NADPH to convert carbon dioxide ($CO_2$) into sugar (glucose).`
    },
    gravity: {
      title: "Understanding Gravity",
      subject: "Physics",
      content: `**Gravity** is a fundamental force of attraction that acts between all matter.
      
**Two Major Models:**
1. **Newtonian Gravity:** Every particle attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of the distance between their centers:
   $$F = G \\frac{m_1 m_2}{r^2}$$
2. **General Relativity (Einstein):** Gravity is not a traditional force but a consequence of the curvature of spacetime caused by the uneven distribution of mass and energy.`
    },
    calculus: {
      title: "Calculus Core Concepts",
      subject: "Mathematics",
      content: `**Calculus** is the mathematical study of continuous change. It has two major branches:
      
*   **Differential Calculus:** Focuses on rates of change, such as slopes of tangent lines and velocities. The derivative of $f(x)$ is defined as:
    $$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
*   **Integral Calculus:** Focuses on accumulation of quantities and areas under curves. The definite integral is defined as the limit of Riemann sums.`
    },
    algorithms: {
      title: "Introduction to Algorithms",
      subject: "Computer Science",
      content: `An **Algorithm** is a step-by-step set of instructions for solving a problem or executing a task.
      
**Key Efficiency Measures (Big O Notation):**
*   **$O(1)$:** Constant time (ideal, e.g., array index lookup).
*   **$O(\\log n)$:** Logarithmic time (very efficient, e.g., binary search).
*   **$O(n)$:** Linear time (e.g., searching an unsorted array).
*   **$O(n \\log n)$:** Linearithmic time (efficient sorting algorithms like Merge Sort, Quick Sort).
*   **$O(n^2)$:** Quadratic time (inefficient for large data, e.g., Bubble Sort).`
    },
    databases: {
      title: "Databases: SQL vs. NoSQL",
      subject: "Computer Science",
      content: `**Databases** store and organize structured data. They are split into two primary architectures:
      
*   **SQL (Relational):** Highly structured, uses tables with rows and columns, strictly enforces ACID properties, and is queried using SQL (Structured Query Language). Examples: PostgreSQL, MySQL, SQLite.
*   **NoSQL (Non-Relational):** Flexible schema, stores data as documents, key-value pairs, graphs, or wide-columns. Scaled horizontally. Examples: MongoDB, Redis, Cassandra.`
    },
    history_ww1: {
      title: "World War I Overview",
      subject: "History",
      content: `**World War I (1914–1918)**, also known as the Great War, was a global conflict centered in Europe.
      
**Primary Causes (M-A-I-N):**
*   **Militarism:** Massive arms race among European empires.
*   **Alliances:** Complex networks of treaties (Triple Entente vs. Central Powers).
*   **Imperialism:** Competition for colonies and global influence.
*   **Nationalism:** Intense national pride and self-determination movements.

**Trigger Event:** The assassination of Archduke Franz Ferdinand of Austria in June 1914.`
    },
    pythagorean: {
      title: "Pythagorean Theorem",
      subject: "Mathematics",
      content: `The **Pythagorean Theorem** is a fundamental relation in Euclidean geometry among the three sides of a right triangle.
      
**The Theorem:**
It states that the area of the square whose side is the hypotenuse ($c$) is equal to the sum of the areas of the squares on the other two sides ($a$ and $b$):
$$a^2 + b^2 = c^2$$

Useful for calculating distances, vector magnitudes, and coordinates.`
    }
  },

  schedules: [
    {
      name: "High-Intensity Exam Prep (5-Day Plan)",
      description: "Ideal for study sprints leading up to major exams. Uses spaced repetition.",
      days: [
        { day: "Day 1", tasks: ["Review all class notes & lecture slides", "Identify weak areas and highlight them", "Do 1 hour of light reading"] },
        { day: "Day 2", tasks: ["Active recall practice: write explanations from memory", "Solve 5 practice problems", "Take a short review quiz"] },
        { day: "Day 3", tasks: ["Focus heavily on difficult topics", "Create a 1-page summary sheet (cheat sheet)", "Teach concepts to a peer/mirror"] },
        { day: "Day 4", tasks: ["Simulate exam: complete a full practice paper under time limits", "Review errors and correct notes"] },
        { day: "Day 5", tasks: ["Light review of summary sheets", "Rest well, avoid cramming, drink plenty of water"] }
      ]
    },
    {
      name: "Consistent Weekly Deep Work Plan",
      description: "A balanced routine for maintaining high grades throughout the semester.",
      days: [
        { day: "Mon / Wed", tasks: ["Pre-study: read upcoming syllabus chapters (30m)", "Attend lectures and annotate key terms", "Complete weekly homework tasks (1.5h)"] },
        { day: "Tue / Thu", tasks: ["Solve homework problems & write notes summaries (1h)", "Review hard concepts", "Work on long-term term papers or projects (1h)"] },
        { day: "Friday", tasks: ["Weekly review: test yourself on all material covered this week (1h)", "Submit pending assignments"] },
        { day: "Sat / Sun", tasks: ["Plan the upcoming week", "Relax and pursue creative hobbies", "Sleep 8+ hours"] }
      ]
    },
    {
      name: "Coding & STEM Bootcamp Schedule",
      description: "Structured specifically for computer science, mathematics, and engineering students.",
      days: [
        { day: "Morning Focus", tasks: ["Deep coding: write code for projects or labs (2h)", "Practice 1-2 algorithm problems on arrays/graphs (1h)"] },
        { day: "Midday Review", tasks: ["Watch tutorial lectures or review API documentation", "Analyze complex time complexities (Big O)"] },
        { day: "Afternoon Labs", tasks: ["Debugging and refactoring code", "Contribute to collaborative repositories / git practice"] },
        { day: "Evening Wrap-up", tasks: ["Review notes and plan bug-fixes for tomorrow (30m)"] }
      ]
    }
  ],

  quotes: [
    "The secret of getting ahead is getting started. – Mark Twain",
    "It always seems impossible until it's done. – Nelson Mandela",
    "Strive for progress, not perfection. – Unknown",
    "There are no shortcuts to any place worth going. – Beverly Sills",
    "Don't wish it were easier. Wish you were better. – Jim Rohn",
    "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
    "You don't have to be great to start, but you have to start to be great. – Zig Ziglar",
    "You are capable of doing difficult things. – Unknown",
    "The mind is not a vessel to be filled, but a fire to be kindled. – Plutarch"
  ],

  studyTips: [
    {
      title: "The Feynman Technique",
      desc: "Explain the concept in simple terms as if you were teaching it to a 10-year-old. This highlights gaps in your understanding."
    },
    {
      title: "Spaced Repetition",
      desc: "Review your notes at increasing intervals (e.g., 1 day, 3 days, 7 days, 14 days) to transfer knowledge from short-term to long-term memory."
    },
    {
      title: "Active Recall",
      desc: "Instead of passively re-reading notes, close the book and write down everything you remember, or quiz yourself. This strengthens brain pathways."
    },
    {
      title: "The 80/20 Rule (Pareto Principle)",
      desc: "Identify the 20% of concepts that will make up 80% of the exam questions, and focus your initial energy on mastering them."
    },
    {
      title: "Interleaving Practice",
      desc: "Mix up the subjects or problem types you study in a single session. This improves problem-solving adaptability compared to studying block units."
    },
    {
      title: "Optimize Your Focus Environment",
      desc: "Put your phone in another room. Research shows just having your phone on the desk, even if off, reduces cognitive capacity."
    }
  ],

  defaultBotResponses: [
    "I'm here to assist you! Try asking me: \n- *'Explain gravity'*\n- *'What is photosynthesis?'*\n- *'Explain calculus'*\n- *'Suggest a study schedule'*\n- *'Give me a study tip'*",
    "That is an interesting topic! While I have specific modules for Science, Math, History, and Computer Science, you can also store details about this in your Notes tab.",
    "Let's focus on your study goals. Would you like me to suggest a study schedule or help you plan a Pomodoro focus block?"
  ]
};
