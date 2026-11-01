
// ======================================
// SMARTQUIZ - MAIN JAVASCRIPT
// ======================================

const app = document.getElementById("app");
const modal = document.getElementById("modal");
const toast = document.getElementById("toast");

let currentPage = "home";
let currentQuiz = null;
let currentQuestion = 0;
let selectedAnswers = {};
let timerInterval = null;
let timeLeft = 0;

// ======================================
// SAMPLE QUIZ DATABASE
// ======================================

const defaultQuizzes = [
    {
        id: 1,
        title: "HTML Fundamentals",
        category: "Programming",
        icon: "💻",
        description: "Test your knowledge of HTML basics and elements.",
        duration: 5,
        questions: [
            {
                question: "What does HTML stand for?",
                options: [
                    "Hyper Text Markup Language",
                    "High Text Machine Language",
                    "Hyperlinks Text Mark Language",
                    "Home Tool Markup Language"
                ],
                answer: 0,
                explanation: "HTML stands for Hyper Text Markup Language."
            },
            {
                question: "Which tag creates a paragraph?",
                options: ["<h1>", "<p>", "<div>", "<br>"],
                answer: 1,
                explanation: "The <p> tag creates a paragraph."
            },
            {
                question: "Which tag creates a hyperlink?",
                options: ["<link>", "<a>", "<href>", "<url>"],
                answer: 1,
                explanation: "The <a> element creates hyperlinks."
            },
            {
                question: "Which tag displays an image?",
                options: ["<image>", "<picture>", "<img>", "<src>"],
                answer: 2,
                explanation: "The <img> element displays an image."
            },
            {
                question: "Which attribute provides an image path?",
                options: ["href", "src", "alt", "link"],
                answer: 1,
                explanation: "The src attribute specifies the image path."
            }
        ]
    },
    {
        id: 2,
        title: "CSS Basics",
        category: "Programming",
        icon: "🎨",
        description: "Learn about styling, colors, selectors and layouts.",
        duration: 5,
        questions: [
            {
                question: "What does CSS stand for?",
                options: [
                    "Computer Style Sheets",
                    "Creative Style System",
                    "Cascading Style Sheets",
                    "Colorful Style Sheets"
                ],
                answer: 2,
                explanation: "CSS means Cascading Style Sheets."
            },
            {
                question: "Which property changes text color?",
                options: ["font", "color", "background", "text"],
                answer: 1,
                explanation: "The color property changes text color."
            },
            {
                question: "Which symbol selects a class?",
                options: ["#", ".", "*", "$"],
                answer: 1,
                explanation: "A dot selects a CSS class."
            },
            {
                question: "Which property controls font size?",
                options: ["font-size", "text-style", "size", "font-weight"],
                answer: 0,
                explanation: "font-size controls the size of text."
            }
        ]
    },
    {
        id: 3,
        title: "JavaScript Essentials",
        category: "Programming",
        icon: "⚡",
        description: "Check your understanding of JavaScript programming.",
        duration: 5,
        questions: [
            {
                question: "Which keyword declares a variable?",
                options: ["var", "int", "string", "define"],
                answer: 0,
                explanation: "var is a JavaScript variable declaration keyword."
            },
            {
                question: "Which method displays a message?",
                options: ["print()", "alert()", "show()", "message()"],
                answer: 1,
                explanation: "alert() displays a browser alert."
            },
            {
                question: "Which symbol is used for strict equality?",
                options: ["=", "==", "===", "!="],
                answer: 2,
                explanation: "=== checks equality without type conversion."
            },
            {
                question: "Which method selects an HTML element by ID?",
                options: [
                    "getElementById()",
                    "getClass()",
                    "queryID()",
                    "selectElement()"
                ],
                answer: 0,
                explanation: "getElementById() selects an element using its ID."
            }
        ]
    },
    {
        id: 4,
        title: "General Knowledge",
        category: "General Knowledge",
        icon: "🌍",
        description: "Challenge yourself with general knowledge questions.",
        duration: 5,
        questions: [
            {
                question: "What is the capital of Japan?",
                options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
                answer: 1,
                explanation: "Tokyo is the capital of Japan."
            },
            {
                question: "How many days are in a leap year?",
                options: ["364", "365", "366", "367"],
                answer: 2,
                explanation: "A leap year has 366 days."
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Mercury"],
                answer: 1,
                explanation: "Mars is commonly known as the Red Planet."
            }
        ]
    },
    {
        id: 5,
        title: "Computer Fundamentals",
        category: "Computer Science",
        icon: "🖥️",
        description: "Test your knowledge of computer hardware and software.",
        duration: 5,
        questions: [
            {
                question: "What is the brain of a computer?",
                options: ["RAM", "CPU", "Monitor", "Keyboard"],
                answer: 1,
                explanation: "The CPU processes instructions and is often called the computer's brain."
            },
            {
                question: "Which device is used for input?",
                options: ["Monitor", "Printer", "Keyboard", "Speaker"],
                answer: 2,
                explanation: "A keyboard is an input device."
            },
            {
                question: "What does RAM stand for?",
                options: [
                    "Read Access Memory",
                    "Random Access Memory",
                    "Run Active Memory",
                    "Rapid Application Module"
                ],
                answer: 1,
                explanation: "RAM means Random Access Memory."
            }
        ]
    }
];

