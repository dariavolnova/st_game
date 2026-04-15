// Получаем элементы
const wrapper1 = document.getElementById('image-wrapper-1');
const wrapper2 = document.getElementById('image-wrapper-2');
const img1 = document.getElementById('game-image-1');
const img2 = document.getElementById('game-image-2');
const foundCountSpan = document.getElementById('found-count');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const submitButton = document.getElementById('submitButton');
const emailInput = document.getElementById('emailInput');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const successMessageDiv = document.getElementById('successMessage');
const gameSection = document.querySelector('.game-section');
const gameTitle = document.querySelector('.game-title');
const hintTooltip = document.getElementById('hintTooltip');

// СИСТЕМА УРОВНЕЙ
let currentLevel = 1;
let totalLevels = 3; // Всего уровней
let foundDifferences = new Set();

// ДАННЫЕ УРОВНЕЙ (пути к картинкам, позиции отличий и подсказки)
const levels = {
    1: {
        img1: 'assets/bride1.png',
        img2: 'assets/bride2.png',
        title: 'Уровень 1/3. Найди 3 отличия и получи персональную скидку на заказ',
        differences: {
            1: { top: 27, left: 19 },
            2: { top: 88, left: 77 },
            3: { top: 78, left: 13 }
        },
        hints: [
            '1. На одной из картин что-то не так',
            '2. Это что, пятно на ковре?',
            '3. Обрати внимание на цветок'
        ]
    },
    2: {
        img1: 'assets/level2_img1.png',
        img2: 'assets/level2_img2.png',
        title: 'Уровень 2/3: Найди 3 отличия и получи персональную скидку на заказ',
        differences: {
            1: { top: 13, left: 7 },
            2: { top: 38, left: 50 },
            3: { top: 42, left: 88 }
        },
        hints: [
            '1. Кажется, дама что-то потеряла',
            '2. Присмотрись к наряду человека слева',
            '3. Один из паровозов экономит уголь'
        ]
    },
    3: {
        img1: 'assets/level3_img1.png',
        img2: 'assets/level3_img2.png',
        title: 'Уровень 3/3: Найди 3 отличия и получи персональную скидку на заказ',
        differences: {
            1: { top: 90, left: 12 },
            2: { top: 16, left: 77 },
            3: { top: 62, left: 70 }
        },
        hints: [
            '1. Кто-то не добросил мусор до урны',
            '2. Не все люди уснули ночью',
            '3. Снег на фонаре расстаял'
        ]
    }
};

// Функция обновления подсказок для текущего уровня
function updateHints() {
    const currentLevelHints = levels[currentLevel].hints;
    if (currentLevelHints && currentLevelHints.length >= 3) {
        hintTooltip.innerHTML = `
            <button class="close-tooltip" id="closeTooltip">✕</button>
            ${currentLevelHints[0]}<br><br>
            ${currentLevelHints[1]}<br><br>
            ${currentLevelHints[2]}
        `;
        
        // Перепривязываем обработчик для кнопки закрытия
        const newCloseTooltip = document.getElementById('closeTooltip');
        if (newCloseTooltip) {
            newCloseTooltip.addEventListener('click', function() {
                hintTooltip.classList.remove('show');
            });
        }
    }
}

// Получаем позиции отличий для текущего уровня
function getDifferencePositions() {
    return levels[currentLevel].differences;
}

// Загрузка уровня
function loadLevel(level) {
    // Сбрасываем найденные отличия
    foundDifferences.clear();
    foundCountSpan.textContent = '0';
    
    // Обновляем заголовок
    if (gameTitle) {
        gameTitle.textContent = levels[level].title;
    }
    
    // Обновляем подсказки
    updateHints();
    
    // Меняем картинки
    img1.src = levels[level].img1;
    img2.src = levels[level].img2;
    
    // Ждем загрузки картинок и создаем маркеры
    const onImagesLoad = () => {
        createDiffMarkers();
        updateMarkers();
    };
    
    if (img1.complete && img2.complete) {
        onImagesLoad();
    } else {
        let loadedCount = 0;
        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount === 2) {
                onImagesLoad();
            }
        };
        
        img1.onload = checkLoaded;
        img2.onload = checkLoaded;
    }
}

// ФИКСИРОВАННЫЕ ПОЗИЦИИ ДЛЯ 3 ОТЛИЧИЙ (для текущего уровня)
function getCurrentDifferencePositions() {
    return levels[currentLevel].differences;
}

// РАЗМЕР МАРКЕРА В ПРОЦЕНТАХ ОТ ШИРИНЫ КАРТИНКИ
const MARKER_SIZE_PERCENT = 8;

// Функция для получения размера маркера в пикселях
function getMarkerSize(wrapper) {
    const img = wrapper.querySelector('img');
    if (!img) return 60;
    
    const imgWidth = img.clientWidth;
    return (imgWidth * MARKER_SIZE_PERCENT) / 100;
}

// Функция для получения радиуса попадания
function getClickRadius(wrapper) {
    const img = wrapper.querySelector('img');
    if (!img) return 30;
    
    const imgWidth = img.clientWidth;
    return (imgWidth * MARKER_SIZE_PERCENT) / 200;
}

