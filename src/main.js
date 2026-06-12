import './style.css'

const TILE = 24
const TICK_MS = 120
const POWER_TICKS = 55
const START_LIVES = 3

const LEVEL_TEMPLATE = [
  '###################',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#o###.##.#.##.###o#',
  '#....P............#',
  '#.###.#.###.#.###.#',
  '#.....#...#.#.....#',
  '#####.###.#.###.###',
  '#.......#.#.......#',
  '###.###.#.#.###.###',
  '#...#...G.G...#...#',
  '#.#.#.##.#.##.#.#.#',
  '#o..#....G....#..o#',
  '#.#####.###.#####.#',
  '#........#........#',
  '###################'
]

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

const keyMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right'
}
const codeMap = {
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right'
}

document.querySelector('#app').innerHTML = `
  <main class="game-shell">
    <h1>Neon Pac-Man</h1>
    <p class="subtitle">Eat every pellet, avoid ghosts, and use power pellets to fight back.</p>
    <div class="hud">
      <p><strong>Score:</strong> <span id="score">0</span></p>
      <p><strong>Lives:</strong> <span id="lives">${START_LIVES}</span></p>
      <p><strong>Status:</strong> <span id="status">Running</span></p>
    </div>
    <canvas id="game" aria-label="Pac-Man game board"></canvas>
    <div class="controls">
      <p>Controls: Click board, then Arrow keys or WASD</p>
      <button id="restart" type="button">Restart game</button>
    </div>
  </main>
`

const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')
const scoreNode = document.querySelector('#score')
const livesNode = document.querySelector('#lives')
const statusNode = document.querySelector('#status')
const restartButton = document.querySelector('#restart')

const rows = LEVEL_TEMPLATE.length
const cols = LEVEL_TEMPLATE[0].length
canvas.width = cols * TILE
canvas.height = rows * TILE

const level = LEVEL_TEMPLATE.map((row) => row.split(''))

function findTile(symbol) {
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (level[y][x] === symbol) return { x, y }
    }
  }
  return null
}

function findAllTiles(symbol) {
  const points = []
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (level[y][x] === symbol) points.push({ x, y })
    }
  }
  return points
}

const pacmanStart = findTile('P')
const ghostStarts = findAllTiles('G')

if (!pacmanStart || ghostStarts.length === 0) {
  throw new Error('Level is missing required spawn tiles')
}

level[pacmanStart.y][pacmanStart.x] = ' '
for (const ghostStart of ghostStarts) {
  level[ghostStart.y][ghostStart.x] = ' '
}

let score = 0
let lives = START_LIVES
let status = 'Running'
let powerTicks = 0
let mouthTick = 0
let gameTimer = null

let pacman = {
  x: pacmanStart.x,
  y: pacmanStart.y,
  dir: 'left',
  nextDir: 'left'
}

const ghostColors = ['#ef4444', '#f472b6', '#38bdf8']
let ghosts = ghostStarts.map((start, index) => ({
  x: start.x,
  y: start.y,
  startX: start.x,
  startY: start.y,
  dir: index % 2 ? 'left' : 'right',
  color: ghostColors[index % ghostColors.length]
}))

let pelletsLeft = countRemainingPellets()

function countRemainingPellets() {
  let count = 0
  for (const row of level) {
    for (const cell of row) {
      if (cell === '.' || cell === 'o') count += 1
    }
  }
  return count
}

function isWall(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return true
  return level[y][x] === '#'
}

function canMove(x, y, dir) {
  const delta = DIRECTIONS[dir]
  if (!delta) return false
  return !isWall(x + delta.x, y + delta.y)
}

function moveActor(actor) {
  if (actor.nextDir && canMove(actor.x, actor.y, actor.nextDir)) {
    actor.dir = actor.nextDir
  }
  if (canMove(actor.x, actor.y, actor.dir)) {
    const delta = DIRECTIONS[actor.dir]
    actor.x += delta.x
    actor.y += delta.y
  }
}

function chooseGhostDirection(ghost) {
  const options = Object.keys(DIRECTIONS).filter((dir) => {
    if (!canMove(ghost.x, ghost.y, dir)) return false
    return dir !== OPPOSITE[ghost.dir]
  })
  if (options.length === 0) {
    return OPPOSITE[ghost.dir]
  }

  options.sort((a, b) => {
    const aDelta = DIRECTIONS[a]
    const bDelta = DIRECTIONS[b]
    const aDist = Math.abs(ghost.x + aDelta.x - pacman.x) + Math.abs(ghost.y + aDelta.y - pacman.y)
    const bDist = Math.abs(ghost.x + bDelta.x - pacman.x) + Math.abs(ghost.y + bDelta.y - pacman.y)

    if (powerTicks > 0) return bDist - aDist
    return aDist - bDist
  })

  if (Math.random() < 0.2) {
    return options[Math.floor(Math.random() * options.length)]
  }
  return options[0]
}

function eatPellet() {
  const tile = level[pacman.y][pacman.x]
  if (tile === '.') {
    level[pacman.y][pacman.x] = ' '
    score += 10
    pelletsLeft -= 1
  } else if (tile === 'o') {
    level[pacman.y][pacman.x] = ' '
    score += 50
    pelletsLeft -= 1
    powerTicks = POWER_TICKS
  }
}