// ======================================
// LOCAL STORAGE
// ======================================

function loadQuizzes() {
    const saved = localStorage.getItem("smartquiz_quizzes");

    if (saved) {
        return JSON.parse(saved);
    }

    return defaultQuizzes;
}

let quizzes = loadQuizzes();

function saveQuizzes() {
    localStorage.setItem("smartquiz_quizzes", JSON.stringify(quizzes));
}

function loadResults() {
    return JSON.parse(localStorage.getItem("smartquiz_results") || "[]");
}

function saveResult(result) {
    const results = loadResults();
    results.push(result);
    localStorage.setItem("smartquiz_results", JSON.stringify(results));
}

// ======================================
// NOTIFICATIONS
// ======================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ======================================
// NAVIGATION
// ======================================

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        const page = button.dataset.page;

        if (!page) return;

        navigate(page);
    });
});

function navigate(page) {
    clearInterval(timerInterval);

    currentPage = page;

    document.querySelectorAll(".nav").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    const titles = {
        home: "Home",
        explore: "Explore Quizzes",
        categories: "Categories",
        dashboard: "Dashboard",
        leaderboard: "Leaderboard",
        profile: "My Profile",
        admin: "Admin Panel"
    };

    document.getElementById("pageTitle").textContent =
        titles[page] || "SmartQuiz";

    renderPage();
}

function renderPage() {
    switch (currentPage) {
        case "home":
            renderHome();
            break;

        case "explore":
            renderExplore();
            break;

        case "categories":
            renderCategories();
            break;

        case "dashboard":
            renderDashboard();
            break;

        case "leaderboard":
            renderLeaderboard();
            break;

        case "profile":
            renderProfile();
            break;

        case "admin":
            renderAdmin();
            break;

        default:
            renderHome();
    }
}

// ======================================
// HOME PAGE
// ======================================

function renderHome() {
    const results = loadResults();

    app.innerHTML = `
        <div class="welcome">
            <div>
                <h1>Welcome to SmartQuiz! 👋</h1>
                <p>Improve your knowledge, challenge yourself
                and achieve your learning goals.</p>
                <br>
                <button class="btn" onclick="navigate('explore')">
                    Explore Quizzes →
                </button>
            </div>
            <div class="welcome-icon">🎓</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📚</div>
                <h2>${quizzes.length}</h2>
                <p>Available Quizzes</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <h2>${results.length}</h2>
                <p>Completed Quizzes</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <h2>${results.reduce((sum, r) => sum + r.score, 0)}</h2>
                <p>Total Correct Answers</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <h2>${averageScore()}%</h2>
                <p>Average Score</p>
            </div>
        </div>

        <div class="section-heading">
            <div>
                <h2>Popular Quizzes</h2>
                <p>Choose a quiz and test your knowledge.</p>
            </div>
            <button class="btn btn-secondary"
                onclick="navigate('explore')">View All</button>
        </div>

        <div class="quiz-grid">
            ${quizzes.slice(0, 3).map(createQuizCard).join("")}
        </div>
    `;
}