// Функция для создания маркеров отличий
function createDiffMarkers() {
    // Очищаем существующие маркеры
    document.querySelectorAll('.diff-marker').forEach(m => m.remove());
    
    const positions = getCurrentDifferencePositions();
    
    // Создаем маркеры для каждой картинки
    [wrapper1, wrapper2].forEach((wrapper, wrapperIndex) => {
        const markerSize = getMarkerSize(wrapper);
        
        for (let diffNum = 1; diffNum <= 3; diffNum++) {
            const marker = document.createElement('div');
            marker.className = 'diff-marker';
            marker.dataset.diffNum = diffNum;
            marker.dataset.wrapper = wrapperIndex;
            
            const pos = positions[diffNum];
            if (!pos) continue;
            
            marker.style.left = pos.left + '%';
            marker.style.top = pos.top + '%';
            
            marker.style.width = markerSize + 'px';
            marker.style.height = markerSize + 'px';
            wrapper.appendChild(marker);
        }
    });
}

// Функция для обновления маркеров
function updateMarkers() {
    document.querySelectorAll('.diff-marker').forEach(marker => {
        const diffNum = parseInt(marker.dataset.diffNum);
        if (foundDifferences.has(diffNum)) {
            marker.classList.add('found');
        }
    });
}


// Функция проверки попадания в область отличия
function isClickOnDifference(clickX, clickY, wrapper, differenceNumber) {
    const rect = wrapper.getBoundingClientRect();
    const positions = getCurrentDifferencePositions();
    const pos = positions[differenceNumber];
    if (!pos) return false;
    
    const centerX = rect.left + (rect.width * pos.left / 100);
    const centerY = rect.top + (rect.height * pos.top / 100);
    const radius = getClickRadius(wrapper);
    
    const distance = Math.sqrt(
        Math.pow(clickX - centerX, 2) + 
        Math.pow(clickY - centerY, 2)
    );
    
    return distance <= radius;
}

// Функция для обработки найденного отличия
function handleDifferenceFound(differenceNumber, clickX, clickY, event) {
    if (foundDifferences.has(differenceNumber)) return false;
    
    foundDifferences.add(differenceNumber);
    
    updateMarkers();
    
    const otherWrapper = wrapper1 === event.currentTarget ? wrapper2 : wrapper1;
    const positions = getCurrentDifferencePositions();
    const pos = positions[differenceNumber];
    const otherRect = otherWrapper.getBoundingClientRect();
    const otherX = otherRect.left + (otherRect.width * pos.left / 100);
    const otherY = otherRect.top + (otherRect.height * pos.top / 100);

    
    updateCounter();
    return true;
}

function updateCounter() {
    foundCountSpan.textContent = foundDifferences.size;
    
    // Если все 3 отличия найдены на текущем уровне
    if (foundDifferences.size === 3) {
        if (currentLevel < totalLevels) {
            // Мгновенный переход на следующий уровень (без анимации)
            currentLevel++;
            loadLevel(currentLevel);
        } else {
            // Это был последний уровень - показываем модальное окно
            setTimeout(() => {
                modal.classList.add('show');
            }, 500);
        }
    }
}

// Обработчик клика по области картинки
function handleWrapperClick(event, wrapper) {
    if (foundDifferences.size === 3) return;
    
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    let found = false;
    for (let diffNum = 1; diffNum <= 3; diffNum++) {
        if (!foundDifferences.has(diffNum)) {
            if (isClickOnDifference(clickX, clickY, wrapper, diffNum)) {
                handleDifferenceFound(diffNum, clickX, clickY, event);
                found = true;
                break;
            }
        }
    }
}

// Добавляем обработчики на обертки
wrapper1.addEventListener('click', (e) => handleWrapperClick(e, wrapper1));
wrapper2.addEventListener('click', (e) => handleWrapperClick(e, wrapper2));

// Обновляем позиции и размеры маркеров при изменении размера окна
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        createDiffMarkers();
        updateMarkers();
    }, 100);
});

// Загружаем первый уровень
loadLevel(1);

// Модальное окно
modalClose.addEventListener('click', function() {
    modal.classList.remove('show');
    resetModalForm();
});

modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.remove('show');
        resetModalForm();
    }
});

function resetModalForm() {
    emailInput.value = '';
    emailInput.style.display = 'block';
    submitButton.style.display = 'block';
    successMessageDiv.style.display = 'none';
    successMessageDiv.innerHTML = '';
    modalTitle.textContent = 'Поздравляем!';
    modalText.textContent = 'Для получения персональной скидки напишите свою почту';
}

submitButton.addEventListener('click', function() {
    const email = emailInput.value.trim();
    
    if (email === '') {
        alert('Пожалуйста, введите ваш email');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('Пожалуйста, введите корректный email');
        return;
    }
    
    emailInput.style.display = 'none';
    submitButton.style.display = 'none';
    successMessageDiv.style.display = 'block';
    successMessageDiv.innerHTML = '✅ Проверь почту! Для тебя там подарок';
    successMessageDiv.className = 'success-message';
    
    console.log('Email отправлен:', email);
});

// Подсказка (обновленная)
const hintButton = document.getElementById('hintButton');

hintButton.addEventListener('click', function() {
    hintTooltip.classList.toggle('show');
});

// Обработчик для закрытия подсказки (глобальный)
document.addEventListener('click', function(event) {
    if (!hintTooltip.contains(event.target) && !hintButton.contains(event.target)) {
        hintTooltip.classList.remove('show');
    }
});

// Для обновления обработчика закрытия при смене уровня
function updateHintCloseHandler() {
    const closeTooltip = document.getElementById('closeTooltip');
    if (closeTooltip) {
        closeTooltip.addEventListener('click', function() {
            hintTooltip.classList.remove('show');
        });
    }
}

// Вызываем при загрузке
updateHintCloseHandler();