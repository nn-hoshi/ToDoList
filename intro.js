const card = document.getElementById('card');
const cardOverlay = document.getElementById('cardOverlay');

const titleScreen = document.getElementById('titleScreen');
const appScreen = document.getElementById('appScreen');
const goIntroBtn = document.getElementById('goIntroBtn');

let active = false;
let initialX;
let timeStart, timeEnd;

// =====================
// START BUTTON
// =====================
goIntroBtn.addEventListener('click', () => {
  titleScreen.style.display = 'none';

  cardOverlay.classList.add('active');
});

// =====================
// SOUND
// =====================
const soundAccepted = new Audio(
  'https://thomaspark.co/projects/among-us-card-swipe/audio/CardAccepted.mp3',
);

const soundDenied = new Audio(
  'https://thomaspark.co/projects/among-us-card-swipe/audio/CardDenied.mp3',
);

// =====================
// EVENTS
// =====================
document.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

document.addEventListener('touchstart', dragStart);
document.addEventListener('touchmove', drag);
document.addEventListener('touchend', dragEnd);

document.querySelector('.terminal').dataset.status = status;

// =====================
// DRAG START
// =====================
function dragStart(e) {
  if (!cardOverlay.classList.contains('active')) return;
  if (!card.contains(e.target)) return;

  active = true;
  timeStart = performance.now();

  const rect = card.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;

  initialX = clientX;
  startOffset = rect.left;

  card.classList.remove('slide');
}

// =====================
// DRAG MOVE
// =====================
function drag(e) {
  if (!active) return;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;

  let x = startOffset + (clientX - initialX);

  setTranslate(x);
}

// =====================
// DRAG END
// =====================
function dragEnd(e) {
  if (!active) return;

  active = false;
  timeEnd = performance.now();

  let x = e.changedTouches
    ? e.changedTouches[0].clientX - initialX
    : e.clientX - initialX;

  let status = evaluateSwipe(x);

  card.classList.add('slide');
  setTranslate(0);
  setStatus(status);
}

// =====================
// MOVE CARD
// =====================
function setTranslate(x) {
  const terminal = document.querySelector('.terminal');
  const rect = terminal.getBoundingClientRect();

  const max = rect.width;

  if (x < rect.left) x = rect.left;
  if (x > rect.left + max) x = rect.left + max;

  card.style.transform = `translateX(${x - rect.left}px)`;
}

// =====================
// CHECK RESULT
// =====================
function evaluateSwipe(x) {
  let duration = timeEnd - timeStart;

  // проверка длины свайпа (нормализуем под terminal)
  const terminal = document.querySelector('.terminal');

  if (x < terminal.offsetWidth * 0.7) {
    return 'invalid';
  }

  if (duration > 700) return 'slow';
  if (duration < 400) return 'fast';

  return 'valid';
}

// =====================
// STATUS
// =====================
function setStatus(status) {
  const terminal = document.querySelector('.terminal');
  terminal.dataset.status = status;
  document.querySelector('.terminal').dataset.status = status;

  playSound(status);

  if (status === 'valid') {
    setTimeout(() => {
      cardOverlay.classList.remove('active');
      appScreen.style.display = 'block';
    }, 1000);
  }
}

// =====================
// SOUND
// =====================
function playSound(status) {
  soundAccepted.pause();
  soundDenied.pause();

  soundAccepted.currentTime = 0;
  soundDenied.currentTime = 0;

  if (status === 'valid') {
    soundAccepted.play();
  } else {
    soundDenied.play();
  }
}