// ======================================
// QUIZ CARD
// ======================================

function createQuizCard(quiz) {
    return `
        <div class="quiz-card">
            <div class="quiz-icon">${escapeHTML(quiz.icon)}</div>

            <h3>${escapeHTML(quiz.title)}</h3>

            <p>${escapeHTML(quiz.description)}</p>

            <div class="quiz-meta">
                <span>📋 ${quiz.questions.length} Questions</span>
                <span>⏱ ${quiz.duration} min</span>
            </div>

            <button class="btn full-width"
                onclick="startQuiz(${quiz.id})">
                Start Quiz →
            </button>
        </div>
    `;
}

// ======================================
// EXPLORE PAGE
// ======================================

function renderExplore(search = "") {
    const filtered = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(search.toLowerCase()) ||
        quiz.category.toLowerCase().includes(search.toLowerCase())
    );

    app.innerHTML = `
        <div class="section-heading">
            <div>
                <h2>Explore Quizzes</h2>
                <p>Discover quizzes from different subjects.</p>
            </div>
        </div>

        <div class="quiz-grid">
            ${filtered.length
                ? filtered.map(createQuizCard).join("")
                : "<p>No quizzes found.</p>"}
        </div>
    `;
}

// ======================================
// CATEGORIES PAGE
// ======================================

function renderCategories() {
    const categories = [...new Set(quizzes.map(q => q.category))];

    const icons = {
        Programming: "💻",
        "General Knowledge": "🌍",
        "Computer Science": "🖥️",
        Mathematics: "📐",
        Science: "🔬",
        English: "📖"
    };

    app.innerHTML = `
        <div class="section-heading">
            <div>
                <h2>Quiz Categories</h2>
                <p>Choose your favorite learning subject.</p>
            </div>
        </div>

        <div class="category-grid">
            ${categories.map(category => `
                <div class="category-card"
                    onclick="filterCategory('${escapeJS(category)}')">

                    <span>${icons[category] || "📚"}</span>
                    <h3>${escapeHTML(category)}</h3>
                    <p>
                        ${quizzes.filter(q =>
                            q.category === category
                        ).length} Quizzes
                    </p>
                </div>
            `).join("")}
        </div>
    `;
}

function filterCategory(category) {
    currentPage = "explore";
    document.getElementById("pageTitle").textContent = category;

    const filtered = quizzes.filter(q => q.category === category);

    app.innerHTML = `
        <div class="section-heading">
            <h2>${escapeHTML(category)} Quizzes</h2>
        </div>

        <div class="quiz-grid">
            ${filtered.map(createQuizCard).join("")}
        </div>
    `;
}

// ======================================
// START QUIZ
// ======================================

function startQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz || !quiz.questions.length) {
        showToast("This quiz has no questions.");
        return;
    }

    currentQuiz = quiz;
    currentQuestion = 0;
    selectedAnswers = {};

    timeLeft = quiz.duration * 60;

    renderQuestion();
    startTimer();
}

