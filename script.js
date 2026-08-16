

const STORAGE_KEY = "math_fluency_intervention_v3";


function createDefaultState() {

    const facts = {};

    for (let i = 2; i <= 9; i++) {
        facts[i] = {
            correct: 0,
            attempts: 0
        };
    }

    return {
        studentName: "",
        preTest: null,
        postTest: null,
        practiceSessions: 0,
        bestStreak: 0,
        facts: facts,
        history: []
    };
}


function loadState() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return createDefaultState();
        }

        const parsed =
            JSON.parse(saved);

        const defaultState =
            createDefaultState();

        return {
            ...defaultState,
            ...parsed,
            facts: {
                ...defaultState.facts,
                ...(parsed.facts || {})
            },
            history:
                Array.isArray(parsed.history)
                    ? parsed.history
                    : []
        };

    } catch (error) {

        console.error(
            "Could not load saved data:",
            error
        );

        return createDefaultState();
    }
}


let state = loadState();


function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            "Could not save data:",
            error
        );
    }

    updateDashboard();
}


/* =========================================================
   ELEMENT HELPER
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.classList.remove("active");

    });

    const target =
        getElement(screenId);

    if (target) {

        target.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const studentPill =
        getElement("studentPill");

    const dashboard =
        getElement("dashboard");

    const studentInput =
        getElement("studentNameInput");

    const welcomeText =
        getElement("welcomeText");

    const preScore =
        getElement("preScore");

    const postScore =
        getElement("postScore");

    const practiceCount =
        getElement("practiceCount");

    const bestStreak =
        getElement("bestStreak");


    if (studentPill) {

        studentPill.textContent =
            state.studentName || "No Student";

    }


    if (studentInput) {

        studentInput.value =
            state.studentName || "";

    }


    if (!state.studentName) {

        if (dashboard) {
            dashboard.classList.add("hidden");
        }

        return;
    }


    if (dashboard) {
        dashboard.classList.remove("hidden");
    }


    if (welcomeText) {

        welcomeText.textContent =
            `Welcome, ${state.studentName}!`;

    }


    if (preScore) {

        preScore.textContent =
            state.preTest
                ? `${state.preTest.score}/${state.preTest.total}`
                : "—";

    }


    if (postScore) {

        postScore.textContent =
            state.postTest
                ? `${state.postTest.score}/${state.postTest.total}`
                : "—";

    }


    if (practiceCount) {

        practiceCount.textContent =
            state.practiceSessions;

    }


    if (bestStreak) {

        bestStreak.textContent =
            state.bestStreak;

    }
}


/* =========================================================
   STUDENT START
   ========================================================= */

function startStudent() {

    const input =
        getElement("studentNameInput");

    if (!input) {

        console.error(
            "studentNameInput was not found."
        );

        return;
    }


    const name =
        input.value.trim();


    if (!name) {

        alert(
            "Please enter the student's name first."
        );

        input.focus();

        return;
    }


    state.studentName =
        name;


    saveState();


    updateDashboard();


    alert(
        `Welcome, ${name}!`
    );

}


/* =========================================================
   RANDOM FUNCTIONS
   ========================================================= */

function randomInt(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


function shuffle(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }


    return result;
}


/* =========================================================
   QUESTION GENERATOR
   ========================================================= */

function createQuestion(
    multiplier = null
) {

    const a =
        multiplier ||
        randomInt(2, 9);

    const b =
        randomInt(2, 9);


    return {

        a: a,

        b: b,

        answer:
            a * b

    };
}


/* =========================================================
   ANSWER CHOICES
   ========================================================= */

function createChoices(answer) {

    const choices =
        new Set();


    choices.add(answer);


    while (choices.size < 4) {

        let wrong =
            answer +
            randomInt(-15, 15);


        if (
            wrong > 0 &&
            wrong <= 81 &&
            wrong !== answer
        ) {

            choices.add(wrong);

        }
    }


    return shuffle(
        [...choices]
    );
}


/* =========================================================
   RECORD MULTIPLICATION FACT
   ========================================================= */

function recordFact(
    multiplier,
    correct
) {

    if (!state.facts[multiplier]) {

        state.facts[multiplier] = {
            correct: 0,
            attempts: 0
        };

    }


    state.facts[multiplier]
        .attempts++;


    if (correct) {

        state.facts[multiplier]
            .correct++;

    }
}


/* =========================================================
   FIND WEAK TABLES
   ========================================================= */

