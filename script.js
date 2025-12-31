// ตั้งค่าเวลาเป้าหมายเป็นปี 2026 ของจริง
const targetDate = new Date("January 1, 2026 00:00:00").getTime();

// ฟังก์ชันสร้างเสียงพลุ (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playFireworkSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // สร้าง Oscillator สำหรับเสียงระเบิด (Low thump)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);

    // สร้าง Noise สำหรับเสียงซ่า (Sizzle)
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    const noiseGain = audioCtx.createGain();
    noise.buffer = buffer;
    
    noiseGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start();
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');

    if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById("timer").style.display = "none";
        document.getElementById("title").style.display = "none";
        const msg = document.getElementById("new-year-msg");
        msg.style.display = "block";
        
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createFirework(x, y);
        }, 400);
    }
}

const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();

function createFirework(x, y) {
    playFireworkSound(); // เล่นเสียงทุกครั้งที่มีพลุ
    
    const count = 45;
    const colors = ['#ff00ea', '#00d4ff', '#ffcc00', '#00ff00', '#ffffff', '#ff4d4d'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.background = color;
        particle.style.boxShadow = `0 0 12px ${color}`;
        particle.style.width = Math.random() * 6 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 350 + 100;
        const tx = Math.cos(angle) * velocity + 'px';
        const ty = Math.sin(angle) * velocity + 'px';

        particle.style.setProperty('--tx', tx);
        particle.style.setProperty('--ty', ty);

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
    }
}

document.addEventListener('mousedown', (e) => {
    createFirework(e.clientX, e.clientY);
});