// ======================================
// QUIZ TIMER
// ======================================

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;

        const timer = document.getElementById("timer");

        if (timer) {
            timer.textContent = formatTime(timeLeft);
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

// ======================================
// DISPLAY QUESTION
// ======================================

function renderQuestion() {
    const question = currentQuiz.questions[currentQuestion];

    const selected = selectedAnswers[currentQuestion];

    const progress =
        ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    app.innerHTML = `
        <div class="quiz-box">

            <div class="quiz-top">
                <div>
                    <h3>${escapeHTML(currentQuiz.title)}</h3>
                    <p>Question ${currentQuestion + 1}
                    of ${currentQuiz.questions.length}</p>
                </div>

                <div class="timer" id="timer">
                    ${formatTime(timeLeft)}
                </div>
            </div>

            <div class="progress">
                <div class="progress-bar"
                    style="width:${progress}%"></div>
            </div>

            <h2 class="question">
                ${escapeHTML(question.question)}
            </h2>

            <div>
                ${question.options.map((option, index) => `
                    <button class="option
                        ${selected === index ? "selected" : ""}"
                        onclick="selectAnswer(${index})">

                        <b>${String.fromCharCode(65 + index)}.</b>
                        ${escapeHTML(option)}

                    </button>
                `).join("")}
            </div>

            <div class="quiz-navigation">

                <button class="btn btn-secondary"
                    onclick="previousQuestion()"
                    ${currentQuestion === 0 ? "disabled" : ""}>
                    ← Previous
                </button>

                <button class="btn"
                    onclick="nextQuestion()">

                    ${currentQuestion === currentQuiz.questions.length - 1
                        ? "Finish Quiz"
                        : "Next Question →"}

                </button>
            </div>
        </div>
    `;
}

function selectAnswer(index) {
    selectedAnswers[currentQuestion] = index;
    renderQuestion();
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

function nextQuestion() {
    if (selectedAnswers[currentQuestion] === undefined) {
        showToast("Please select an answer first.");
        return;
    }

    if (currentQuestion < currentQuiz.questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        finishQuiz();
    }
}

// ======================================
// FINISH QUIZ AND CALCULATE SCORE
// ======================================

function finishQuiz() {
    clearInterval(timerInterval);

    let score = 0;

    currentQuiz.questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.answer) {
            score++;
        }
    });

    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const result = {
        quizId: currentQuiz.id,
        title: currentQuiz.title,
        score,
        total,
        percentage,
        date: new Date().toLocaleDateString()
    };

    saveResult(result);

    renderResult(result);
}

// ======================================
// RESULTS PAGE
// ======================================

function renderResult(result) {
    app.innerHTML = `
        <div class="result-box">

            <div style="font-size:65px">🏆</div>

            <h2>Quiz Completed!</h2>

            <div class="result-score">
                ${result.percentage}%
            </div>

            <p>
                You answered ${result.score} out of
                ${result.total} questions correctly.
            </p>

            <h3>
                ${result.percentage >= 80
                    ? "Excellent Work! 🎉"
                    : result.percentage >= 50
                    ? "Good Job! Keep Practicing!"
                    : "Keep Learning and Try Again!"}
            </h3>

            <br>

            <button class="btn"
                onclick="reviewQuiz(${result.quizId})">
                Review Answers
            </button>

            <button class="btn btn-secondary"
                onclick="navigate('home')">
                Back to Home
            </button>

        </div>
    `;
}

// ======================================
// ANSWER REVIEW
// ======================================

function reviewQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) return;

    app.innerHTML = `
        <div class="section-heading">
            <div>
                <h2>Answer Review</h2>
                <p>${escapeHTML(quiz.title)}</p>
            </div>
        </div>

        ${quiz.questions.map((question, index) => {
            const selected = selectedAnswers[index];
            const correct = question.answer;

            return `
                <div class="panel" style="margin-bottom:18px">

                    <h3 style="margin-bottom:15px">
                        ${index + 1}. ${escapeHTML(question.question)}
                    </h3>

                    ${question.options.map((option, i) => `
                        <p style="
                            padding:10px;
                            margin:5px 0;
                            border-radius:8px;
                            background:${i === correct
                                ? "#dcfce7"
                                : i === selected
                                ? "#fee2e2"
                                : "#f8f8fc"}">

                            ${String.fromCharCode(65 + i)}.
                            ${escapeHTML(option)}

                            ${i === correct ? " ✓ Correct Answer" : ""}
                            ${i === selected && i !== correct
                                ? " ✗ Your Answer" : ""}
                        </p>
                    `).join("")}

                    <p style="margin-top:12px;color:#777">
                        Explanation: ${escapeHTML(question.explanation || "")}
                    </p>

                </div>
            `;
        }).join("")}

        <button class="btn" onclick="navigate('home')">
            Back to Home
        </button>
    `;
}

