let currentScreen = 'screen1';
const video = document.getElementById('camera');
const canvas = document.getElementById('photo');
const context = canvas.getContext('2d');
const countdownEl = document.getElementById('countdown');
const shutterSound = document.getElementById('shutter');
const collage = document.getElementById('collage');
let capturedImages = [];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  currentScreen = id;
}

navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
  .then(stream => {
    video.srcObject = stream;
  });

function countdown(seconds) {
  return new Promise(resolve => {
    countdownEl.textContent = seconds;
    const interval = setInterval(() => {
      seconds--;
      countdownEl.textContent = seconds > 0 ? seconds : '';
      if (seconds <= 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

function applyFilter(ctx, filter) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (filter === 'grayscale') {
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      data[i] = data[i+1] = data[i+2] = avg;
    } else if (filter === 'sepia') {
      const r = data[i], g = data[i+1], b = data[i+2];
      data[i] = r * .393 + g * .769 + b * .189;
      data[i+1] = r * .349 + g * .686 + b * .168;
      data[i+2] = r * .272 + g * .534 + b * .131;
    } else if (filter === 'vintage') {
      data[i] = data[i] * 0.9 + 20;
      data[i+1] = data[i+1] * 0.7 + 30;
      data[i+2] = data[i+2] * 0.5 + 40;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

document.getElementById('booth-btn').addEventListener('click', async () => {
  capturedImages = [];
  const shotCount = parseInt(document.getElementById('shot-count').value);
  const filter = document.getElementById('filter').value;
  for (let i = 0; i < shotCount; i++) {
    await countdown(3);
    shutterSound.play();
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyFilter(context, filter);
    capturedImages.push(canvas.toDataURL('image/png'));
  }
  generateCollage();
  showScreen('screen3');
});

function generateCollage() {
  collage.innerHTML = '';
  const layout = document.getElementById('layout').value;
  collage.className = layout;
  capturedImages.forEach(dataUrl => {
    const img = document.createElement('img');
    img.src = dataUrl;
    collage.appendChild(img);
  });
}

document.getElementById('download-collage-btn').addEventListener('click', () => {
  html2canvas(document.getElementById('collage')).then(canvas => {
    const link = document.createElement('a');
    link.download = 'polaroid-collage.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

document.getElementById('apply-caption-sticker').addEventListener('click', () => {
  const sticker = document.getElementById('sticker-selector').value;
  const caption = document.getElementById('caption-input').value;
  const wrapper = document.getElementById('collage');
  if (sticker) {
    const stickerDiv = document.createElement('div');
    stickerDiv.className = 'sticker';
    stickerDiv.textContent = sticker;
    wrapper.appendChild(stickerDiv);
  }
  if (caption) {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'caption';
    captionDiv.textContent = caption;
    wrapper.appendChild(captionDiv);
  }
});
