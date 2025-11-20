// Simple math quiz with multiple topics, choices, progress, dark mode.
// Copy this to script.js

// State
let num1 = 0, num2 = 0;
let correctAnswer = null;
let score = 0, streak = 0, xp = 0;

// Elements
const questionEl = document.getElementById('question');
const choicesEl  = document.getElementById('choices');
const answerInput = document.getElementById('answerInput');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const xpEl = document.getElementById('xp');
const topicSelect = document.getElementById('topicSelect');
const darkToggle = document.getElementById('darkModeToggle');
const submitBtn = document.getElementById('submitBtn');
const newBtn = document.getElementById('newBtn');

// Helpers
function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function setQuestion(text){ questionEl.textContent = `What is ${text}?`; }

// Create a new question based on topic
function newQuestion(){
  const topic = topicSelect.value;
  choicesEl.innerHTML = '';
  answerInput.value = '';
  feedbackEl.textContent = '';
  feedbackEl.style.color = '';

  // default numbers
  num1 = randInt(1, 20);
  num2 = randInt(1, 20);

  switch(topic){
    case 'add':
      correctAnswer = num1 + num2;
      setQuestion(`${num1} + ${num2}`);
      break;
    case 'sub':
      // ensure non-negative result
      if(num2 > num1) [num1, num2] = [num2, num1];
      correctAnswer = num1 - num2;
      setQuestion(`${num1} - ${num2}`);
      break;
    case 'mul':
      correctAnswer = num1 * num2;
      setQuestion(`${num1} × ${num2}`);
      break;
    case 'div':
      // make divisible
      num2 = randInt(1, 12);
      const factor = randInt(1, 12);
      num1 = num2 * factor;
      correctAnswer = num1 / num2;
      setQuestion(`${num1} ÷ ${num2}`);
      break;
    case 'sqrt':
      // perfect square
      const root = randInt(1, 15);
      num1 = root * root;
      correctAnswer = root;
      setQuestion(`√${num1}`);
      break;
    case 'fractions':
      // show division rounded to 2 decimals
      num2 = randInt(2, 12);
      num1 = randInt(1, 30);
      correctAnswer = Number((num1 / num2).toFixed(2));
      setQuestion(`${num1} ÷ ${num2} (rounded to 2 decimals)`);
      break;
    default:
      correctAnswer = num1 + num2;
      setQuestion(`${num1} + ${num2}`);
  }

  generateChoices(correctAnswer);
}

// Generate 4 choices (one correct + 3 distractors). If topic is suited for input only, choices still shown.
function generateChoices(answer){
  const answers = new Set();
  answers.add(Number(answer));

  // create distractors around the answer
  while(answers.size < 4){
    let delta;
    if (Math.abs(answer) < 10) delta = randInt(-5, 5);
    else delta = randInt(-Math.round(Math.abs(answer)*0.5), Math.round(Math.abs(answer)*0.5));
    let fake = Number(answer) + delta;

    // For fractions keep two decimal places
    if (Number.isFinite(answer) && !Number.isInteger(answer)){
      fake = Number(fake.toFixed(2));
      // avoid negative or zero for fraction distractors
      if (fake <= 0) fake = Number((Math.abs(fake) + 0.5).toFixed(2));
    }

    // avoid duplicate and invalid
    if (!Number.isNaN(fake) && fake !== Number(answer)) answers.add(fake);
  }

  const arr = Array.from(answers);
  // shuffle
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // create buttons
  choicesEl.innerHTML = '';
  arr.forEach(a => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    // show numbers with same formatting as correctAnswer
    btn.textContent = Number.isInteger(a) ? String(a) : a.toFixed(2);
    btn.onclick = () => handleAnswer(a);
    choicesEl.appendChild(btn);
  });
}

// User selects a choice or types an answer then presses Submit
function handleAnswer(selected){
  // selected may be a number (from choice) or we use input
  let user;
  if (typeof selected !== 'undefined' && selected !== null){
    user = Number(selected);
  } else {
    // try parse input (allow comma decimal)
    let text = answerInput.value.trim().replace(',', '.');
    if (text === '') {
      feedback(false, 'Please enter an answer or pick a choice.');
      return;
    }
    user = Number(text);
    if (Number.isNaN(user)){
      feedback(false, 'Invalid number. Try again.');
      return;
    }
    // for fractions topic we round input to 2 decimals for comparison
    if (topicSelect.value === 'fractions') user = Number(user.toFixed(2));
  }

  // Compare with correctAnswer (numbers). Use strict numeric compare.
  if (Number(user) === Number(correctAnswer)){
    // correct
    score++;
    streak++;
    xp += 5;
    feedback(true);
  } else {
    streak = 0;
    feedback(false, `Wrong — correct answer was ${displayAnswer(correctAnswer)}.`);
  }
  updateStats();
}

function displayAnswer(val){
  return Number.isInteger(val) ? String(val) : val.toFixed(2);
}

function feedback(ok, customText){
  if (ok){
    feedbackEl.textContent = 'Correct! 🎉';
    feedbackEl.style.color = '';
    feedbackEl.style.color = '#2e8b57';
  } else {
    feedbackEl.textContent = customText || `Wrong! The answer was ${displayAnswer(correctAnswer)}.`;
    feedbackEl.style.color = '#d9534f';
  }
}

// Update stats in UI
function updateStats(){
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  xpEl.textContent = xp;
}

// Events
topicSelect.addEventListener('change', newQuestion);
submitBtn.addEventListener('click', () => handleAnswer());
newBtn.addEventListener('click', newQuestion);

// Dark mode toggle
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const pressed = document.body.classList.contains('dark-mode');
  darkToggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
});

// init
newQuestion();
updateStats();