// ======================================
// DASHBOARD
// ======================================

function averageScore() {
    const results = loadResults();

    if (!results.length) return 0;

    const total = results.reduce((sum, r) =>
        sum + r.percentage, 0);

    return Math.round(total / results.length);
}

function renderDashboard() {
    const results = loadResults();

    app.innerHTML = `
        <div class="section-heading">
            <div>
                <h2>Learning Dashboard</h2>
                <p>Track your learning progress.</p>
            </div>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <h2>${results.length}</h2>
                <p>Completed Quizzes</p>
            </div>

            <div class="stat-card">
                <h2>${averageScore()}%</h2>
                <p>Average Score</p>
            </div>

            <div class="stat-card">
                <h2>${results.reduce((s, r) => s + r.score, 0)}</h2>
                <p>Correct Answers</p>
            </div>

            <div class="stat-card">
                <h2>${quizzes.length}</h2>
                <p>Available Quizzes</p>
            </div>

        </div>

        <div class="panel">
            <h2>Recent Quiz Results</h2>
            <br>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Quiz</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${results.length ? [...results].reverse().map(r => `
                            <tr>
                                <td>${escapeHTML(r.title)}</td>
                                <td>${r.score}/${r.total}</td>
                                <td><span class="badge">${r.percentage}%</span></td>
                                <td>${escapeHTML(r.date)}</td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="4">No results yet. Start a quiz!</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ======================================
// LEADERBOARD
// ======================================

function renderLeaderboard() {
    const results = loadResults();

    const totalScore = results.reduce((s, r) => s + r.score, 0);

    app.innerHTML = `
        <div class="section-heading">
            <div>
                <h2>Leaderboard 🏆</h2>
                <p>Your quiz performance summary.</p>
            </div>
        </div>

        <div class="panel">
            <div class="leader-row">
                <div class="leader-user">
                    <div class="avatar">ST</div>
                    <div>
                        <b>Student</b>
                        <p style="font-size:12px;color:#777">
                            Your local account
                        </p>
                    </div>
                </div>

                <b>${totalScore} Points</b>
            </div>

            <p style="padding:20px;color:#777;font-size:13px">
                This is a local demo leaderboard. A shared leaderboard
                requires a server and user accounts.
            </p>
        </div>
    `;
}

// ======================================
// PROFILE
// ======================================

function renderProfile() {
    const name = localStorage.getItem("smartquiz_name") || "Student";

    app.innerHTML = `
        <div class="section-heading">
            <div>
                <h2>My Profile</h2>
                <p>Manage your personal information.</p>
            </div>
        </div>

        <div class="panel" style="max-width:600px">

            <div style="text-align:center;margin-bottom:25px">
                <div class="avatar"
                    style="width:75px;height:75px;font-size:25px;margin:auto">
                    👤
                </div>
                <h2 style="margin-top:12px">My Account</h2>
            </div>

            <div class="form-group">
                <label>Full Name</label>
                <input id="profileName" value="${escapeHTML(name)}">
            </div>

            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="profileEmail"
                    placeholder="Enter your email">
            </div>

            <button class="btn" onclick="saveProfile()">
                Save Changes
            </button>

        </div>
    `;
}

function saveProfile() {
    const name = document.getElementById("profileName").value.trim();

    if (!name) {
        showToast("Please enter your name.");
        return;
    }

    localStorage.setItem("smartquiz_name", name);

    showToast("Profile updated successfully!");

    renderProfile();
}

// ======================================
// ADMIN PANEL
// ======================================

function renderAdmin() {
    app.innerHTML = `
        <div class="section-heading">
            <div>
                <h2>Admin Panel ⚙</h2>
                <p>Create, edit and manage quizzes.</p>
            </div>

            <button class="btn" onclick="showAddQuizForm()">
                + Add New Quiz
            </button>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <h2>${quizzes.length}</h2>
                <p>Total Quizzes</p>
            </div>

            <div class="stat-card">
                <h2>${quizzes.reduce((s, q) =>
                    s + q.questions.length, 0)}</h2>
                <p>Total Questions</p>
            </div>

            <div class="stat-card">
                <h2>${loadResults().length}</h2>
                <p>Quiz Attempts</p>
            </div>

            <div class="stat-card">
                <h2>${new Set(quizzes.map(q => q.category)).size}</h2>
                <p>Categories</p>
            </div>

        </div>

        <div class="panel">
            <h2>Manage Quizzes</h2>
            <br>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Quiz Name</th>
                            <th>Category</th>
                            <th>Questions</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${quizzes.map(q => `
                            <tr>
                                <td>${escapeHTML(q.title)}</td>
                                <td>${escapeHTML(q.category)}</td>
                                <td>${q.questions.length}</td>

                                <td>
                                    <button class="btn btn-secondary btn-small"
                                        onclick="editQuiz(${q.id})">
                                        Edit
                                    </button>

                                    <button class="btn btn-danger btn-small"
                                        onclick="deleteQuiz(${q.id})">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ======================================
// ADD QUIZ FORM
// ======================================

function showAddQuizForm() {
    modal.innerHTML = `
        <div class="panel"
            style="max-width:650px;margin:30px auto">

            <h2>Create New Quiz</h2>
            <br>

            <div class="form-group">
                <label>Quiz Title</label>
                <input id="newTitle" placeholder="Enter quiz title">
            </div>

            <div class="form-group">
                <label>Category</label>
                <input id="newCategory"
                    placeholder="Programming, Science, English...">
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea id="newDescription"
                    placeholder="Describe this quiz"></textarea>
            </div>

            <div class="form-group">
                <label>Duration (Minutes)</label>
                <input id="newDuration" type="number" value="5" min="1">
            </div>

            <button class="btn" onclick="createQuiz()">
                Create Quiz
            </button>

            <button class="btn btn-secondary"
                onclick="closeModal()">
                Cancel
            </button>
        </div>
    `;
}

function createQuiz() {
    const title = document.getElementById("newTitle").value.trim();
    const category = document.getElementById("newCategory").value.trim();
    const description = document.getElementById("newDescription").value.trim();
    const duration = Number(document.getElementById("newDuration").value);

    if (!title || !category || !description || !duration ||
        duration < 1) {
        showToast("Please complete all fields correctly.");
        return;
    }

    const quiz = {
        id: Date.now(),
        title,
        category,
        description,
        icon: "📚",
        duration,
        questions: []
    };

    quizzes.push(quiz);
    saveQuizzes();

    closeModal();
    renderAdmin();

    showToast("Quiz created successfully!");
}

// ======================================
// EDIT QUIZ
// ======================================

function editQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) return;

    modal.innerHTML = `
        <div class="panel"
            style="max-width:650px;margin:30px auto">

            <h2>Edit Quiz</h2>
            <br>

            <div class="form-group">
                <label>Quiz Title</label>
                <input id="editTitle"
                    value="${escapeHTML(quiz.title)}">
            </div>

            <div class="form-group">
                <label>Category</label>
                <input id="editCategory"
                    value="${escapeHTML(quiz.category)}">
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea id="editDescription">${escapeHTML(quiz.description)}</textarea>
            </div>

            <div class="form-group">
                <label>Duration (Minutes)</label>
                <input id="editDuration" type="number"
                    min="1" value="${quiz.duration}">
            </div>

            <button class="btn"
                onclick="updateQuiz(${id})">
                Save Changes
            </button>

            <button class="btn btn-secondary"
                onclick="closeModal()">
                Cancel
            </button>
        </div>
    `;
}

function updateQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) return;

    const title = document.getElementById("editTitle").value.trim();
    const category = document.getElementById("editCategory").value.trim();
    const description = document.getElementById("editDescription").value.trim();
    const duration = Number(document.getElementById("editDuration").value);

    if (!title || !category || !description || !duration || duration < 1) {
        showToast("Please complete all fields correctly.");
        return;
    }

    quiz.title = title;
    quiz.category = category;
    quiz.description = description;
    quiz.duration = duration;

    saveQuizzes();
    closeModal();
    renderAdmin();

    showToast("Quiz updated successfully!");
}

// ======================================
// DELETE QUIZ
// ======================================

function deleteQuiz(id) {
    if (!confirm("Are you sure you want to delete this quiz?")) {
        return;
    }

    quizzes = quizzes.filter(q => q.id !== id);

    saveQuizzes();
    renderAdmin();

    showToast("Quiz deleted successfully!");
}

// ======================================
// ADD QUESTIONS
// ======================================

function addQuestionForm(id) {
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) return;

    modal.innerHTML = `
        <div class="panel"
            style="max-width:650px;margin:30px auto">

            <h2>Add Question</h2>
            <p>${escapeHTML(quiz.title)}</p>
            <br>

            <div class="form-group">
                <label>Question</label>
                <textarea id="questionText"
                    placeholder="Enter your question"></textarea>
            </div>

            <div class="form-group">
                <label>Option A</label>
                <input id="optionA">
            </div>

            <div class="form-group">
                <label>Option B</label>
                <input id="optionB">
            </div>

            <div class="form-group">
                <label>Option C</label>
                <input id="optionC">
            </div>

            <div class="form-group">
                <label>Option D</label>
                <input id="optionD">
            </div>

            <div class="form-group">
                <label>Correct Answer</label>
                <select id="correctAnswer">
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                </select>
            </div>

            <div class="form-group">
                <label>Explanation</label>
                <textarea id="questionExplanation"
                    placeholder="Explain the correct answer"></textarea>
            </div>

            <button class="btn"
                onclick="saveQuestion(${id})">
                Save Question
            </button>

            <button class="btn btn-secondary"
                onclick="closeModal()">
                Cancel
            </button>
        </div>
    `;
}