function getWeakTables() {

    const tables = [];


    for (
        let i = 2;
        i <= 9;
        i++
    ) {

        const fact =
            state.facts[i];


        let accuracy = 0;


        if (fact.attempts > 0) {

            accuracy =
                fact.correct /
                fact.attempts;

        }


        tables.push({

            number: i,

            priority:
                fact.attempts === 0
                    ? 0.5
                    : 1 - accuracy

        });

    }


    tables.sort(
        (a, b) =>
            b.priority -
            a.priority
    );


    return tables.map(
        item => item.number
    );
}


/* =========================================================
   STRATEGIES
   ========================================================= */

const strategies = {

    2: {
        title:
            "Use doubles.",

        text:
            "For example, 2 × 6 means 6 + 6 = 12."
    },

    3: {
        title:
            "Think in groups of three.",

        text:
            "For example, 3 × 4 means 4 + 4 + 4 = 12."
    },

    4: {
        title:
            "Double twice.",

        text:
            "For example, 4 × 6: double 6 to get 12, then double 12 to get 24."
    },

    5: {
        title:
            "Think of five as half of ten.",

        text:
            "For example, 5 × 6 is half of 10 × 6."
    },

    6: {
        title:
            "Break the fact apart.",

        text:
            "For example, 6 × 7 = 5 × 7 + 1 × 7."
    },

    7: {
        title:
            "Use facts you already know.",

        text:
            "For example, 7 × 8 = 5 × 8 + 2 × 8."
    },

    8: {
        title:
            "Double three times.",

        text:
            "For example, 8 × 4 → 16 → 32."
    },

    9: {
        title:
            "Use the ten-times fact.",

        text:
            "For example, 9 × 7 = 10 × 7 − 1 × 7."
    }

};


/* =========================================================
   QUIZ VARIABLES
   ========================================================= */

let quiz = null;


/* =========================================================
   START QUIZ
   ========================================================= */

function startQuiz(mode) {

    if (!state.studentName) {

        alert(
            "Please enter the student's name first."
        );

        showScreen("homeScreen");

        return;
    }


    let total = 10;


    if (
        mode === "pre" ||
        mode === "post"
    ) {

        total = 20;

    }


    quiz = {

        mode: mode,

        total: total,

        current: 0,

        score: 0,

        streak: 0,

        bestStreak: 0,

        answered: false,

        questions: []

    };


    /* -----------------------------------------
       CREATE QUESTIONS
    ----------------------------------------- */

    if (mode === "practice") {

        const weakTables =
            getWeakTables();


        for (
            let i = 0;
            i < total;
            i++
        ) {

            const multiplier =
                weakTables[
                    i % weakTables.length
                ];


            quiz.questions.push(
                createQuestion(
                    multiplier
                )
            );

        }


        const mainTable =
            weakTables[0];


        const strategy =
            strategies[mainTable];


        if (strategy) {

            const title =
                getElement(
                    "strategyTitle"
                );

            const text =
                getElement(
                    "strategyText"
                );


            if (title) {
                title.textContent =
                    strategy.title;
            }


            if (text) {
                text.textContent =
                    strategy.text;
            }

        }


        showScreen(
            "practiceScreen"
        );


        renderPracticeQuestion();


        return;
    }


    /* -----------------------------------------
       PRE / POST / GAME QUESTIONS
    ----------------------------------------- */

    for (
        let i = 0;
        i < total;
        i++
    ) {

        quiz.questions.push(
            createQuestion()
        );

    }


    if (
        mode === "pre"
    ) {

        const title =
            getElement(
                "assessmentTitle"
            );


        if (title) {

            title.textContent =
                "Pre-Test";

        }


        showScreen(
            "assessmentScreen"
        );

    }


    else if (
        mode === "post"
    ) {

        const title =
            getElement(
                "assessmentTitle"
            );


        if (title) {

            title.textContent =
                "Post-Test";

        }


        showScreen(
            "assessmentScreen"
        );

    }


    else if (
        mode === "game"
    ) {

        showScreen(
            "gameScreen"
        );

    }


    renderStandardQuestion();

}


/* =========================================================
   RENDER STANDARD QUESTION
   ========================================================= */

