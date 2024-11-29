// Canvas для звёздного поля
const canvas = document.getElementById('starfield')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Массив для звёзд
const stars = []
const numStars = 500

// Создаём звёзды
for (let i = 0; i < numStars; i++) {
	stars.push({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		radius: Math.random() * 2,
		alpha: Math.random(),
	})
}

// Функция отрисовки звёзд
function drawStars() {
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	for (let star of stars) {
		ctx.beginPath()
		ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
		ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
		ctx.fill()
	}
}

// Анимация звёзд
function animateStars() {
	for (let star of stars) {
		star.alpha += (Math.random() - 0.5) * 0.05
		if (star.alpha > 1) star.alpha = 1
		if (star.alpha < 0) star.alpha = 0
	}

	drawStars()
	requestAnimationFrame(animateStars)
}

// Вызываем анимацию
animateStars()

// Космический корабль
const spacecraftElement = document.getElementById('spacecraft')

const Spacecraft = {
	x: window.innerWidth / 2 - 50,
	y: window.innerHeight - 150,
	width: 100,
	height: 100,
	speed: 8,
	lives: 3,
	score: 0, // Добавляем счёт

	move: function () {
		spacecraftElement.style.left = `${this.x}px`
		spacecraftElement.style.top = `${this.y}px`
	},

	reset: function () {
		this.x = window.innerWidth / 2 - 50
		this.y = window.innerHeight - 150
		this.lives = 3
		this.score = 0 // Сбрасываем счёт
		showMessage('Game Restarted!')
		this.move()
	},
}

Spacecraft.move()

document.addEventListener('keydown', function (event) {
	if (event.key === 'w') Spacecraft.y -= Spacecraft.speed
	else if (event.key === 's') Spacecraft.y += Spacecraft.speed
	else if (event.key === 'a') Spacecraft.x -= Spacecraft.speed
	else if (event.key === 'd') Spacecraft.x += Spacecraft.speed
	else if (event.key === ' ') shootLaser() // Стрельба при нажатии пробела

	Spacecraft.move()
})

// Лазеры
const lasers = []
const laserSpeed = 10

// Стрельба лазером
function shootLaser() {
	const laser = {
		x: Spacecraft.x + Spacecraft.width / 2 - 5, // Позиция относительно корабля
		y: Spacecraft.y,
		width: 10,
		height: 20,
	}
	lasers.push(laser)
}

// Обновление и отрисовка лазеров
function updateLasers() {
	for (let i = 0; i < lasers.length; i++) {
		const laser = lasers[i]
		laser.y -= laserSpeed // Лазер движется вверх

		// Удаляем лазер, если он вышел за пределы экрана
		if (laser.y < 0) {
			lasers.splice(i, 1)
			i--
		} else {
			// Отрисовываем лазер
			ctx.fillStyle = 'red'
			ctx.fillRect(laser.x, laser.y, laser.width, laser.height)
		}
	}
}

// Астероиды
const speedMultiplier = 2
let asteroidData = [] // Массив с данными астероидов
let level = 1

// Функция для создания астероидов
function createAsteroids() {
	const numAsteroids = 5 + level * 5 // Увеличиваем количество астероидов на каждом уровне
	asteroidData = [] // Очищаем старые астероиды

	// Создание элементов астероидов в DOM
	const gameArea = document.body

	for (let i = 0; i < numAsteroids; i++) {
		const asteroidElement = document.createElement('img')
		asteroidElement.classList.add('asteroid')
		asteroidElement.src = `images/asteroid${(i % 5) + 1}.png` // Используем разные картинки для астероидов
		gameArea.appendChild(asteroidElement)

		asteroidData.push({
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			speedX: (Math.random() - 0.5) * speedMultiplier,
			speedY: (Math.random() - 0.5) * speedMultiplier,
			size: Math.random() * 120 + 120,
			destroyed: false,
			element: asteroidElement, // Ссылка на DOM элемент
		})
	}
}

// Устанавливаем начальные позиции и размеры астероидов
function setInitialPositions() {
	createAsteroids()
	for (let i = 0; i < asteroidData.length; i++) {
		const data = asteroidData[i]
		const asteroid = data.element

		asteroid.style.width = `${data.size}px`
		asteroid.style.height = `${data.size}px`
		asteroid.style.left = `${data.x}px`
		asteroid.style.top = `${data.y}px`
		asteroid.style.position = 'absolute'
	}
}

// Обновляем позиции астероидов
function updateAsteroidPositions() {
	for (let i = 0; i < asteroidData.length; i++) {
		const data = asteroidData[i]
		const asteroid = data.element

		if (!data.destroyed) {
			data.x += data.speedX
			data.y += data.speedY

			if (data.x > window.innerWidth) data.x = 0
			if (data.x < 0) data.x = window.innerWidth
			if (data.y > window.innerHeight) data.y = 0
			if (data.y < 0) data.y = window.innerHeight

			asteroid.style.left = `${data.x}px`
			asteroid.style.top = `${data.y}px`
		}
	}
}

// Проверка столкновений
function checkCollisions() {
	// Проверка столкновений с астероидами
	for (let i = 0; i < asteroidData.length; i++) {
		const data = asteroidData[i]
		const asteroid = data.element

		if (
			!data.destroyed &&
			Spacecraft.x < data.x + data.size &&
			Spacecraft.x + Spacecraft.width > data.x &&
			Spacecraft.y < data.y + data.size &&
			Spacecraft.y + Spacecraft.height > data.y
		) {
			// Если столкновение — игра окончена
			showMessage('Game Over!')
			Spacecraft.reset()
			return
		}
	}

	// Проверка уничтожения астероидов лазерами
	for (let i = 0; i < lasers.length; i++) {
		const laser = lasers[i]
		for (let j = 0; j < asteroidData.length; j++) {
			const data = asteroidData[j]
			if (
				!data.destroyed &&
				laser.x < data.x + data.size &&
				laser.x + laser.width > data.x &&
				laser.y < data.y + data.size &&
				laser.y + laser.height > data.y
			) {
				// Если астероид уничтожен
				data.destroyed = true
				data.element.style.display = 'none' // Скрываем астероид в DOM
				lasers.splice(i, 1)
				i--
				Spacecraft.score += 10 // Добавляем очки за уничтожение
				updateScore() // Обновляем отображение счёта
				break
			}
		}
	}
}

// Обновление счёта
function updateScore() {
	document.getElementById('score').innerText = `Score: ${Spacecraft.score}`
}

// Показать сообщение
function showMessage(message) {
	const messageElement = document.getElementById('message')
	messageElement.innerText = message
	messageElement.style.display = 'block'
	setTimeout(() => {
		messageElement.style.display = 'none'
	}, 2000)
}

// Основной игровой цикл
function gameLoop() {
	updateAsteroidPositions()
	updateLasers()
	checkCollisions()

	if (Spacecraft.score >= 100) {
		level++
		document.getElementById('level').innerText = `Level: ${level}`
		createAsteroids()
	}

	requestAnimationFrame(gameLoop)
}

// Запуск игры
setInitialPositions()
gameLoop()