function saveQuestion(id) {
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) return;

    const question = document.getElementById("questionText").value.trim();

    const options = [
        document.getElementById("optionA").value.trim(),
        document.getElementById("optionB").value.trim(),
        document.getElementById("optionC").value.trim(),
        document.getElementById("optionD").value.trim()
    ];

    const answer = Number(
        document.getElementById("correctAnswer").value
    );

    const explanation =
        document.getElementById("questionExplanation").value.trim();

    if (!question || options.some(option => !option)) {
        showToast("Please enter the question and all four options.");
        return;
    }

    quiz.questions.push({
        question,
        options,
        answer,
        explanation
    });

    saveQuizzes();

    closeModal();
    renderAdmin();

    showToast("Question added successfully!");
}

// ======================================
// MODAL
// ======================================

function closeModal() {
    modal.innerHTML = "";
}

// ======================================
// SEARCH
// ======================================

document.getElementById("searchInput").addEventListener("input", e => {
    const search = e.target.value.trim();

    currentPage = "explore";

    document.getElementById("pageTitle").textContent = "Search Results";

    renderExplore(search);
});

// ======================================
// MOBILE MENU
// ======================================

document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

// ======================================
// SAFE HTML HELPERS
// ======================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function escapeJS(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ======================================
// INITIALIZE APPLICATION
// ======================================

renderHome();
alert("JavaScript Connected Successfully!");