function renderStandardQuestion() {

    if (!quiz) {
        return;
    }


    const question =
        quiz.questions[
            quiz.current
        ];


    if (!question) {
        return;
    }


    const isGame =
        quiz.mode === "game";


    const questionElement =
        isGame
            ? getElement("gameQuestion")
            : getElement("questionText");


    const choicesElement =
        isGame
            ? getElement("gameChoices")
            : getElement("answerChoices");


    if (!questionElement ||
        !choicesElement) {

        console.error(
            "Quiz elements are missing from HTML."
        );

        return;
    }


    questionElement.textContent =
        `${question.a} × ${question.b} = ?`;


    choicesElement.innerHTML = "";


    const choices =
        createChoices(
            question.answer
        );


    choices.forEach(
        value => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "choice";


            button.textContent =
                value;


            button.addEventListener(
                "click",
                function () {

                    answerStandard(
                        value,
                        button
                    );

                }
            );


            choicesElement.appendChild(
                button
            );

        }
    );


    const progressText =
        `Question ${
            quiz.current + 1
        } of ${quiz.total}`;


    if (isGame) {

        const progress =
            getElement(
                "gameProgress"
            );


        const score =
            getElement(
                "gameScoreLive"
            );


        const bar =
            getElement(
                "gameProgressBar"
            );


        if (progress) {
            progress.textContent =
                progressText;
        }


        if (score) {
            score.textContent =
                `Score: ${quiz.score}`;
        }


        if (bar) {

            bar.style.width =
                `${(
                    quiz.current /
                    quiz.total
                ) * 100}%`;

        }


        const feedback =
            getElement(
                "gameFeedback"
            );


        if (feedback) {

            feedback.className =
                "feedback hidden";

        }


        const next =
            getElement(
                "nextGameBtn"
            );


        if (next) {

            next.classList.add(
                "hidden"
            );

        }

    } else {

        const progress =
            getElement(
                "quizProgress"
            );


        const score =
            getElement(
                "quizScoreLive"
            );


        const bar =
            getElement(
                "quizProgressBar"
            );


        if (progress) {
            progress.textContent =
                progressText;
        }


        if (score) {
            score.textContent =
                `Score: ${quiz.score}`;
        }


        if (bar) {

            bar.style.width =
                `${(
                    quiz.current /
                    quiz.total
                ) * 100}%`;

        }


        const feedback =
            getElement(
                "feedback"
            );


        if (feedback) {

            feedback.className =
                "feedback hidden";

        }


        const next =
            getElement(
                "nextQuestionBtn"
            );


        if (next) {

            next.classList.add(
                "hidden"
            );

        }

    }


    quiz.answered =
        false;
}


/* =========================================================
   ANSWER STANDARD
   ========================================================= */

function answerStandard(
    selectedValue,
    selectedButton
) {

    if (!quiz) {
        return;
    }


    if (quiz.answered) {
        return;
    }


    quiz.answered =
        true;


    const question =
        quiz.questions[
            quiz.current
        ];


    const correct =
        selectedValue ===
        question.answer;


    recordFact(
        question.a,
        correct
    );


    if (correct) {

        quiz.score++;

        quiz.streak++;

        quiz.bestStreak =
            Math.max(
                quiz.bestStreak,
                quiz.streak
            );

    } else {

        quiz.streak = 0;

    }


    const isGame =
        quiz.mode === "game";


    const choicesElement =
        isGame
            ? getElement("gameChoices")
            : getElement("answerChoices");


    if (choicesElement) {

        const buttons =
            choicesElement
                .querySelectorAll(
                    ".choice"
                );


        buttons.forEach(
            button => {

                button.disabled =
                    true;


                const value =
                    Number(
                        button.textContent
                    );


                if (
                    value ===
                    question.answer
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }
        );

    }


    if (!correct &&
        selectedButton) {

        selectedButton.classList.add(
            "wrong"
        );

    }


    const feedback =
        isGame
            ? getElement(
                "gameFeedback"
            )
            : getElement(
                "feedback"
            );


    if (feedback) {

        feedback.className =
            `feedback ${
                correct
                    ? "correct"
                    : "wrong"
            }`;


        feedback.textContent =
            correct
                ? "Correct! Great job!"
                : `Not quite. The correct answer is ${question.answer}.`;

    }


    const next =
        isGame
            ? getElement(
                "nextGameBtn"
            )
            : getElement(
                "nextQuestionBtn"
            );


    if (next) {

        next.textContent =
            quiz.current ===
            quiz.total - 1
                ? "Finish"
                : "Next Question";


        next.classList.remove(
            "hidden"
        );

    }


    saveState();
}


/* =========================================================
   RENDER PRACTICE
   ========================================================= */

function renderPracticeQuestion() {

    if (!quiz) {
        return;
    }


    const question =
        quiz.questions[
            quiz.current
        ];


    if (!question) {
        return;
    }


    const questionElement =
        getElement(
            "practiceQuestion"
        );


    const choicesElement =
        getElement(
            "practiceChoices"
        );


    if (!questionElement ||
        !choicesElement) {

        console.error(
            "Practice elements are missing."
        );

        return;
    }


    questionElement.textContent =
        `${question.a} × ${question.b} = ?`;


    choicesElement.innerHTML = "";


    createChoices(
        question.answer
    ).forEach(
        value => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "choice";


            button.textContent =
                value;


            button.addEventListener(
                "click",
                function () {

                    answerPractice(
                        value,
                        button
                    );

                }
            );


            choicesElement.appendChild(
                button
            );

        }
    );


    const progress =
        getElement(
            "practiceProgress"
        );


    if (progress) {

        progress.textContent =
            `Question ${
                quiz.current + 1
            } of ${quiz.total}`;

    }


    const streak =
        getElement(
            "practiceStreak"
        );


    if (streak) {

        streak.textContent =
            `Streak: ${quiz.streak}`;

    }


    const bar =
        getElement(
            "practiceProgressBar"
        );


    if (bar) {

        bar.style.width =
            `${(
                quiz.current /
                quiz.total
            ) * 100}%`;

    }


    const feedback =
        getElement(
            "practiceFeedback"
        );


    if (feedback) {

        feedback.className =
            "feedback hidden";

    }


    const next =
        getElement(
            "nextPracticeBtn"
        );


    if (next) {

        next.classList.add(
            "hidden"
        );

    }


    quiz.answered =
        false;
}


