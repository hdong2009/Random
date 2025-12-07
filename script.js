const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const updateBtn = document.getElementById('updateBtn');
const choicesTextarea = document.getElementById('choices');
const resultList = document.getElementById('resultList');
const popup = document.getElementById('popup');
const popupResult = document.getElementById('popupResult');
const closePopup = document.getElementById('closePopup');
const clearResult = document.getElementById('clearResult');
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');

let choices = choicesTextarea.value.split('\n').filter(c => c.trim() !== '');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = centerX - 10;

const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1",
    "#FFDD33", "#33FFF0", "#A133FF", "#57FF33",
    "#F3FF33", "#33FFB5"
];

let rotationAngle = 0;
let isSpinning = false;
let spinVelocity = 0;
const deceleration = 0.001;

function drawWheel() {
    choices = choicesTextarea.value.split('\n').filter(c => c.trim() !== '');
    const num = choices.length;

    if (num === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const anglePerSegment = (2 * Math.PI) / num;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < num; i++) {
        const start = rotationAngle + i * anglePerSegment;
        const end = start + anglePerSegment;

        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(start + anglePerSegment / 2);
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(choices[i].substring(0, 12), radius * 0.65, 10);
        ctx.restore();
    }

    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - 15, 20);
    ctx.lineTo(centerX + 15, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function animateSpin() {
    if (!isSpinning) return;

    spinVelocity -= deceleration;

    if (spinVelocity <= 0) {
        isSpinning = false;
        determineWinner();
        return;
    }

    rotationAngle += spinVelocity;
    rotationAngle %= (2 * Math.PI);

    drawWheel();
    requestAnimationFrame(animateSpin);
}

function startSpin() {
    choices = choicesTextarea.value.split('\n').filter(c => c.trim() !== '');
    if (choices.length === 0) {
        alert("Bạn chưa nhập lựa chọn!");
        return;
    }

    spinBtn.disabled = true;
    spinSound.play().catch(() => {});

    isSpinning = true;

    const n = choices.length;
    const anglePerSegment = (2 * Math.PI) / n;
    const winningIndex = Math.floor(Math.random() * n);

    const targetAngle =
        (2 * Math.PI) -
        (winningIndex * anglePerSegment + anglePerSegment / 2) +
        Math.PI / 2;

    const randomTurns = Math.floor(Math.random() * 5) + 8;

    const requiredAngle = targetAngle + randomTurns * (2 * Math.PI);
    spinVelocity = Math.sqrt(2 * requiredAngle * deceleration);

    animateSpin();
}

function determineWinner() {
    const n = choices.length;
    const anglePerSegment = (2 * Math.PI) / n;

    let normalized = (rotationAngle + Math.PI / 2) % (2 * Math.PI);
    if (normalized < 0) normalized += (2 * Math.PI);

    let index = n - 1 - Math.floor(normalized / anglePerSegment);
    index = Math.min(Math.max(0, index), n - 1);

    const winner = choices[index];
    displayResult(winner);

    setTimeout(() => { spinBtn.disabled = false; }, 1500);
}

function displayResult(winner) {
    popupResult.innerText = winner;
    popup.classList.remove("hidden");

    const li = document.createElement("li");
    li.innerHTML = `<strong>${winner}</strong> <span>(${new Date().toLocaleTimeString()})</span>`;
    resultList.prepend(li);

    winSound.play().catch(() => {});

    // 🎉 THÊM HIỆU ỨNG PHÁO BÔNG
    launchConfetti();
}

function launchConfetti() {
    confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 }
    });

    setTimeout(() => {
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 }
        });
    }, 400);
}

closePopup.addEventListener("click", () => {
    popup.classList.add("hidden");
    spinBtn.disabled = false;
});

clearResult.addEventListener("click", () => {
    const index = choices.indexOf(popupResult.innerText.trim());
    if (index !== -1) choices.splice(index, 1);

    choicesTextarea.value = choices.join("\n");

    isSpinning = false;
    spinVelocity = 0;
    rotationAngle = 0;   

    drawWheel();

    spinBtn.disabled = false;
    popup.classList.add("hidden");
});

updateBtn.addEventListener("click", () => {
    choices = choicesTextarea.value.split('\n').filter(c => c.trim() !== '');
    rotationAngle = 0; 
    drawWheel();
});

spinBtn.addEventListener("click", startSpin);

drawWheel();
