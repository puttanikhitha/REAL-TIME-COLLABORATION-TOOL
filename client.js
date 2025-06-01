const socket = io();

/* ----- Shared Document Editor ----- */
const editor = document.getElementById('editor');
const cursorsContainer = document.getElementById('cursors');

let userColor = '#000000'; // will be set from server
const otherCursors = {};

// Emit content and cursor position with debounce
let editTimeout;
editor.addEventListener('input', () => {
  clearTimeout(editTimeout);
  editTimeout = setTimeout(() => {
    socket.emit('edit', editor.innerHTML);
  }, 100);
});

// Track cursor position and send to server
function getCaretCoordinates() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0).cloneRange();
  range.collapse(true);

  let rect = range.getClientRects()[0];
  if (!rect) {
    // Try to insert temporary span
    const span = document.createElement('span');
    span.textContent = '\u200b'; // zero width space
    range.insertNode(span);
    rect = span.getClientRects()[0];
    span.parentNode.removeChild(span);
  }

  if (!rect) return null;

  // Get editor container position
  const editorRect = editor.getBoundingClientRect();
  return {
    top: rect.top - editorRect.top + editor.scrollTop,
    left: rect.left - editorRect.left + editor.scrollLeft
  };
}

let cursorMoveTimeout;
editor.addEventListener('keyup', sendCursorPos);
editor.addEventListener('mouseup', sendCursorPos);

function sendCursorPos() {
  clearTimeout(cursorMoveTimeout);
  cursorMoveTimeout = setTimeout(() => {
    const pos = getCaretCoordinates();
    if (pos) {
      socket.emit('cursorMove', pos);
    }
  }, 50);
}

socket.on('edit', (content) => {
  if (editor.innerHTML !== content) {
    editor.innerHTML = content;
  }
});

socket.on('init', ({ documentContent, whiteboardLines }) => {
  editor.innerHTML = documentContent;
  // Redraw whiteboard
  whiteboardLines.forEach(line => drawLine(line.x0, line.y0, line.x1, line.y1, false, line.color, line.size));
});

socket.on('setColor', (color) => {
  userColor = color;
});

// Handle other users’ cursors
socket.on('cursorMove', ({ id, pos, color }) => {
  if (!otherCursors[id]) {
    const cursorEl = document.createElement('div');
    cursorEl.classList.add('cursor');
    cursorEl.style.backgroundColor = color;

    const label = document.createElement('div');
    label.classList.add('cursor-label');
    label.textContent = `User ${id.slice(0, 4)}`;
    label.style.backgroundColor = color;

    cursorsContainer.appendChild(cursorEl);
    cursorsContainer.appendChild(label);
    otherCursors[id] = { cursorEl, label };
  }

  const { cursorEl, label } = otherCursors[id];
  cursorEl.style.top = pos.top + 'px';
  cursorEl.style.left = pos.left + 'px';
  label.style.top = pos.top - 20 + 'px';
  label.style.left = pos.left + 'px';
});

// Remove cursors on user leave
socket.on('userLeft', (id) => {
  if (otherCursors[id]) {
    otherCursors[id].cursorEl.remove();
    otherCursors[id].label.remove();
    delete otherCursors[id];
  }
});

/* ----- Shared Whiteboard ----- */
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');

function resizeCanvas() {
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height); // preserve content
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.putImageData(data, 0, 0);
}
window.addEventListener('resize', () => {
  // On resize we clear and redraw all lines to avoid distortion
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  redrawAllLines();
});
resizeCanvas();

let drawing = false;
let current = { x: 0, y: 0 };

function getPos(e) {
  let rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  current = getPos(e);
});
canvas.addEventListener('mouseup', (e) => {
  if (!drawing) return;
  drawing = false;
  const pos = getPos(e);
  drawLine(current.x, current.y, pos.x, pos.y, true, colorPicker.value, brushSize.value);
});
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  drawLine(current.x, current.y, pos.x, pos.y, true, colorPicker.value, brushSize.value);
  current = pos;
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  drawing = true;
  current = getPos(e);
});
canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  drawing = false;
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const pos = getPos(e);
  drawLine(current.x, current.y, pos.x, pos.y, true, colorPicker.value, brushSize.value);
  current = pos;
});

function drawLine(x0, y0, x1, y1, emit, color, size) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.closePath();

  if (!emit) return;
  socket.emit('draw', { x0, y0, x1, y1, color, size });
}

let allLines = [];
function redrawAllLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  allLines.forEach(line => {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.size;
    ctx.beginPath();
    ctx.moveTo(line.x0, line.y0);
    ctx.lineTo(line.x1, line.y1);
    ctx.stroke();
    ctx.closePath();
  });
}

// Receive drawing from others
socket.on('draw', (data) => {
  allLines.push(data);
  drawLine(data.x0, data.y0, data.x1, data.y1, false, data.color, data.size);
});

// On init, fill allLines from server
socket.on('init', ({ whiteboardLines }) => {
  allLines = whiteboardLines || [];
  redrawAllLines();
});

// Clear whiteboard button
clearBtn.addEventListener('click', () => {
  socket.emit('clearWhiteboard');
});

socket.on('clearWhiteboard', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  allLines = [];
});