/* =========================================================
   ANSWER PRACTICE
   ========================================================= */

function answerPractice(
    selectedValue,
    selectedButton
) {

    if (!quiz) {
        return;
    }


    if (quiz.answered) {
        return;
    }


    quiz.answered =
        true;


    const question =
        quiz.questions[
            quiz.current
        ];


    const correct =
        selectedValue ===
        question.answer;


    recordFact(
        question.a,
        correct
    );


    if (correct) {

        quiz.score++;

        quiz.streak++;

        quiz.bestStreak =
            Math.max(
                quiz.bestStreak,
                quiz.streak
            );

    } else {

        quiz.streak = 0;

    }


    const choices =
        getElement(
            "practiceChoices"
        );


    if (choices) {

        const buttons =
            choices.querySelectorAll(
                ".choice"
            );


        buttons.forEach(
            button => {

                button.disabled =
                    true;


                if (
                    Number(
                        button.textContent
                    ) ===
                    question.answer
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }
        );

    }


    if (!correct &&
        selectedButton) {

        selectedButton.classList.add(
            "wrong"
        );

    }


    const feedback =
        getElement(
            "practiceFeedback"
        );


    if (feedback) {

        feedback.className =
            `feedback ${
                correct
                    ? "correct"
                    : "wrong"
            }`;


        feedback.textContent =
            correct
                ? `Correct! Streak: ${quiz.streak}.`
                : `The correct answer is ${question.answer}. Keep practicing!`;

    }


    const streak =
        getElement(
            "practiceStreak"
        );


    if (streak) {

        streak.textContent =
            `Streak: ${quiz.streak}`;

    }


    const next =
        getElement(
            "nextPracticeBtn"
        );


    if (next) {

        next.textContent =
            quiz.current ===
            quiz.total - 1
                ? "Finish Practice"
                : "Next Question";


        next.classList.remove(
            "hidden"
        );

    }


    saveState();
}


/* =========================================================
   NEXT QUESTION / FINISH
   ========================================================= */

function nextQuestion() {

    if (!quiz) {

        console.error(
            "There is no active quiz."
        );

        return;
    }


    if (!quiz.answered) {

        return;
    }


    /* -----------------------------------------
       THIS IS THE IMPORTANT PART
       ----------------------------------------- */

    if (
        quiz.current >=
        quiz.total - 1
    ) {

        finishQuiz();

        return;
    }


    quiz.current++;


    if (
        quiz.mode === "practice"
    ) {

        renderPracticeQuestion();

    } else {

        renderStandardQuestion();

    }
}


/* =========================================================
   FINISH QUIZ
   ========================================================= */

function finishQuiz() {

    if (!quiz) {
        return;
    }


    const score =
        quiz.score;


    const total =
        quiz.total;


    const percent =
        Math.round(
            (
                score /
                total
            ) * 100
        );


    state.bestStreak =
        Math.max(
            state.bestStreak,
            quiz.bestStreak
        );


    const date =
        new Date()
            .toISOString();


    /* -----------------------------------------
       PRE TEST
       ----------------------------------------- */

    if (
        quiz.mode === "pre"
    ) {

        state.preTest = {

            score: score,

            total: total,

            percent: percent,

            date: date

        };

    }


    /* -----------------------------------------
       POST TEST
       ----------------------------------------- */

    if (
        quiz.mode === "post"
    ) {

        state.postTest = {

            score: score,

            total: total,

            percent: percent,

            date: date

        };

    }


    /* -----------------------------------------
       PRACTICE
       ----------------------------------------- */

    if (
        quiz.mode === "practice"
    ) {

        state.practiceSessions++;

    }


    /* -----------------------------------------
       HISTORY
       ----------------------------------------- */

    state.history.push({

        mode:
            quiz.mode,

        score:
            score,

        total:
            total,

        percent:
            percent,

        date:
            date

    });


    saveState();


    /* -----------------------------------------
       RESULT SCREEN
       ----------------------------------------- */

    const resultScore =
        getElement(
            "resultScore"
        );


    if (resultScore) {

        resultScore.textContent =
            `${score} / ${total}`;

    }


    const resultIcon =
        getElement(
            "resultIcon"
        );


    const eyebrow =
        getElement(
            "resultEyebrow"
        );


    const title =
        getElement(
            "resultTitle"
        );


    const message =
        getElement(
            "resultMessage"
        );


    if (
        quiz.mode === "pre"
    ) {

        if (resultIcon)
            resultIcon.textContent =
                "📝";

        if (eyebrow)
            eyebrow.textContent =
                "PRE-TEST COMPLETE";

        if (title)
            title.textContent =
                "Pre-Test Complete!";

        if (message)
            message.textContent =
                `The student scored ${percent}%.`;

    }


    else if (
        quiz.mode === "post"
    ) {

        if (resultIcon)
            resultIcon.textContent =
                "📈";

        if (eyebrow)
            eyebrow.textContent =
                "POST-TEST COMPLETE";

        if (title)
            title.textContent =
                "Post-Test Complete!";

        if (message)
            message.textContent =
                `The student scored ${percent}% after the intervention.`;

    }


    else if (
        quiz.mode === "practice"
    ) {

        if (resultIcon)
            resultIcon.textContent =
                "⭐";

        if (eyebrow)
            eyebrow.textContent =
                "INTERVENTION COMPLETE";

        if (title)
            title.textContent =
                "Practice Complete!";

        if (message)
            message.textContent =
                `The student answered ${score} out of ${total} correctly.`;

    }


    else {

        if (resultIcon)
            resultIcon.textContent =
                "🎮";

        if (eyebrow)
            eyebrow.textContent =
                "GAME COMPLETE";

        if (title)
            title.textContent =
                "Challenge Complete!";

        if (message)
            message.textContent =
                `The student answered ${score} out of ${total} correctly.`;

    }


    quiz = null;


    showScreen(
        "resultScreen"
    );
}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress() {

    const progressPre =
        getElement(
            "progressPre"
        );


    const progressPost =
        getElement(
            "progressPost"
        );


    const progressDelta =
        getElement(
            "progressDelta"
        );


    const improvementText =
        getElement(
            "improvementText"
        );


    if (progressPre) {

        progressPre.textContent =
            state.preTest
                ? `${state.preTest.score}/${state.preTest.total} (${state.preTest.percent}%)`
                : "—";

    }


    if (progressPost) {

        progressPost.textContent =
            state.postTest
                ? `${state.postTest.score}/${state.postTest.total} (${state.postTest.percent}%)`
                : "—";

    }


    if (
        state.preTest &&
        state.postTest
    ) {

        const difference =
            state.postTest.percent -
            state.preTest.percent;


        const sign =
            difference >= 0
                ? "+"
                : "";


        if (progressDelta) {

            progressDelta.textContent =
                `${sign}${difference}%`;

        }


        if (improvementText) {

            improvementText.textContent =
                `${state.preTest.percent}% → ${state.postTest.percent}% (${sign}${difference} percentage points)`;

        }

    } else {

        if (progressDelta) {

            progressDelta.textContent =
                "—";

        }


        if (improvementText) {

            improvementText.textContent =
                "Complete both the pre-test and post-test to see improvement.";

        }

    }


    renderSkills();
}


/* =========================================================
   SKILLS
   ========================================================= */

function renderSkills() {

    const container =
        getElement(
            "progressSkills"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    for (
        let i = 2;
        i <= 9;
        i++
    ) {

        const fact =
            state.facts[i];


        const accuracy =
            fact.attempts > 0
                ? Math.round(
                    (
                        fact.correct /
                        fact.attempts
                    ) * 100
                )
                : 0;


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "skill-row";


        row.innerHTML = `

            <span class="skill-name">
                ×${i}
            </span>

            <div class="skill-track">

                <div
                    class="skill-fill"
                    style="width:${accuracy}%"
                ></div>

            </div>

            <span class="skill-percent">
                ${accuracy}%
            </span>

        `;


        container.appendChild(
            row
        );

    }
}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* =========================================================
   PDF EXPORT
   ========================================================= */

function exportPDF() {

    if (!state.studentName) {

        alert(
            "Please enter a student first."
        );

        return;
    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        alert(
            "PDF library not found. Make sure jsPDF is inside the libs folder."
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF();


    const pageWidth =
        doc.internal.pageSize.getWidth();


    const pageHeight =
        doc.internal.pageSize.getHeight();


    const margin = 18;


    let y = 20;


    /* -----------------------------------------
       HEADER
       ----------------------------------------- */

    doc.setFillColor(
        37,
        99,
        235
    );


    doc.rect(
        0,
        0,
        pageWidth,
        35,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        20
    );


    doc.text(
        "MATH FLUENCY",
        margin,
        15
    );


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        10
    );


    doc.text(
        "Student Progress Report",
        margin,
        24
    );


    y = 48;


    /* -----------------------------------------
       STUDENT
       ----------------------------------------- */

    doc.setTextColor(
        30,
        41,
        59
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        14
    );


    doc.text(
        "Student Information",
        margin,
        y
    );


    y += 9;


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        11
    );


    doc.text(
        `Student Name: ${state.studentName}`,
        margin,
        y
    );


    y += 7;


    doc.text(
        `Report Date: ${formatDate(new Date())}`,
        margin,
        y
    );


    y += 14;


    /* -----------------------------------------
       ASSESSMENT
       ----------------------------------------- */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        14
    );


    doc.text(
        "Assessment Results",
        margin,
        y
    );


    y += 8;


    drawPDFTableHeader(
        doc,
        margin,
        y,
        [
            "Assessment",
            "Score",
            "Percentage"
        ],
        [
            70,
            55,
            50
        ]
    );


    y += 9;


    if (state.preTest) {

        y = drawPDFTableRow(
            doc,
            margin,
            y,
            [
                "Pre-Test",
                `${state.preTest.score}/${state.preTest.total}`,
                `${state.preTest.percent}%`
            ],
            [
                70,
                55,
                50
            ]
        );

    } else {

        y = drawPDFTableRow(
            doc,
            margin,
            y,
            [
                "Pre-Test",
                "Not completed",
                "—"
            ],
            [
                70,
                55,
                50
            ]
        );

    }


    if (state.postTest) {

        y = drawPDFTableRow(
            doc,
            margin,
            y,
            [
                "Post-Test",
                `${state.postTest.score}/${state.postTest.total}`,
                `${state.postTest.percent}%`
            ],
            [
                70,
                55,
                50
            ]
        );

    } else {

        y = drawPDFTableRow(
            doc,
            margin,
            y,
            [
                "Post-Test",
                "Not completed",
                "—"
            ],
            [
                70,
                55,
                50
            ]
        );

    }


    let improvement =
        "—";


    if (
        state.preTest &&
        state.postTest
    ) {

        const difference =
            state.postTest.percent -
            state.preTest.percent;


        improvement =
            `${difference >= 0 ? "+" : ""}${difference}%`;

    }


    y = drawPDFTableRow(
        doc,
        margin,
        y,
        [
            "Improvement",
            "",
            improvement
        ],
        [
            70,
            55,
            50
        ]
    );


    y += 14;


    /* -----------------------------------------
       MULTIPLICATION SKILLS
       ----------------------------------------- */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        14
    );


    doc.text(
        "Multiplication Fact Accuracy",
        margin,
        y
    );


    y += 8;


    drawPDFTableHeader(
        doc,
        margin,
        y,
        [
            "Table",
            "Correct",
            "Attempts",
            "Accuracy"
        ],
        [
            55,
            40,
            40,
            40
        ]
    );


    y += 9;


    for (
        let i = 2;
        i <= 9;
        i++
    ) {

        const fact =
            state.facts[i];


        const accuracy =
            fact.attempts > 0
                ? Math.round(
                    (
                        fact.correct /
                        fact.attempts
                    ) * 100
                )
                : 0;


        y = drawPDFTableRow(
            doc,
            margin,
            y,
            [
                `×${i}`,
                fact.correct,
                fact.attempts,
                `${accuracy}%`
            ],
            [
                55,
                40,
                40,
                40
            ]
        );

    }


    y += 14;


    /* -----------------------------------------
       INTERVENTION
       ----------------------------------------- */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        14
    );


    doc.text(
        "Intervention Activity",
        margin,
        y
    );


    y += 9;


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        11
    );


    doc.text(
        `Practice Sessions: ${state.practiceSessions}`,
        margin,
        y
    );


    y += 7;


    doc.text(
        `Best Answer Streak: ${state.bestStreak}`,
        margin,
        y
    );


    y += 15;


    /* -----------------------------------------
       OVERALL RESULT
       ----------------------------------------- */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        14
    );


    doc.text(
        "Overall Result",
        margin,
        y
    );


    y += 9;


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        11
    );


    let resultText;


    if (
        state.preTest &&
        state.postTest
    ) {

        const difference =
            state.postTest.percent -
            state.preTest.percent;


        if (difference > 0) {

            resultText =
                `The student improved from ${state.preTest.percent}% in the pre-test to ${state.postTest.percent}% in the post-test, showing an improvement of ${difference} percentage points.`;

        } else if (
            difference === 0
        ) {

            resultText =
                `The student's pre-test and post-test scores were both ${state.preTest.percent}%.`;

        } else {

            resultText =
                `The student's post-test score was ${Math.abs(difference)} percentage points lower than the pre-test score.`;

        }

    } else {

        resultText =
            "A complete comparison will be available after both the pre-test and post-test are completed.";

    }


    const wrapped =
        doc.splitTextToSize(
            resultText,
            pageWidth -
            margin * 2
        );


    doc.text(
        wrapped,
        margin,
        y
    );


    /* -----------------------------------------
       FOOTER
       ----------------------------------------- */

    doc.setFontSize(
        8
    );


    doc.setTextColor(
        100,
        100,
        100
    );


    doc.text(
        "Generated by Math Fluency Intervention App — Offline",
        margin,
        pageHeight - 10
    );


    /* -----------------------------------------
       DOWNLOAD
       ----------------------------------------- */

    const safeName =
        state.studentName
            .replace(
                /[^a-z0-9]+/gi,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );


    doc.save(
        `${safeName || "student"}_math_fluency_report.pdf`
    );

}


