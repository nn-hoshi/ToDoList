const card = document.getElementById('card');
const reader = document.getElementById('reader');

let active = false;
let initialX;
let timeStart, timeEnd;


const titleScreen = document.getElementById('titleScreen');
const introScreen = document.getElementById('introScreen');
const appScreen = document.getElementById('appScreen');

const goIntroBtn = document.getElementById('goIntroBtn');

goIntroBtn.addEventListener('click', () => {
  titleScreen.style.display = 'none';
  introScreen.style.display = 'flex';
});


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
// START DRAG
// =====================
function dragStart(e) {
  if (e.target !== card) return;

  active = true;
  timeStart = performance.now();

  if (e.type === 'touchstart') {
    initialX = e.touches[0].clientX;
  } else {
    initialX = e.clientX;
  }

  card.classList.remove('slide');
}

// =====================
// DRAG MOVE
// =====================
function drag(e) {
  if (!active) return;

  e.preventDefault();

  let x;

  if (e.type === 'touchmove') {
    x = e.touches[0].clientX - initialX;
  } else {
    x = e.clientX - initialX;
  }

  setTranslate(x);
}

// =====================
// END DRAG
// =====================
function dragEnd(e) {
  if (!active) return;

  active = false;
  timeEnd = performance.now();

  let x;

  if (e.type === 'touchend') {
    x = 0;
  } else {
    x = 0;
  }

  let status = evaluateSwipe(e);

  card.classList.add('slide');
  setTranslate(0);
  setStatus(status);
  playSound(status);
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
// CHECK RESULT
// =====================
function evaluateSwipe(e) {
  let x;

  if (e.type === 'touchend') {
    x = 0;
  } else {
    x = 0;
  }

  let duration = timeEnd - timeStart;

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
      introScreen.style.display = 'none';
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
