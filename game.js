let playerJet;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let score = 0;
let health = 5; 
let gameOver = false;
let gameStarted = false;
let gameStartedTime = 0; 

let videoBg;
let playerJetImage;
let enemyJetImage;
let playerShootSound;
let enemyShootSound;
let explosionSound; 
let logoImage;

function preload() {
    videoBg = createVideo(['videos/sky.mp4'], videoLoaded); 
    playerJetImage = loadImage("images/mee.png");
    enemyJetImage = loadImage("images/e.png");
    playerShootSound = loadSound("sounds/launch.mp3");
    enemyShootSound = loadSound("sounds/boom.mp3");
    explosionSound = loadSound("sounds/explosion.mp3");
    logoImage = loadImage("images/logo.png"); 
}

function setup() {
    createCanvas(1280, 720); 
    playerJet = new Jet(width / 2, height - 100);
    textAlign(CENTER, CENTER);
    videoBg.hide(); 
}

function videoLoaded() {
    videoBg.loop();
    videoBg.hide(); 
}

function draw() {
    background(0);
    if (!gameStarted) {
        displayStartScreen();
    } else if (!gameOver) {
        videoBg.show();
        videoBg.play(); 
        image(videoBg, 0, 0, width, height);
        playerJet.update();
        playerJet.display();
        handleEnemies();
        handleBullets();
        handleEnemyBullets();
        displayScore();
        displayHealth();
    } else {
        displayGameOver();
    }
}

function displayStartScreen() {
    image(videoBg, 0, 0, width, height); 
    image(logoImage, width / 2 - logoImage.width / 2, height / 2 - logoImage.height / 2 - 100);
    fill(255);
    rectMode(CENTER);
    rect(width / 2, height / 2 + 100, 200, 50);
    fill(0);
    textSize(24);
    text("Start Game", width / 2, height / 2 + 100);
}

function keyPressed() {
    if (!gameStarted) return;

    if (keyCode === LEFT_ARROW) {
        playerJet.setDirection(-1);
    } else if (keyCode === RIGHT_ARROW) {
        playerJet.setDirection(1);
    }
    if (key === ' ') {
        playerJet.shoot();
        return false;
    }
    return false;
}

function keyReleased() {
    if (!gameStarted) return;

    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        playerJet.setDirection(0);
    }
}

class Jet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.direction = 0;
    }

    display() {
        image(playerJetImage, this.x - playerJetImage.width / 4, this.y - playerJetImage.height / 4, playerJetImage.width / 2, playerJetImage.height / 2);
    }

    update() {
        this.x += this.speed * this.direction;
        this.x = constrain(this.x, 0, width);
    }

    setDirection(dir) {
        this.direction = dir;
    }

    shoot() {
        bullets.push(new Bullet(this.x, this.y - 20, 15, -PI / 2, "player"));
        playerShootSound.play();
    }
}

class Enemy {
    constructor() {
        this.x = random(width);
        this.y = -50;
        this.speedY = random(3, 4);
        this.speedX = random(-3, 3);
        this.shootInterval = random(1000, 2000);
        this.lastShotTime = millis();
    }

    display() {
        image(enemyJetImage, this.x - enemyJetImage.width / 4, this.y - enemyJetImage.height / 4, enemyJetImage.width / 2, enemyJetImage.height / 2);
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        if (random(1) < 0.01) {
            this.speedX *= -1;
        }

        this.x = constrain(this.x, 0, width);
        this.display();

        if (millis() - this.lastShotTime > this.shootInterval) {
            this.shoot();
            this.lastShotTime = millis();
        }
    }

    shoot() {
        let angle = PI / 2;
        enemyBullets.push(new Bullet(this.x, this.y + enemyJetImage.height / 4, 7, angle, "enemy"));
        enemyShootSound.play();
    }
}

class Bullet {
    constructor(x, y, speed, angle, type) {
        this.x = x;
        this.y = y;
        this.vx = speed * cos(angle);
        this.vy = speed * sin(angle);
        this.size = 5;
        this.type = type;
    }

