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

let foundDifferences = new Set();

// ФИКСИРОВАННЫЕ ПОЗИЦИИ ДЛЯ 3 ОТЛИЧИЙ (в процентах)
const differencePositions = {
    1: { top: 27, left: 19 },  // отличие 1
    2: { top: 88, left: 77 },  // отличие 2
    3: { top: 78, left: 13 }   // отличие 3
};

console.log('Позиции отличий:', differencePositions);

// РАЗМЕР МАРКЕРА В ПРОЦЕНТАХ ОТ ШИРИНЫ КАРТИНКИ
const MARKER_SIZE_PERCENT = 8; // 8% от ширины картинки

// Функция для получения размера маркера в пикселях
function getMarkerSize(wrapper) {
    const img = wrapper.querySelector('img');
    if (!img) return 60; // значение по умолчанию
    
    const imgWidth = img.clientWidth;
    return (imgWidth * MARKER_SIZE_PERCENT) / 100;
}

// Функция для получения радиуса попадания (такой же как размер маркера)
function getClickRadius(wrapper) {
    const img = wrapper.querySelector('img');
    if (!img) return 30;
    
    const imgWidth = img.clientWidth;
    return (imgWidth * MARKER_SIZE_PERCENT) / 200; // делим на 2 для радиуса
}

// Функция для создания маркеров отличий
function createDiffMarkers() {
    // Очищаем существующие маркеры
    document.querySelectorAll('.diff-marker').forEach(m => m.remove());
    
    // Создаем маркеры для каждой картинки
    [wrapper1, wrapper2].forEach((wrapper, wrapperIndex) => {
        const markerSize = getMarkerSize(wrapper);
        
        for (let diffNum = 1; diffNum <= 3; diffNum++) {
            const marker = document.createElement('div');
            marker.className = 'diff-marker';
            marker.dataset.diffNum = diffNum;
            marker.dataset.wrapper = wrapperIndex;
            
            const pos = differencePositions[diffNum];
            marker.style.left = pos.left + '%';
            marker.style.top = pos.top + '%';
            
            // Устанавливаем размер в пикселях
            marker.style.width = markerSize + 'px';
            marker.style.height = markerSize + 'px';
            
            // Добавляем номер отличия
            const numberSpan = document.createElement('span');
            numberSpan.className = 'diff-marker-number';
            numberSpan.textContent = `#${diffNum}`;
            marker.appendChild(numberSpan);
            
            wrapper.appendChild(marker);
        }
    });
}

// Функция для обновления маркеров (помечать найденные)
function updateMarkers() {
    document.querySelectorAll('.diff-marker').forEach(marker => {
        const diffNum = parseInt(marker.dataset.diffNum);
        if (foundDifferences.has(diffNum)) {
            marker.classList.add('found');
        }
    });
}

// Создаем маркеры после загрузки изображений
function initializeMarkers() {
    if (img1.complete && img2.complete) {
        createDiffMarkers();
    } else {
        let loadedCount = 0;
        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount === 2) {
                createDiffMarkers();
            }
        };
        
        img1.addEventListener('load', checkLoaded);
        img2.addEventListener('load', checkLoaded);
    }
}

initializeMarkers();

// Функция для создания эффекта красного круга
function createClickEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 800);
}

// Функция проверки попадания в область отличия
function isClickOnDifference(clickX, clickY, wrapper, differenceNumber) {
    const rect = wrapper.getBoundingClientRect();
    const pos = differencePositions[differenceNumber];
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
function handleDifferenceFound(differenceNumber, clickX, clickY) {
    if (foundDifferences.has(differenceNumber)) return false;
    
    foundDifferences.add(differenceNumber);
    
    // Показываем эффект красного круга в месте клика
    createClickEffect(clickX, clickY);
    
    // Обновляем маркеры
    updateMarkers();
    
    // Также показываем эффект на соответствующем месте второй картинки
    const otherWrapper = wrapper1 === event.currentTarget ? wrapper2 : wrapper1;
    const pos = differencePositions[differenceNumber];
    const otherRect = otherWrapper.getBoundingClientRect();
    const otherX = otherRect.left + (otherRect.width * pos.left / 100);
    const otherY = otherRect.top + (otherRect.height * pos.top / 100);
    
    setTimeout(() => {
        createClickEffect(otherX, otherY);
    }, 100);
    
    updateCounter();
    return true;
}

function updateCounter() {
    foundCountSpan.textContent = foundDifferences.size;
    if (foundDifferences.size === 3) {
        setTimeout(() => {
            modal.classList.add('show');
        }, 500);
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
                handleDifferenceFound(diffNum, clickX, clickY);
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

// Подсказка
const hintButton = document.getElementById('hintButton');
const hintTooltip = document.getElementById('hintTooltip');
const closeTooltip = document.getElementById('closeTooltip');

hintButton.addEventListener('click', function() {
    hintTooltip.classList.toggle('show');
});

closeTooltip.addEventListener('click', function() {
    hintTooltip.classList.remove('show');
});

document.addEventListener('click', function(event) {
    if (!hintTooltip.contains(event.target) && !hintButton.contains(event.target)) {
        hintTooltip.classList.remove('show');
    }
});