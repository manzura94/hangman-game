// UI
const create = (tagname, classname, parent) => {
    let tag = document.createElement(tagname);

    Array.isArray(classname) ? tag.classList.add(...classname) : tag.classList.add(classname);
    return parent.appendChild(tag);
};

const createUI = () => {
    // Modal UI
    const gameModal = create('div', 'game-modal', document.body);
    const gameModal__content = create('div', 'game-modal__content', gameModal);
    const gameModal__image = create('img', 'game-modal__image', gameModal__content);
    gameModal__image.setAttribute('alt', 'Game modal image');
    gameModal__image.setAttribute('src', '#');
    const gameModal__title = create('h4', 'game-modal__title', gameModal__content);
    gameModal__title.innerText = 'Game Over!';
    const gameModal__desc = create('p', 'game-modal__desc', gameModal__content);
    gameModal__desc.innerText = 'The correct word was:';
    create('p', 'game-modal__desc--value', gameModal__desc);
    const gameModal__btn = create('button', 'game-modal__play-again', gameModal__content);
    gameModal__btn.innerText = 'Play again';

    // Game UI
    const container = create('div', 'container', document.body);
    const hangmanBox = create('div', 'hangman-box', container);
    const hangmanBox__image = create('img', 'hangman-box__image', hangmanBox);
    hangmanBox__image.setAttribute('src', '#');
    hangmanBox__image.setAttribute('draggable', 'false');
    hangmanBox__image.setAttribute('alt', 'hangman img');
    const hangmanBox__title = create('h1', 'hangman-box__title', hangmanBox);
    hangmanBox__title.innerText = 'Hangman Game';
    const gameBox = create('div', 'game-box', container);
    create('div', 'word-display', gameBox);
    const hintText = create('h4', 'hint-text', gameBox);
    hintText.innerText = 'Hint:';
    create('b', 'hint-text--value', hintText);
    const guessestext = create('h4', 'guesses-text', gameBox);
    guessestext.innerText = 'Incorrect guesses:';
    create('b', 'guessestext--value', guessestext);
    create('div', 'keyboard', gameBox);
};

createUI();

// Game
const wordDisplay = document.querySelector('.word-display');
const guessesText = document.querySelector('.guesses-text b');
const keyboardDiv = document.querySelector('.keyboard');
const hangmanImage = document.querySelector('.hangman-box__image');
const gameModal = document.querySelector('.game-modal');
const playAgainBtn = gameModal.querySelector('button');
let currentWord, correctLetters, wrongGuessCount;
let modalOpen = false;
const maxGuesses = 6;

const wordListGet = fetch('./data/word-list.json')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    });

const resetGame = () => {
    correctLetters = [];
    wrongGuessCount = 0;
    hangmanImage.src = './images/hangman-0.svg';
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
    wordDisplay.innerHTML = currentWord
        .split('')
        .map(() => `<li class="letter"></li>`)
        .join('');
    keyboardDiv.querySelectorAll('button').forEach((btn) => (btn.disabled = false));
    gameModal.classList.remove('show');
};

const getRandomWord = async () => {
    modalOpen = false;
    const wordList = await wordListGet;
    const { word, hint } = await wordList[Math.floor(Math.random() * wordList.length)];
    console.log(word);
    currentWord = word;
    document.querySelector('.hint-text b').innerText = hint;
    resetGame();
};

const gameOver = (isVictory) => {
    modalOpen = true;
    const modalText = isVictory ? `You found the word:` : 'The correct word was:';
    gameModal.querySelector('img').src = `images/${isVictory ? 'win' : 'gameOver'}.gif`;
    gameModal.querySelector('h4').innerText = isVictory ? 'Congrats!' : 'Game Over!';
    gameModal.querySelector('p').innerHTML = `${modalText} <b>${currentWord}</b>`;
    gameModal.classList.add('show');
};

const initGame = (charCode, clickedLetter) => {
    if (modalOpen) {
        return;
    }

    if (currentWord.includes(clickedLetter)) {
        [...currentWord].forEach((letter, index) => {
            if (letter === clickedLetter) {
                correctLetters.push(letter);
                wordDisplay.querySelectorAll('li')[index].innerText = letter;
                wordDisplay.querySelectorAll('li')[index].classList.add('guessed');
            }
        });
    } else {
        wrongGuessCount++;
        hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
    }

    document.querySelector(`[data-value="${charCode}"`).disabled = true;
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

    if (wrongGuessCount === maxGuesses) return gameOver(false);
    if (correctLetters.length === currentWord.length) return gameOver(true);
};

for (let i = 97; i <= 122; i++) {
    const button = document.createElement('button');
    button.setAttribute('data-value', i);
    button.classList = 'keyboard__btn';
    button.innerText = String.fromCharCode(i);
    keyboardDiv.appendChild(button);
    button.addEventListener('click', () => initGame(i, String.fromCharCode(i)));
}

getRandomWord();
playAgainBtn.addEventListener('click', getRandomWord);

window.addEventListener('keydown', (event) => {
    const charCode = event.key.charCodeAt(0);
    const btn = document.querySelector(`[data-value="${charCode}"`);
    const disabledBtn = document.querySelector(`[data-value="${charCode}"`).disabled;

    if (charCode >= 97 && charCode <= 122 && !disabledBtn) {
        btn.setAttribute('data-pressed', 'on');
        initGame(charCode, event.key);
    }
});

document.body.addEventListener('keyup', function (e) {
    const charCode = e.key.charCodeAt(0);
    const btn = document.querySelector(`[data-value="${charCode}"`);

    if (charCode >= 97 && charCode <= 122) {
        btn.removeAttribute('data-pressed');
    }
});
