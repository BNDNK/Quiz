const _question = document.getElementById('question');
const _options = document.querySelector('.quiz-options');
const _checkBtn = document.getElementById('check-answer');
const _playAgainBtn = document.getElementById('play-again');
const _result = document.getElementById('result');
const _correctScore = document.getElementById('correct-score');
const _totalQuestion = document.getElementById('total-question');
const APIUrl = 'https://opentdb.com/api.php?amount=10';

// Add timer variables
let timer;
let timerSeconds = 5;

// start variables
let correctAnswer = "", correctScore = askedCount = 0, totalQuestion = 10;

// load questions from API
async function loadQuestion() {
  // Clear existing timer
  clearInterval(timer);

  try {
    const result = await fetch(APIUrl);
    const data = await result.json();
    console.log('API response:', data);

    if (data.results && data.results.length === totalQuestion) {
      _result.innerHTML = "";
      for (let i = 0; i < totalQuestion; i++) {
        showQuestion(data.results[i]);
      }
      // Start timer after loading the question
      startTimer();
    } else {
      console.error('Invalid or incomplete API response:', data);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


async function loadQuestionWithRetry(retryCount = 3) {
    let currentRetry = 0;
    while (currentRetry < retryCount) {
        try {
            const result = await fetch(APIUrl);
            const data = await result.json();
            console.log('API response:', data);
            if (data.results && data.results.length > 0) {
                _result.innerHTML = "";
                showQuestion(data.results[0]);
                return; // Exit the loop if successful
            } else {
                console.error('Invalid API response:', data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        currentRetry++;
    }
    // Handle the case where all retries failed
    console.error('Failed to fetch question after retries');
}

function startTimer() {
    timer = setInterval(function () {
        timerSeconds--;

        // Update timer display
        _result.innerHTML = `<p>Time left: ${timerSeconds}s</p>`;

        // Check if time has run out
        if (timerSeconds === 0) {
            clearInterval(timer);
            // Perform actions when time runs out (e.g., display a message)
            _result.innerHTML = `<p>Now check the answer!</p>`;
            checkCount();
            
            // Don't move to the next question automatically when the timer hits 0
            // Remove the line below:
            // nextQuestion();
        }
    }, 1000);
}


// buttons
function eventListeners() {
    _checkBtn.addEventListener('click', checkAnswer);
    _playAgainBtn.addEventListener('click', restartQuiz);
}

// start the application when loaded
document.addEventListener('DOMContentLoaded', function () {
    loadQuestion();
    eventListeners();
    _totalQuestion.textContent = totalQuestion;
    _correctScore.textContent = correctScore;
});

// Function to transition to the next question
function nextQuestion() {
    // Clear existing timer
    clearInterval(timer);

    setTimeout(function () {
        loadQuestion();
        resetTimer(); // Reset the timer after loading the next question
    }, 300);
}
  
  // ... (rest of your code)
  
  // Function to restart the quiz
  function restartQuiz() {
    // Clear existing timer
    clearInterval(timer);
  
    correctScore = askedCount = 0;
    _playAgainBtn.style.display = "none";
    _checkBtn.style.display = "block";
    _checkBtn.disabled = false;
    setCount();
    loadQuestion();
  }
//  display question and options
function showQuestion(data) {
    _checkBtn.disabled = false;
    correctAnswer = data.correct_answer;
    let incorrectAnswer = data.incorrect_answers;
    let optionsList = incorrectAnswer;
    optionsList.splice(Math.floor(Math.random() * (incorrectAnswer.length + 1)), 0, correctAnswer);

    //  the question and category
    _question.innerHTML = `${data.question} <br> <span class="category"> ${data.category} </span>`;
    // Displaying the answer options
    _options.innerHTML = `
        ${optionsList.map((option, index) => `
            <li> ${index + 1}. <span>${option}</span> </li>
        `).join('')}
    `;
    selectOption();
}

//  handling option selection
function selectOption() {
    _options.querySelectorAll('li').forEach(function (option) {
        option.addEventListener('click', function () {
            // moving options
            if (_options.querySelector('.selected')) {
                const activeOption = _options.querySelector('.selected');
                activeOption.classList.remove('selected');
            }
            // highlight chosen
            option.classList.add('selected');
        });
    });
}


function resetTimer() {
    clearInterval(timer);
    timerSeconds = 5; // Set the initial timer value (change it to your desired initial value)
    _result.innerHTML = `<p>Time left: ${timerSeconds}s</p>`;
    startTimer(); // Start the timer again
}

let isTimerRunning = true; // Add this variable

function checkAnswer() {
    if (timerSeconds === 0) {
        _checkBtn.disabled = true;
        if (_options.querySelector('.selected')) {
            let selectedAnswer = _options.querySelector('.selected span').textContent;
            if (selectedAnswer == HTMLDecode(correctAnswer)) {
                // Displaying correct answer 
                correctScore++;
                _result.innerHTML = `<p><i class="fas fa-check"></i>Correct Answer!</p>`;
            } else {
                // Displaying incorrect answer with correct answer
                _result.innerHTML = `<p><i class="fas fa-times"></i>Incorrect Answer!</p> <small><b>Correct Answer: </b>${correctAnswer}</small>`;
            }
            isTimerRunning = false; // Set the flag to stop updating the timer
            clearInterval(timer); // Stop the timer
            resetTimer(); // Reset the timer after checking the answer
            checkCount();

            // Delay the transition to the next question to keep the "Now check your answer" message
            setTimeout(function () {
                isTimerRunning = true; // Set the flag to start updating the timer again
                nextQuestion(); // Transition to the next question
            }, 2000); // Adjust the delay time (in milliseconds) as needed
        } else {
            // Displaying an error if no option is selected
            _result.innerHTML = `<p><i class="fas fa-question"></i>Please select an option!</p>`;
            _checkBtn.disabled = false;
        }
    } else {
        // Display a message if the user tries to check before the timer ends
        _result.innerHTML = `<p><i class="fas fa-clock"></i>Wait for the timer to end before checking your answer!</p>`;
    }
}

function startTimer() {
    timer = setInterval(function () {
        if (isTimerRunning) { // Only update the timer if the flag is true
            timerSeconds--;
            // Update timer display
            _result.innerHTML = `<p>Time left: ${timerSeconds}s</p>`;
        }

        // Check if time has run out
        if (timerSeconds === 0) {
            clearInterval(timer);
            // Perform actions when time runs out (e.g., display a message)
            _result.innerHTML = `<p>Now check the answer!</p>`;
            checkCount();
            isTimerRunning = false; // Set the flag to stop updating the timer
        }
    }, 1000);
}




// Function to convert HTML  into normal text for the correct answer
function HTMLDecode(textString) {
    let doc = new DOMParser().parseFromString(textString, "text/html");
    return doc.documentElement.textContent;
}

//  number of  questions and end of the quiz
function checkCount() {
    askedCount++;
    setCount();
    if (askedCount == totalQuestion) {

        // final score and play again 
        _result.innerHTML += `<p>Your score is ${correctScore}.</p>`;
        _playAgainBtn.style.display = "block";
        _checkBtn.style.display = "none";
    }
}





// update the count of questions and correct score
function setCount() {
    _totalQuestion.textContent = totalQuestion;
    _correctScore.textContent = correctScore;
}

// Function to restart the quiz
function restartQuiz() {
    correctScore = askedCount = 0;
    _playAgainBtn.style.display = "none";
    _checkBtn.style.display = "block";
    _checkBtn.disabled = false;
    setCount();
    loadQuestion();
    resetTimer(); // Reset the timer when restarting the quiz
}