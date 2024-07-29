document.addEventListener('DOMContentLoaded', () => {
    // Отримуємо необхідні елементи з DOM
    const board = document.querySelector('.cards');
    const startGameButton = document.querySelector('.play');
    const moveCounter = document.querySelector('.move-counter');
    const buttonsList = document.querySelectorAll(".buttons-1 .button");
    const buttonsList2 = document.querySelectorAll(".buttons-2 .button-1");
    const block = document.querySelector(".block");
    const winnerMessage = document.querySelector(".winner-message");
    const info = document.querySelector(".info");
    const modal = document.querySelector(".modal-info");

    // Змінні для відстеження стану гри
    let hasFlippedCard = false; // Чи була перевернута картка
    let lockBoard = false; // Заблокувати дошку (щоб уникнути швидких подвійних кліків)
    let firstCard, secondCard; // Перша і друга вибрані картки
    let moves = 0; // Лічильник ходів
    let matchedPairs = 0; // Кількість знайдених пар
    let totalPairs = 0; // Загальна кількість пар
    let rows, cols; // Кількість рядків та стовпців

    // Функція для зняття вибору з кнопок
    function deselectButtons(buttons) {
        buttons.forEach(button => {
            button.classList.remove("active");
        });
    }

    // Додаємо обробник подій для кнопок вибору рядків (rows)
    buttonsList.forEach((button, index) => {
        button.addEventListener("click", function() {
            if (button.classList.contains("button")) {
                deselectButtons(buttonsList);
                button.classList.add("active");
                rows = index + 1; // Встановлюємо кількість рядків
            } else {
                button.classList.remove("active");
            }
        });
    });

    // Додаємо обробник подій для кнопок вибору стовпців (columns)
    buttonsList2.forEach((button, index) => {
        button.addEventListener("click", function() {
            if (button.classList.contains("button-1")) {
                deselectButtons(buttonsList2);
                button.classList.add("active");
                cols = index + 1; // Встановлюємо кількість стовпців
            } else {
                button.classList.remove("active");
            }
        });
    });

    // Функція для створення ігрового поля
    function createBoard(rows, cols) {
        board.innerHTML = ''; // Очищуємо поле
        winnerMessage.textContent = ''; // Очищуємо повідомлення про перемогу
        moves = 0; // Скидаємо лічильник ходів
        matchedPairs = 0; // Скидаємо кількість знайдених пар
        moveCounter.textContent = `moves: ${moves}`; // Оновлюємо лічильник ходів
        totalPairs = (rows * cols) / 2; // Встановлюємо загальну кількість пар

        const totalCards = rows * cols; // Загальна кількість карток
        const cardsArray = []; // Масив для зберігання карток

        // Створюємо пари карток
        for (let i = 0; i < totalCards / 2; i++) {
            const card = { name: i, img: `./imgs/cardImgs/pngwing.com(${i}).png` }; // Генеруємо рандомні зображення для карток
            cardsArray.push(card, card);
        }

        shuffleArray(cardsArray); // Перемішуємо масив карток

        // Встановлюємо стиль сітки
        board.style.gridTemplateColumns = `repeat(${cols}, 100px)`;

        // Додаємо картки на поле
        cardsArray.forEach(card => {
            const memoryCard = document.createElement('div');
            memoryCard.classList.add('memory-card');
            memoryCard.setAttribute('data-name', card.name);
            memoryCard.innerHTML = `
                <img class="front-face" src="${card.img}" alt="${card.name}">
                <div class="back-face">?</div>
            `;
            board.appendChild(memoryCard);

            memoryCard.addEventListener('click', flipCard); // Додаємо обробник подій для перевертання карток
        });
    }

    // Функція для перемішування масиву карток
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Функція для перевертання картки
    function flipCard() {
        if (lockBoard) return; // Перевіряємо, чи не заблокована дошка
        if (this === firstCard) return; // Перевіряємо, чи картка не є першою вибраною карткою

        this.classList.add('flip'); // Додаємо клас для перевертання картки

        if (!hasFlippedCard) {
            hasFlippedCard = true; // Встановлюємо прапорець, що картка була перевернута
            firstCard = this; // Зберігаємо першу вибрану картку
            return;
        }

        secondCard = this; // Зберігаємо другу вибрану картку
        checkForMatch(); // Перевіряємо, чи є картки парою
    }

    // Функція для перевірки, чи є картки парою
    function checkForMatch() {
        let isMatch = firstCard.dataset.name === secondCard.dataset.name;
        isMatch ? disableCards() : unflipCards(); // Якщо є пара - деактивуємо картки, якщо ні - перевертаємо назад
        moves++;
        moveCounter.textContent = `moves: ${moves}`; // Оновлюємо лічильник ходів
    }

    // Функція для деактивації карток, якщо вони є парою
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        matchedPairs++;
        resetBoard(); // Скидаємо стан дошки
        if (matchedPairs === totalPairs) {
            displayWinMessage(); // Виводимо повідомлення про перемогу, якщо всі пари знайдено
        }
    }

    // Функція для перевертання карток назад, якщо вони не є парою
    function unflipCards() {
        lockBoard = true; // Блокуємо дошку

        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard(); // Скидаємо стан дошки
        }, 1500);
    }

    // Функція для скидання стану дошки
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Функція для відображення повідомлення про перемогу
    function displayWinMessage() {
        let phrase = "you won!";
        let phraseArray = phrase.split("");
        let index = 0;
        const interval = setInterval(() => {
            if (index < phraseArray.length) {
                winnerMessage.innerHTML += phraseArray[index];
                index++;
            } else {
                clearInterval(interval);
            }
        }, 200);
        block.classList.add("won"); // Додаємо клас для відображення повідомлення про перемогу
    }

    // Додаємо обробник подій для кнопки початку гри
    startGameButton.addEventListener('click', () => {
        if ((rows * cols) % 2 !== 0) {
            alert('the number of cards must be even'); // Перевіряємо, чи кількість карток парна
            return;
        }
        createBoard(rows, cols); // Створюємо ігрове поле
        block.classList.add("active"); // Активуємо блок з грою
    });

    // Додаємо обробник подій для кнопки інформації
    info.addEventListener('click', () => {
        if(modal.className === "modal-info") {
            modal.classList.add("active");
        } else {
            modal.classList.remove("active");
        }
    });
});
