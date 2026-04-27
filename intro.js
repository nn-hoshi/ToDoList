const card = document.getElementById('card');
const reader = document.getElementById('reader');
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
  cardOverlay.classList.add('active');

  // лучше не display:none сразу
  setTimeout(() => {
    titleScreen.style.opacity = '0';
    titleScreen.style.pointerEvents = 'none';
  }, 150);
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

// =====================
// DRAG START
// =====================
function dragStart(e) {
  if (!cardOverlay.classList.contains('active')) return;
  if (!card.contains(e.target)) return;

  active = true;
  timeStart = performance.now();

  initialX = e.touches ? e.touches[0].clientX : e.clientX;

  card.classList.remove('slide');
}

function drag(e) {
  if (!active) return;

  let clientX = e.touches ? e.touches[0].clientX : e.clientX;

  let x = clientX - initialX;

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
  if (x < 0) x = 0;
  if (x > reader.offsetWidth) x = reader.offsetWidth;

  x -= card.offsetWidth / 2;
  card.style.transform = `translateX(${x}px)`;
}

// =====================
// CHECK
// =====================
function evaluateSwipe(x) {
  let duration = timeEnd - timeStart;

  if (x < reader.offsetWidth * 0.7) {
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
  reader.dataset.status = status;

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