function resetRoundPositions() {
  pacman = { x: pacmanStart.x, y: pacmanStart.y, dir: 'left', nextDir: 'left' }
  ghosts = ghosts.map((ghost) => ({
    ...ghost,
    x: ghost.startX,
    y: ghost.startY,
    dir: Math.random() < 0.5 ? 'left' : 'right'
  }))
}

function setStatus(nextStatus) {
  status = nextStatus
  statusNode.textContent = status
}

function handleGhostCollisions() {
  for (const ghost of ghosts) {
    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      if (powerTicks > 0) {
        score += 200
        ghost.x = ghost.startX
        ghost.y = ghost.startY
        ghost.dir = 'left'
      } else {
        lives -= 1
        if (lives <= 0) {
          lives = 0
          setStatus('Game over')
          stopGame()
        } else {
          setStatus('Hit! Keep going')
          resetRoundPositions()
        }
      }
    }
  }
}

function step() {
  if (status !== 'Running' && status !== 'Hit! Keep going') return

  mouthTick += 1
  setStatus('Running')

  moveActor(pacman)
  eatPellet()

  for (const ghost of ghosts) {
    ghost.dir = chooseGhostDirection(ghost)
    moveActor(ghost)
  }

  handleGhostCollisions()

  if (powerTicks > 0) powerTicks -= 1
  if (pelletsLeft <= 0) {
    setStatus('You win!')
    stopGame()
  }

  scoreNode.textContent = String(score)
  livesNode.textContent = String(lives)
  draw()
}

function drawCell(x, y, cell) {
  const px = x * TILE
  const py = y * TILE

  if (cell === '#') {
    ctx.fillStyle = '#2a0d66'
    ctx.fillRect(px, py, TILE, TILE)
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2
    ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2)
  } else {
    ctx.fillStyle = '#05010d'
    ctx.fillRect(px, py, TILE, TILE)
    if (cell === '.' || cell === 'o') {
      const radius = cell === 'o' ? 4 : 2
      ctx.beginPath()
      ctx.fillStyle = '#fde047'
      ctx.arc(px + TILE / 2, py + TILE / 2, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawPacman() {
  const px = pacman.x * TILE + TILE / 2
  const py = pacman.y * TILE + TILE / 2
  const angle = (mouthTick % 2 === 0 ? 0.2 : 0.05) * Math.PI
  const dirAngles = {
    right: [angle, 2 * Math.PI - angle],
    left: [Math.PI + angle, Math.PI - angle],
    up: [1.5 * Math.PI + angle, 1.5 * Math.PI - angle],
    down: [0.5 * Math.PI + angle, 0.5 * Math.PI - angle]
  }
  const [start, end] = dirAngles[pacman.dir]
  ctx.beginPath()
  ctx.fillStyle = '#facc15'
  ctx.moveTo(px, py)
  ctx.arc(px, py, TILE * 0.42, start, end, false)
  ctx.closePath()
  ctx.fill()
}

function drawGhost(ghost) {
  const px = ghost.x * TILE
  const py = ghost.y * TILE
  const frightened = powerTicks > 0
  const color = frightened ? '#60a5fa' : ghost.color

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(px + TILE / 2, py + TILE / 2, TILE * 0.38, Math.PI, 0)
  ctx.lineTo(px + TILE * 0.88, py + TILE * 0.86)
  ctx.lineTo(px + TILE * 0.72, py + TILE * 0.7)
  ctx.lineTo(px + TILE * 0.56, py + TILE * 0.86)
  ctx.lineTo(px + TILE * 0.4, py + TILE * 0.7)
  ctx.lineTo(px + TILE * 0.24, py + TILE * 0.86)
  ctx.lineTo(px + TILE * 0.12, py + TILE * 0.58)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(px + TILE * 0.38, py + TILE * 0.45, 3, 0, Math.PI * 2)
  ctx.arc(px + TILE * 0.62, py + TILE * 0.45, 3, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      drawCell(x, y, level[y][x])
    }
  }

  drawPacman()
  for (const ghost of ghosts) drawGhost(ghost)
}

function stopGame() {
  if (gameTimer !== null) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

function startGame() {
  stopGame()
  gameTimer = setInterval(step, TICK_MS)
}

function resetGame() {
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      level[y][x] = LEVEL_TEMPLATE[y][x]
    }
  }

  level[pacmanStart.y][pacmanStart.x] = ' '
  for (const ghostStart of ghostStarts) {
    level[ghostStart.y][ghostStart.x] = ' '
  }

  score = 0
  lives = START_LIVES
  powerTicks = 0
  mouthTick = 0
  pelletsLeft = countRemainingPellets()
  scoreNode.textContent = String(score)
  livesNode.textContent = String(lives)
  setStatus('Running')
  resetRoundPositions()
  draw()
  startGame()
}

function handleDirectionInput(event) {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  const dir = keyMap[key] ?? codeMap[event.code]
  if (!dir) return
  event.preventDefault()
  pacman.nextDir = dir
}

window.addEventListener('keydown', handleDirectionInput)
document.addEventListener('keydown', handleDirectionInput)
canvas.tabIndex = 0
canvas.addEventListener('pointerdown', () => canvas.focus())
canvas.focus()

restartButton.addEventListener('click', () => {
  resetGame()
})

resetGame()