    display() {
        if (this.type === "player") {
            fill(0);
        } else {
            fill(255, 0, 0);
        }

        push();
        translate(this.x, this.y);
        rotate(atan2(this.vy, this.vx) + PI / 2);
        beginShape();
        vertex(0, -10);
        vertex(5, 5);
        vertex(0, 0);
        vertex(-5, 5);
        endShape(CLOSE);
        pop();

        this.x += this.vx;
        this.y += this.vy;
    }

    offScreen() {
        return this.y < 0 || this.y > height;
    }

    update() {
        this.y += this.vy;
        this.x += this.vx;
    }
}

function handleEnemies() {
    if (frameCount % 60 === 0) {
        enemies.push(new Enemy());
    }
    enemies.forEach((enemy, i) => {
        enemy.update();
        if (enemy.y > height + 50) {
            enemies.splice(i, 1);
        }

        if (dist(enemy.x, enemy.y, playerJet.x, playerJet.y) < 50) {
            explosionSound.play();
            gameOver = true;
            health = 0;
        }
    });
}

function handleBullets() {
    bullets.forEach((bullet, i) => {
        bullet.display();
        bullet.update();
        for (let j = enemies.length - 1; j >= 0; j--) {
            let enemy = enemies[j];
            if (dist(bullet.x, bullet.y, enemy.x, enemy.y) < 20) {
                explosionSound.play();
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
            }
        }
        if (bullet.offScreen()) {
            bullets.splice(i, 1);
        }
    });
}

function handleEnemyBullets() {
    enemyBullets.forEach((bullet, i) => {
        if (bullet) {
            bullet.display();
            bullet.update();
            if (dist(bullet.x, bullet.y, playerJet.x, playerJet.y) < 25) {
                enemyBullets.splice(i, 1);
                health--;
                if (health <= 0) {
                    explosionSound.play();
                    gameOver = true;
                }
            } else if (bullet.offScreen()) {
                enemyBullets.splice(i, 1);
            }
        }
    });
}

function displayScore() {
    fill(255);
    textSize(24);
    textAlign(LEFT);
    text(`Score: ${score}`, 40, 30);
}

function displayHealth() {
    let healthX = width - 180;
    let offset = 30;
    for (let i = 0; i < health; i++) {
        drawHeart(healthX + i * offset, 30, 20, 20);
    }
}

function drawHeart(x, y, width, height) {
    fill(255, 0, 0);
    beginShape();
    vertex(x, y);
    bezierVertex(x - width / 2, y - height / 2, x - width, y + height / 3, x, y + height);
    bezierVertex(x + width, y + height / 3, x + width / 2, y - height / 2, x, y);
    endShape(CLOSE);
}

function displayGameOver() {
    textSize(48);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 40);

    fill(255);
    rectMode(CENTER);
    rect(width / 2, height / 2 + 40, 120, 40);
    fill(0);
    textSize(20);
    text("Restart", width / 2, height / 2 + 45);
}

function mouseClicked() {
    let restartX = width / 2 - 60;
    let restartY = height / 2 + 40 - 20;

    if (!gameStarted) {
        let startX = width / 2 - 100;
        let startY = height / 2 + 100 - 25;
        if (mouseX >= startX && mouseX <= startX + 200 && mouseY >= startY && mouseY <= startY + 50) {
            userStartAudio();
            videoBg.show();
            videoBg.play();
            gameStarted = true;
            gameStartedTime = millis();
        }
        return;
    }

    if (mouseX >= restartX && mouseX <= restartX + 120 && mouseY >= restartY && mouseY <= restartY + 40) {
        if (gameOver) {
            restartGame();
        }
    }
}

function restartGame() {
    score = 0;
    gameOver = false;
    enemies = [];
    bullets = [];
    enemyBullets = [];
    health = 5;
    playerJet = new Jet(width / 2, height - 100);
    gameStartedTime = millis();
    videoBg.show();
    videoBg.play();
}

function userStartAudio() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}