/* =========================================================
   PDF TABLE FUNCTIONS
   ========================================================= */

function drawPDFTableHeader(
    doc,
    x,
    y,
    columns,
    widths
) {

    let currentX = x;


    doc.setFillColor(
        37,
        99,
        235
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        9
    );


    columns.forEach(
        (column, index) => {

            doc.rect(
                currentX,
                y - 6,
                widths[index],
                9,
                "F"
            );


            doc.text(
                String(column),
                currentX + 3,
                y
            );


            currentX +=
                widths[index];

        }
    );


    doc.setTextColor(
        30,
        41,
        59
    );
}


function drawPDFTableRow(
    doc,
    x,
    y,
    values,
    widths
) {

    let currentX = x;


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        9
    );


    values.forEach(
        (value, index) => {

            doc.setDrawColor(
                220,
                225,
                232
            );


            doc.rect(
                currentX,
                y - 6,
                widths[index],
                9
            );


            doc.text(
                String(value),
                currentX + 3,
                y
            );


            currentX +=
                widths[index];

        }
    );


    return y + 9;
}


/* =========================================================
   CSV EXPORT
   ========================================================= */

function exportCSV() {

    if (!state.studentName) {

        alert(
            "Please enter the student's name first."
        );

        return;
    }


    const rows = [];


    rows.push([
        "Student Name",
        state.studentName
    ]);


    rows.push([]);


    rows.push([
        "Assessment",
        "Score",
        "Total",
        "Percentage"
    ]);


    if (state.preTest) {

        rows.push([
            "Pre-Test",
            state.preTest.score,
            state.preTest.total,
            `${state.preTest.percent}%`
        ]);

    }


    if (state.postTest) {

        rows.push([
            "Post-Test",
            state.postTest.score,
            state.postTest.total,
            `${state.postTest.percent}%`
        ]);

    }


    rows.push([]);


    rows.push([
        "Multiplication Table",
        "Correct",
        "Attempts",
        "Accuracy"
    ]);


    for (
        let i = 2;
        i <= 9;
        i++
    ) {

        const fact =
            state.facts[i];


        const accuracy =
            fact.attempts > 0
                ? Math.round(
                    (
                        fact.correct /
                        fact.attempts
                    ) * 100
                )
                : 0;


        rows.push([
            `×${i}`,
            fact.correct,
            fact.attempts,
            `${accuracy}%`
        ]);

    }


    rows.push([]);


    rows.push([
        "Practice Sessions",
        state.practiceSessions
    ]);


    rows.push([
        "Best Streak",
        state.bestStreak
    ]);


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(value)
                                    .replace(
                                        /"/g,
                                        '""'
                                    )}"`
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `${state.studentName.replace(
            /[^a-z0-9]+/gi,
            "_"
        )}_math_fluency_data.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        100
    );
}


/* =========================================================
   RESET
   ========================================================= */

function resetStudent() {

    const confirmed =
        confirm(
            "Are you sure you want to delete this student's data?"
        );


    if (!confirmed) {
        return;
    }


    state =
        createDefaultState();


    localStorage.removeItem(
        STORAGE_KEY
    );


    updateDashboard();


    updateProgress();


    showScreen(
        "homeScreen"
    );

}


/* =========================================================
   CONNECT BUTTONS
   ========================================================= */

function setupButtons() {

    /* START */

    const startButton =
        getElement(
            "saveStudentBtn"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            startStudent
        );

    }


    /* PRE-TEST */

    const assessmentButton =
        getElement(
            "assessmentBtn"
        );


    if (assessmentButton) {

        assessmentButton.addEventListener(
            "click",
            () =>
                startQuiz("pre")
        );

    }


    /* PRACTICE */

    const practiceButton =
        getElement(
            "practiceBtn"
        );


    if (practiceButton) {

        practiceButton.addEventListener(
            "click",
            () =>
                startQuiz("practice")
        );

    }


    /* POST TEST */

    const postTestButton =
        getElement(
            "postTestBtn"
        );


    if (postTestButton) {

        postTestButton.addEventListener(
            "click",
            () =>
                startQuiz("post")
        );

    }


    /* GAME */

    const gameButton =
        getElement(
            "gameBtn"
        );


    if (gameButton) {

        gameButton.addEventListener(
            "click",
            () =>
                startQuiz("game")
        );

    }


    /* PROGRESS */

    const progressButton =
        getElement(
            "progressBtn"
        );


    if (progressButton) {

        progressButton.addEventListener(
            "click",
            () => {

                if (!state.studentName) {

                    alert(
                        "Please enter a student first."
                    );

                    return;
                }


                updateProgress();


                showScreen(
                    "progressScreen"
                );

            }
        );

    }


    /* NEXT STANDARD */

    const nextQuestionButton =
        getElement(
            "nextQuestionBtn"
        );


    if (nextQuestionButton) {

        nextQuestionButton.addEventListener(
            "click",
            nextQuestion
        );

    }


    /* NEXT PRACTICE */

    const nextPracticeButton =
        getElement(
            "nextPracticeBtn"
        );


    if (nextPracticeButton) {

        nextPracticeButton.addEventListener(
            "click",
            nextQuestion
        );

    }


    /* NEXT GAME */

    const nextGameButton =
        getElement(
            "nextGameBtn"
        );


    if (nextGameButton) {

        nextGameButton.addEventListener(
            "click",
            nextQuestion
        );

    }


    /* RESULT HOME */

    const resultHomeButton =
        getElement(
            "resultHomeBtn"
        );


    if (resultHomeButton) {

        resultHomeButton.addEventListener(
            "click",
            () => {

                updateDashboard();

                showScreen(
                    "homeScreen"
                );

            }
        );

    }


    /* BACK HOME BUTTONS */

    document
        .querySelectorAll(
            ".backHome"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        updateDashboard();

                        showScreen(
                            "homeScreen"
                        );

                    }
                );

            }
        );


    /* CHANGE STUDENT */

    const changeStudentButton =
        getElement(
            "changeStudentBtn"
        );


    if (changeStudentButton) {

        changeStudentButton.addEventListener(
            "click",
            () => {

                const input =
                    getElement(
                        "studentNameInput"
                    );


                if (input) {

                    input.focus();

                    input.select();

                }

            }
        );

    }


    /* PDF */

    const pdfButton =
        getElement(
            "exportPdfBtn"
        );


    if (pdfButton) {

        pdfButton.addEventListener(
            "click",
            exportPDF
        );

    }


    /* CSV */

    const csvButton =
        getElement(
            "exportCsvBtn"
        );


    if (csvButton) {

        csvButton.addEventListener(
            "click",
            exportCSV
        );

    }


    /* RESET */

    const resetButton =
        getElement(
            "resetBtn"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetStudent
        );

    }
}


/* =========================================================
   ENTER KEY FOR STUDENT NAME
   ========================================================= */

function setupKeyboard() {

    const input =
        getElement(
            "studentNameInput"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                startStudent();

            }

        }
    );
}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

function initializeApp() {

    console.log(
        "Math Fluency Intervention App loaded."
    );


    setupButtons();


    setupKeyboard();


    updateDashboard();


    updateProgress();


    showScreen(
        "homeScreen"
    );
}


/* =========================================================
   START APP AFTER HTML LOADS
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}
