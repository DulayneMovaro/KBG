// Code39 patterns
const CODE39 = {
  '0':'101001101101','1':'110100101011','2':'101100101011','3':'110110010101',
  '4':'101001101011','5':'110100110101','6':'101100110101','7':'101001011011',
  '8':'110100101101','9':'101100101101','A':'110101001011','B':'101101001011',
  'C':'110110100101','D':'101011001011','E':'110101100101','F':'101101100101',
  'G':'101010011011','H':'110101001101','I':'101101001101','J':'101011001101',
  'K':'110101010011','L':'101101010011','M':'110110101001','N':'101011010011',
  'O':'110101101001','P':'101101101001','Q':'101010110011','R':'110101011001',
  'S':'101101011001','T':'101011011001','U':'110010101011','V':'100110101011',
  'W':'110011010101','X':'100101101011','Y':'110010110101','Z':'100110110101',
  '-':'100101011011','*':'100101101101'
};

// Audio beep for invalid input
function beep() {
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type='sine'; osc.frequency.setValueAtTime(600, ac.currentTime);
  gain.gain.setValueAtTime(0.1, ac.currentTime);
  osc.connect(gain); gain.connect(ac.destination);
  osc.start(); osc.stop(ac.currentTime+0.12);
}

// Uppercase input and disallow invalid chars including _
function toUppercaseAndSanitize(el) {
  let val = el.value.toUpperCase();
  const clean = val.replace(/[^A-Z0-9-]/g,'');
  if(clean.length !== val.length) beep();
  el.value = clean;
}

function generateBarcodeSVG(value) {
  if(!/^[A-Z0-9-]+$/.test(value)) return null;

  const text = '*' + value + '*';
  const narrow = 2;
  const wide = narrow*3;
  const gap = narrow;
  const barHeight = 80;
  const fontSize = 16;

  // Phone-only width, max 400px
  const viewportWidth = Math.min(window.innerWidth, 400) * 0.9;
  const quietZonePx = viewportWidth * 0.05;

  let totalUnits = 0;
  for(const ch of text){
    const pattern = CODE39[ch];
    for(let bit of pattern) totalUnits += (bit==='1'?3:1);
    totalUnits += gap;
  }

  const unitWidth = (viewportWidth - 2*quietZonePx)/totalUnits;
  const svgWidth = viewportWidth;
  const svgHeight = barHeight + fontSize + 10;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

  let x = quietZonePx;
  for(const ch of text){
    const pattern = CODE39[ch];
    for(let bit of pattern){
      const w = (bit==='1'?3:1)*unitWidth;
      if(bit==='1'){
        const rect = document.createElementNS(svgNS,'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y',0);
        rect.setAttribute('width', w);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill','#003366');
        svg.appendChild(rect);
      }
      x += w;
    }
    x += gap*unitWidth;
  }

  const textEl = document.createElementNS(svgNS,'text');
  textEl.setAttribute('x', svgWidth/2);
  textEl.setAttribute('y', barHeight + fontSize);
  textEl.setAttribute('font-size', fontSize);
  textEl.setAttribute('text-anchor','middle');
  textEl.setAttribute('font-family','monospace');
  textEl.setAttribute('fill','#003366');
  textEl.textContent = value;
  svg.appendChild(textEl);

  return svg;
}

function generate() {
  const inputEl = document.getElementById('input');
  const val = inputEl.value;
  const container = document.getElementById('barcode-container');
  container.innerHTML='';
  if(!val) return;
  const svg = generateBarcodeSVG(val);
  if(svg) container.appendChild(svg);
}

window.addEventListener('resize', ()=>{
  if(document.getElementById('input').value) generate();
});
