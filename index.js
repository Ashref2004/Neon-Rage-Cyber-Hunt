 // Game constants
 const PLAYER_SPEED = 5;
 const PLAYER_JUMP_FORCE = 12;
 const GRAVITY = 0.5;
 const BULLET_TIME_DURATION = 3000;
 const BULLET_TIME_COOLDOWN = 5000;
 const COMBO_TIMEOUT = 2000;
 const WALL_JUMP_FORCE = 8;
 const WALL_SLIDE_SPEED = 1;
 
 // Game variables
 let canvas, ctx;
 let gameWidth, gameHeight;
 let keys = {};
 let mouse = { x: 0, y: 0, left: false, right: false };
 let gameRunning = false;
 let score = 0;
 let comboCount = 0;
 let comboTimeout;
 let isMobile = false;
 
 // Player object
 let player = {
     x: 0,
     y: 0,
     width: 40,
     height: 60,
     speedX: 0,
     speedY: 0,
     isJumping: false,
     isWallSliding: false,
     isWallJumping: false,
     facing: 1, // 1 for right, -1 for left
     health: 100,
     maxHealth: 100,
     bulletTime: 100,
     isBulletTime: false,
     lastBulletTime: 0,
     attackCooldown: 0,
     attacks: [],
     isAttacking: false,
     bullets: [],
     lastShot: 0,
     shotCooldown: 300,
     grapplingHook: {
         active: false,
         x: 0,
         y: 0,
         length: 0,
         maxLength: 300
     },
     skins: ['default', 'cyber-ninja', 'neon-samurai'],
     currentSkin: 'default'
 };
 
 // Game objects
 let platforms = [];
 let enemies = [];
 let bullets = [];
 let particles = [];
 let backgroundElements = [];
 let currentLevel = 1;
 let boss = null;
 let bossActive = false;
 
 // Initialize the game
 function init() {
     canvas = document.getElementById('gameCanvas');
     ctx = canvas.getContext('2d');
     
     // Check if mobile
     isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
     if (isMobile) {
         document.getElementById('mobileControls').style.display = 'flex';
         setupMobileControls();
     }
     
     resizeCanvas();
     window.addEventListener('resize', resizeCanvas);
     
     // Event listeners
     document.addEventListener('keydown', keyDown);
     document.addEventListener('keyup', keyUp);
     canvas.addEventListener('mousemove', mouseMove);
     canvas.addEventListener('mousedown', mouseDown);
     canvas.addEventListener('mouseup', mouseUp);
     canvas.addEventListener('touchstart', handleTouch, { passive: false });
     canvas.addEventListener('touchmove', handleTouch, { passive: false });
     canvas.addEventListener('touchend', handleTouchEnd);
     
     // UI buttons
     document.getElementById('startButton').addEventListener('click', startGame);
     document.getElementById('restartButton').addEventListener('click', restartGame);
     
     // Generate level
     generateLevel(currentLevel);
     
     // Start game loop
     requestAnimationFrame(gameLoop);
 }
 
 // Set up mobile controls
 function setupMobileControls() {
     // Movement buttons
     document.getElementById('upBtn').addEventListener('touchstart', () => { keys['ArrowUp'] = true; });
     document.getElementById('upBtn').addEventListener('touchend', () => { keys['ArrowUp'] = false; });
     document.getElementById('leftBtn').addEventListener('touchstart', () => { keys['ArrowLeft'] = true; });
     document.getElementById('leftBtn').addEventListener('touchend', () => { keys['ArrowLeft'] = false; });
     document.getElementById('downBtn').addEventListener('touchstart', () => { keys['ArrowDown'] = true; });
     document.getElementById('downBtn').addEventListener('touchend', () => { keys['ArrowDown'] = false; });
     document.getElementById('rightBtn').addEventListener('touchstart', () => { keys['ArrowRight'] = true; });
     document.getElementById('rightBtn').addEventListener('touchend', () => { keys['ArrowRight'] = false; });
     
     // Action buttons
     document.getElementById('jumpBtn').addEventListener('touchstart', () => { keys[' '] = true; });
     document.getElementById('jumpBtn').addEventListener('touchend', () => { keys[' '] = false; });
     document.getElementById('attackBtn').addEventListener('touchstart', () => { mouse.left = true; });
     document.getElementById('attackBtn').addEventListener('touchend', () => { mouse.left = false; });
     document.getElementById('bulletTimeBtn').addEventListener('touchstart', () => { keys['Shift'] = true; });
     document.getElementById('bulletTimeBtn').addEventListener('touchend', () => { keys['Shift'] = false; });
 }
 
 // Handle touch events
 function handleTouch(e) {
     e.preventDefault();
     if (e.touches) {
         mouse.x = e.touches[0].clientX - canvas.offsetLeft;
         mouse.y = e.touches[0].clientY - canvas.offsetTop;
         mouse.left = true;
     }
 }
 
 function handleTouchEnd(e) {
     e.preventDefault();
     mouse.left = false;
 }
 
 // Resize canvas to fit window
 function resizeCanvas() {
     gameWidth = window.innerWidth;
     gameHeight = window.innerHeight;
     canvas.width = gameWidth;
     canvas.height = gameHeight;
     
     // Reposition player if game is running
     if (gameRunning) {
         player.x = gameWidth / 4;
     }
 }
 
 // Keyboard input
 function keyDown(e) {
     keys[e.key] = true;
     
     // Start game on any key if not running
     if (!gameRunning && e.key !== 'Escape') {
         startGame();
     }
     
     // Debug cheat
     if (e.key === 'p') {
         score += 1000;
     }
 }
 
 function keyUp(e) {
     keys[e.key] = false;
 }
 
 // Mouse input
 function mouseMove(e) {
     mouse.x = e.clientX - canvas.offsetLeft;
     mouse.y = e.clientY - canvas.offsetTop;
 }
 
 function mouseDown(e) {
     if (e.button === 0) mouse.left = true;
     if (e.button === 2) mouse.right = true;
 }
 
 function mouseUp(e) {
     if (e.button === 0) mouse.left = false;
     if (e.button === 2) mouse.right = false;
 }
 
 // Start the game
 function startGame() {
     document.getElementById('startScreen').style.display = 'none';
     gameRunning = true;
     player.x = gameWidth / 4;
     player.y = gameHeight / 2;
     player.health = player.maxHealth;
     score = 0;
     updateUI();
 }
 
 // Restart the game
 function restartGame() {
     document.getElementById('gameOverScreen').style.display = 'none';
     enemies = [];
     bullets = [];
     particles = [];
     generateLevel(currentLevel);
     player.x = gameWidth / 4;
     player.y = gameHeight / 2;
     player.health = player.maxHealth;
     player.bulletTime = 100;
     player.isBulletTime = false;
     score = 0;
     comboCount = 0;
     updateUI();
     gameRunning = true;
 }
 
 // Game over
 function gameOver() {
     gameRunning = false;
     document.getElementById('gameOverScreen').style.display = 'flex';
     document.getElementById('finalScore').textContent = `FINAL SCORE: ${score}`;
 }
 
 // Generate game level
 function generateLevel(level) {
     platforms = [];
     backgroundElements = [];
     
     // Ground platform
     platforms.push({
         x: 0,
         y: gameHeight - 50,
         width: gameWidth * 2,
         height: 50,
         color: '#333'
     });
     
     // Additional platforms based on level
     const platformCount = 5 + level * 2;
     for (let i = 0; i < platformCount; i++) {
         const width = 100 + Math.random() * 150;
         const height = 20;
         const x = 200 + Math.random() * (gameWidth * 1.5 - 200);
         const y = gameHeight - 150 - Math.random() * (gameHeight - 300);
         
         platforms.push({
             x: x,
             y: y,
             width: width,
             height: height,
             color: `hsl(${Math.random() * 60 + 200}, 70%, 30%)`
         });
     }
     
     // Walls for wall jumping
     platforms.push({
         x: -50,
         y: 0,
         width: 50,
         height: gameHeight,
         color: '#222'
     });
     
     platforms.push({
         x: gameWidth * 2,
         y: 0,
         width: 50,
         height: gameHeight,
         color: '#222'
     });
     
     // Background elements (neon signs, buildings, etc.)
     for (let i = 0; i < 20; i++) {
         backgroundElements.push({
             x: Math.random() * gameWidth * 2,
             y: Math.random() * gameHeight * 0.7,
             width: 50 + Math.random() * 150,
             height: 100 + Math.random() * 300,
             color: `hsl(${Math.random() * 360}, 70%, 30%)`,
             brightness: Math.random() * 0.5 + 0.1
         });
     }
     
     // Generate enemies based on level
     enemies = [];
     const enemyCount = 3 + level * 2;
     for (let i = 0; i < enemyCount; i++) {
         spawnEnemy();
     }
     
     // Generate boss every 3 levels
     if (level % 3 === 0) {
         spawnBoss();
         bossActive = true;
     } else {
         bossActive = false;
     }
 }
 
 // Spawn a new enemy
 function spawnEnemy() {
     const types = ['drone', 'cyber-ninja', 'melee-bot'];
     const type = types[Math.floor(Math.random() * types.length)];
     
     const enemy = {
         x: gameWidth + Math.random() * gameWidth,
         y: gameHeight - 150 - Math.random() * (gameHeight - 300),
         width: 40,
         height: 60,
         speedX: -1 - Math.random() * 2,
         speedY: 0,
         health: 30 + currentLevel * 10,
         maxHealth: 30 + currentLevel * 10,
         type: type,
         attackCooldown: 0,
         lastAttack: 0,
         attackRate: 1000 + Math.random() * 1000,
         color: type === 'drone' ? '#f0f' : type === 'cyber-ninja' ? '#0ff' : '#f00',
         isAttacking: false,
         attacks: []
     };
     
     enemies.push(enemy);
 }
 
 // Spawn boss enemy
 function spawnBoss() {
     boss = {
         x: gameWidth * 1.5,
         y: gameHeight - 300,
         width: 120,
         height: 180,
         speedX: -1,
         speedY: 0,
         health: 200 + currentLevel * 50,
         maxHealth: 200 + currentLevel * 50,
         type: 'cyber-mech',
         phase: 1,
         attackPattern: 0,
         attackCooldown: 0,
         lastAttack: 0,
         attackRate: 1500,
         color: '#f80',
         isAttacking: false,
         attacks: [],
         missiles: []
     };
 }
 
 // Main game loop
 function gameLoop(timestamp) {
     if (gameRunning) {
         update(timestamp);
     }
     render();
     requestAnimationFrame(gameLoop);
 }
 
 // Update game state
 function update(timestamp) {
     // Update player
     updatePlayer(timestamp);
     
     // Update enemies
     updateEnemies(timestamp);
     
     // Update boss
     if (bossActive && boss) {
         updateBoss(timestamp);
     }
     
     // Update bullets
     updateBullets();
     
     // Update attacks
     updateAttacks();
     
     // Update particles
     updateParticles();
     
     // Check for level completion
     if (enemies.length === 0 && !bossActive) {
         currentLevel++;
         generateLevel(currentLevel);
     }
     
     // Update UI
     updateUI();
 }
 
 // Update player state
 function updatePlayer(timestamp) {
     // Horizontal movement
     player.speedX = 0;
     if (keys['ArrowLeft'] || keys['a']) {
         player.speedX = -PLAYER_SPEED;
         player.facing = -1;
     }
     if (keys['ArrowRight'] || keys['d']) {
         player.speedX = PLAYER_SPEED;
         player.facing = 1;
     }
     
     // Apply bullet time effect
     const timeScale = player.isBulletTime ? 0.4 : 1;
     
     // Jumping
     if ((keys[' '] || keys['ArrowUp'] || keys['w']) && !player.isJumping && !player.isWallSliding) {
         player.speedY = -PLAYER_JUMP_FORCE;
         player.isJumping = true;
         createParticles(player.x + player.width/2, player.y + player.height, 10, '#0ff');
     }
     
     // Wall sliding and jumping
     if (player.isWallSliding) {
         player.speedY = WALL_SLIDE_SPEED;
         
         if (keys[' '] || keys['ArrowUp'] || keys['w']) {
             player.speedY = -WALL_JUMP_FORCE;
             player.speedX = WALL_JUMP_FORCE * (player.facing * -1);
             player.isWallSliding = false;
             player.isWallJumping = true;
             createParticles(player.x + (player.facing === 1 ? player.width : 0), player.y + player.height/2, 10, '#0ff');
         }
     }
     
     // Apply gravity
     player.speedY += GRAVITY * timeScale;
     
     // Update position
     player.x += player.speedX * timeScale;
     player.y += player.speedY * timeScale;
     
     // Check platform collisions
     checkPlatformCollisions();
     
     // Bullet time
     if ((keys['Shift'] || mouse.right) && player.bulletTime > 0 && timestamp - player.lastBulletTime > BULLET_TIME_COOLDOWN) {
         player.isBulletTime = true;
         player.bulletTime -= 0.5;
         
         if (player.bulletTime <= 0) {
             player.bulletTime = 0;
             player.isBulletTime = false;
             player.lastBulletTime = timestamp;
         }
     } else {
         player.isBulletTime = false;
         
         // Recharge bullet time when not active
         if (timestamp - player.lastBulletTime > BULLET_TIME_COOLDOWN && player.bulletTime < 100) {
             player.bulletTime += 0.1;
         }
     }
     
     // Attacking with sword
     if (mouse.left && player.attackCooldown <= 0) {
         player.isAttacking = true;
         player.attackCooldown = 300;
         
         // Create sword attack area
         const attackWidth = 80;
         const attackHeight = 60;
         const attackX = player.facing === 1 ? player.x + player.width : player.x - attackWidth;
         
         player.attacks.push({
             x: attackX,
             y: player.y,
             width: attackWidth,
             height: attackHeight,
             damage: 20 + comboCount * 2,
             timer: 100,
             type: 'sword',
             direction: player.facing
         });
         
         // Combo system
         comboCount++;
         updateComboCounter();
         
         // Sword slash effect
         createParticles(
             player.x + player.width/2 + player.facing * 40, 
             player.y + player.height/2, 
             15, 
             player.facing === 1 ? '#0ff' : '#f0f'
         );
     }
     
     // Shooting with blasters
     if (mouse.right && timestamp - player.lastShot > player.shotCooldown) {
         player.lastShot = timestamp;
         
         // Calculate direction to mouse
         const dx = mouse.x - (player.x + player.width/2);
         const dy = mouse.y - (player.y + player.height/2);
         const distance = Math.sqrt(dx * dx + dy * dy);
         const directionX = dx / distance;
         const directionY = dy / distance;
         
         // Create bullet
         bullets.push({
             x: player.x + player.width/2,
             y: player.y + player.height/2,
             speedX: directionX * 10,
             speedY: directionY * 10,
             width: 8,
             height: 8,
             damage: 15,
             color: '#ff0'
         });
         
         // Muzzle flash
         createParticles(player.x + player.width/2, player.y + player.height/2, 5, '#ff0');
     }
     
     // Grappling hook
     if (keys['r'] && !player.grapplingHook.active) {
         player.grapplingHook.active = true;
         player.grapplingHook.x = player.x + player.width/2;
         player.grapplingHook.y = player.y + player.height/2;
         player.grapplingHook.length = 0;
         
         // Calculate direction to mouse
         const dx = mouse.x - (player.x + player.width/2);
         const dy = mouse.y - (player.y + player.height/2);
         const distance = Math.sqrt(dx * dx + dy * dy);
         player.grapplingHook.directionX = dx / distance;
         player.grapplingHook.directionY = dy / distance;
     }
     
     // Update grappling hook
     if (player.grapplingHook.active) {
         player.grapplingHook.length += 15;
         
         // Check if hook hit something
         const hookX = player.grapplingHook.x + player.grapplingHook.directionX * player.grapplingHook.length;
         const hookY = player.grapplingHook.y + player.grapplingHook.directionY * player.grapplingHook.length;
         
         // Check platform collisions
         let hooked = false;
         for (const platform of platforms) {
             if (
                 hookX > platform.x && 
                 hookX < platform.x + platform.width && 
                 hookY > platform.y && 
                 hookY < platform.y + platform.height
             ) {
                 hooked = true;
                 break;
             }
         }
         
         // Pull player if hooked or max length reached
         if (hooked || player.grapplingHook.length >= player.grapplingHook.maxLength) {
             if (hooked) {
                 const pullForce = 0.2;
                 player.speedX += (hookX - (player.x + player.width/2)) * pullForce;
                 player.speedY += (hookY - (player.y + player.height/2)) * pullForce;
             }
             player.grapplingHook.active = false;
         }
     }
     
     // Update attack cooldown
     if (player.attackCooldown > 0) {
         player.attackCooldown -= 16 * timeScale;
     } else {
         player.isAttacking = false;
     }
     
     // Screen boundaries
     if (player.x < 0) {
         player.x = 0;
     }
     if (player.x > gameWidth * 2 - player.width) {
         player.x = gameWidth * 2 - player.width;
     }
     
     // Camera follow
     if (player.x > gameWidth * 0.6 && player.speedX > 0) {
         const scrollX = player.x - gameWidth * 0.6;
         player.x -= scrollX;
         
         // Move all game objects to simulate camera
         for (const platform of platforms) {
             platform.x -= scrollX;
         }
         
         for (const enemy of enemies) {
             enemy.x -= scrollX;
         }
         
         for (const bullet of bullets) {
             bullet.x -= scrollX;
         }
         
         for (const particle of particles) {
             particle.x -= scrollX;
         }
         
         for (const bgElement of backgroundElements) {
             bgElement.x -= scrollX;
         }
         
         if (boss) {
             boss.x -= scrollX;
             for (const missile of boss.missiles) {
                 missile.x -= scrollX;
             }
         }
     }
     
     // Check if player fell off the screen
     if (player.y > gameHeight) {
         player.health = 0;
     }
     
     // Check for player death
     if (player.health <= 0) {
         gameOver();
     }
 }
 
 // Check collisions between player and platforms
 function checkPlatformCollisions() {
     player.isWallSliding = false;
     
     for (const platform of platforms) {
         // Check if player is intersecting with platform
         if (
             player.x < platform.x + platform.width &&
             player.x + player.width > platform.x &&
             player.y < platform.y + platform.height &&
             player.y + player.height > platform.y
         ) {
             // Check if collision is from above
             if (
                 player.speedY > 0 && 
                 player.y + player.height - player.speedY <= platform.y
             ) {
                 player.y = platform.y - player.height;
                 player.speedY = 0;
                 player.isJumping = false;
                 player.isWallJumping = false;
             } 
             // Check if collision is from below
             else if (
                 player.speedY < 0 && 
                 player.y - player.speedY >= platform.y + platform.height
             ) {
                 player.y = platform.y + platform.height;
                 player.speedY = 0;
             }
             // Check if collision is from the left
             else if (
                 player.speedX > 0 && 
                 player.x + player.width - player.speedX <= platform.x
             ) {
                 player.x = platform.x - player.width;
                 player.speedX = 0;
                 
                 // Wall sliding
                 if (player.isJumping || player.isWallJumping) {
                     player.isWallSliding = true;
                     player.facing = -1;
                 }
             }
             // Check if collision is from the right
             else if (
                 player.speedX < 0 && 
                 player.x - player.speedX >= platform.x + platform.width
             ) {
                 player.x = platform.x + platform.width;
                 player.speedX = 0;
                 
                 // Wall sliding
                 if (player.isJumping || player.isWallJumping) {
                     player.isWallSliding = true;
                     player.facing = 1;
                 }
             }
         }
     }
 }
 
 // Update enemies
 function updateEnemies(timestamp) {
     for (let i = enemies.length - 1; i >= 0; i--) {
         const enemy = enemies[i];
         
         // Simple AI
         if (enemy.x < player.x) {
             enemy.speedX = 1;
         } else {
             enemy.speedX = -1;
         }
         
         // Apply bullet time effect
         const timeScale = player.isBulletTime ? 0.4 : 1;
         
         // Update position
         enemy.x += enemy.speedX * timeScale;
         enemy.y += enemy.speedY * timeScale;
         
         // Simple gravity
         enemy.speedY += GRAVITY * 0.5 * timeScale;
         
         // Check platform collisions
         let onGround = false;
         for (const platform of platforms) {
             if (
                 enemy.x < platform.x + platform.width &&
                 enemy.x + enemy.width > platform.x &&
                 enemy.y < platform.y + platform.height &&
                 enemy.y + enemy.height > platform.y
             ) {
                 // Check if collision is from above
                 if (
                     enemy.speedY > 0 && 
                     enemy.y + enemy.height - enemy.speedY <= platform.y
                 ) {
                     enemy.y = platform.y - enemy.height;
                     enemy.speedY = 0;
                     onGround = true;
                 }
             }
         }
         
         // Attack player
         if (enemy.attackCooldown <= 0) {
             const dx = player.x - enemy.x;
             const dy = player.y - enemy.y;
             const distance = Math.sqrt(dx * dx + dy * dy);
             
             if (distance < 150) {
                 enemy.isAttacking = true;
                 enemy.attackCooldown = enemy.attackRate;
                 
                 if (enemy.type === 'drone') {
                     // Shoot projectile
                     bullets.push({
                         x: enemy.x + enemy.width/2,
                         y: enemy.y + enemy.height/2,
                         speedX: dx/distance * 5,
                         speedY: dy/distance * 5,
                         width: 8,
                         height: 8,
                         damage: 10,
                         color: '#f0f',
                         isEnemy: true
                     });
                 } else {
                     // Melee attack
                     const attackWidth = 60;
                     const attackHeight = 60;
                     const attackX = dx > 0 ? enemy.x + enemy.width : enemy.x - attackWidth;
                     
                     enemy.attacks.push({
                         x: attackX,
                         y: enemy.y,
                         width: attackWidth,
                         height: attackHeight,
                         damage: 15,
                         timer: 100,
                         type: 'enemy'
                     });
                 }
             }
         } else {
             enemy.attackCooldown -= 16 * timeScale;
             enemy.isAttacking = false;
         }
         
         // Check collision with player attacks
         for (let j = player.attacks.length - 1; j >= 0; j--) {
             const attack = player.attacks[j];
             
             if (
                 enemy.x < attack.x + attack.width &&
                 enemy.x + enemy.width > attack.x &&
                 enemy.y < attack.y + attack.height &&
                 enemy.y + enemy.height > attack.y
             ) {
                 enemy.health -= attack.damage;
                 
                 // Knockback effect
                 if (attack.type === 'sword') {
                     enemy.speedX = attack.direction * 5;
                     enemy.speedY = -3;
                 }
                 
                 // Create hit effect
                 createParticles(
                     enemy.x + enemy.width/2, 
                     enemy.y + enemy.height/2, 
                     10, 
                     enemy.color
                 );
                 
                 // Remove attack if it's a projectile
                 if (attack.type === 'projectile') {
                     player.attacks.splice(j, 1);
                 }
                 
                 // Add to score
                 score += 10 * comboCount;
             }
         }
         
         // Check collision with player
         if (
             !player.isAttacking &&
             player.x < enemy.x + enemy.width &&
             player.x + player.width > enemy.x &&
             player.y < enemy.y + enemy.height &&
             player.y + player.height > enemy.y
         ) {
             player.health -= 1;
             
             // Knockback
             if (player.x < enemy.x) {
                 player.speedX = -5;
             } else {
                 player.speedX = 5;
             }
             player.speedY = -3;
             
             // Create hit effect
             createParticles(
                 player.x + player.width/2, 
                 player.y + player.height/2, 
                 15, 
                 '#f00'
             );
         }
         
         // Remove dead enemies
         if (enemy.health <= 0) {
             // Create explosion
             createParticles(
                 enemy.x + enemy.width/2, 
                 enemy.y + enemy.height/2, 
                 20, 
                 enemy.color
             );
             
             // Add to score
             score += 50 * comboCount;
             
             // Remove enemy
             enemies.splice(i, 1);
             
             // Chance to spawn health pickup
             if (Math.random() < 0.2 && player.health < player.maxHealth) {
                 particles.push({
                     x: enemy.x + enemy.width/2,
                     y: enemy.y + enemy.height/2,
                     width: 15,
                     height: 15,
                     color: '#0f0',
                     life: 300,
                     type: 'health'
                 });
             }
         }
     }
 }
 
 // Update boss
 function updateBoss(timestamp) {
     if (!boss) return;
     
     // Apply bullet time effect
     const timeScale = player.isBulletTime ? 0.4 : 1;
     
     // Boss AI
     if (boss.attackCooldown <= 0) {
         boss.isAttacking = true;
         boss.attackCooldown = boss.attackRate;
         
         // Different attack patterns based on phase
         if (boss.phase === 1) {
             // Phase 1: Missile barrage
             for (let i = 0; i < 5; i++) {
                 setTimeout(() => {
                     const dx = player.x - boss.x;
                     const dy = player.y - boss.y;
                     const distance = Math.sqrt(dx * dx + dy * dy);
                     
                     boss.missiles.push({
                         x: boss.x + boss.width/2,
                         y: boss.y + 50,
                         speedX: dx/distance * 3,
                         speedY: dy/distance * 3,
                         width: 20,
                         height: 20,
                         damage: 15,
                         color: '#f80',
                         isEnemy: true
                     });
                 }, i * 300);
             }
         } else {
             // Phase 2: Laser attack
             boss.attacks.push({
                 x: boss.x - 100,
                 y: boss.y + 50,
                 width: gameWidth + 200,
                 height: 20,
                 damage: 20,
                 timer: 100,
                 type: 'laser',
                 color: '#f00'
             });
         }
         
         boss.attackPattern = (boss.attackPattern + 1) % 2;
     } else {
         boss.attackCooldown -= 16 * timeScale;
         boss.isAttacking = false;
     }
     
     // Move boss
     if (boss.x > gameWidth * 0.7) {
         boss.speedX = -1;
     } else if (boss.x < gameWidth * 0.3) {
         boss.speedX = 1;
     }
     
     boss.x += boss.speedX * timeScale;
     
     // Update missiles
     for (let i = boss.missiles.length - 1; i >= 0; i--) {
         const missile = boss.missiles[i];
         missile.x += missile.speedX * timeScale;
         missile.y += missile.speedY * timeScale;
         
         // Check collision with player
         if (
             player.x < missile.x + missile.width &&
             player.x + player.width > missile.x &&
             player.y < missile.y + missile.height &&
             player.y + player.height > missile.y
         ) {
             player.health -= missile.damage;
             
             // Knockback
             if (player.x < missile.x) {
                 player.speedX = -8;
             } else {
                 player.speedX = 8;
             }
             player.speedY = -5;
             
             // Create explosion
             createParticles(
                 missile.x, 
                 missile.y, 
                 20, 
                 missile.color
             );
             
             // Remove missile
             boss.missiles.splice(i, 1);
             
             // Create hit effect
             createParticles(
                 player.x + player.width/2, 
                 player.y + player.height/2, 
                 15, 
                 '#f00'
             );
         }
         
         // Remove missiles that go off screen
         if (missile.x < -100 || missile.x > gameWidth + 100 || 
             missile.y < -100 || missile.y > gameHeight + 100) {
             boss.missiles.splice(i, 1);
         }
     }
     
     // Check collision with player attacks
     for (let j = player.attacks.length - 1; j >= 0; j--) {
         const attack = player.attacks[j];
         
         if (
             boss.x < attack.x + attack.width &&
             boss.x + boss.width > attack.x &&
             boss.y < attack.y + attack.height &&
             boss.y + boss.height > attack.y
         ) {
             boss.health -= attack.damage;
             
             // Create hit effect
             createParticles(
                 attack.x + attack.width/2, 
                 attack.y + attack.height/2, 
                 15, 
                 boss.color
             );
             
             // Add to score
             score += 5 * comboCount;
             
             // Remove attack if it's a projectile
             if (attack.type === 'projectile') {
                 player.attacks.splice(j, 1);
             }
         }
     }
     
     // Check collision with player
     if (
         !player.isAttacking &&
         player.x < boss.x + boss.width &&
         player.x + player.width > boss.x &&
         player.y < boss.y + boss.height &&
         player.y + player.height > boss.y
     ) {
         player.health -= 2;
         
         // Knockback
         if (player.x < boss.x) {
             player.speedX = -10;
         } else {
             player.speedX = 10;
         }
         player.speedY = -5;
         
         // Create hit effect
             createParticles(
                 player.x + player.width/2, 
                 player.y + player.height/2, 
                 20, 
                 '#f00'
             );
     }
     
     // Check for phase change
     if (boss.health <= boss.maxHealth / 2 && boss.phase === 1) {
         boss.phase = 2;
         boss.attackRate = 1000;
         boss.color = '#f00';
         
         // Phase change explosion
         createParticles(
             boss.x + boss.width/2, 
             boss.y + boss.height/2, 
             50, 
             boss.color
         );
     }
     
     // Check for boss death
     if (boss.health <= 0) {
         // Create big explosion
         createParticles(
             boss.x + boss.width/2, 
             boss.y + boss.height/2, 
             100, 
             boss.color
         );
         
         // Add to score
         score += 500 * comboCount;
         
         // Remove boss
         boss = null;
         bossActive = false;
         
         // Spawn health pickup
         particles.push({
             x: player.x + player.width/2,
             y: player.y + player.height/2,
             width: 30,
             height: 30,
             color: '#0f0',
             life: 300,
             type: 'health-big'
         });
     }
 }
 
 // Update bullets
 function updateBullets() {
     // Apply bullet time effect
     const timeScale = player.isBulletTime ? 0.4 : 1;
     
     for (let i = bullets.length - 1; i >= 0; i--) {
         const bullet = bullets[i];
         bullet.x += bullet.speedX * timeScale;
         bullet.y += bullet.speedY * timeScale;
         
         // Check collision with player (for enemy bullets)
         if (bullet.isEnemy) {
             if (
                 player.x < bullet.x + bullet.width &&
                 player.x + player.width > bullet.x &&
                 player.y < bullet.y + bullet.height &&
                 player.y + player.height > bullet.y
             ) {
                 player.health -= bullet.damage;
                 
                 // Knockback
                 player.speedX = bullet.speedX * 0.5;
                 player.speedY = bullet.speedY * 0.5;
                 
                 // Create hit effect
                 createParticles(
                     bullet.x, 
                     bullet.y, 
                     15, 
                     bullet.color
                 );
                 
                 // Remove bullet
                 bullets.splice(i, 1);
                 continue;
             }
         }
         
         // Check collision with enemies (for player bullets)
         if (!bullet.isEnemy) {
             for (let j = enemies.length - 1; j >= 0; j--) {
                 const enemy = enemies[j];
                 
                 if (
                     enemy.x < bullet.x + bullet.width &&
                     enemy.x + enemy.width > bullet.x &&
                     enemy.y < bullet.y + bullet.height &&
                     enemy.y + enemy.height > bullet.y
                 ) {
                     enemy.health -= bullet.damage;
                     
                     // Knockback
                     enemy.speedX = bullet.speedX * 0.5;
                     enemy.speedY = bullet.speedY * 0.5;
                     
                     // Create hit effect
                     createParticles(
                         bullet.x, 
                         bullet.y, 
                         10, 
                         enemy.color
                     );
                     
                     // Remove bullet
                     bullets.splice(i, 1);
                     
                     // Add to score
                     score += 5 * comboCount;
                     break;
                 }
             }
             
             // Check collision with boss
             if (boss && bullets[i]) {
                 if (
                     boss.x < bullet.x + bullet.width &&
                     boss.x + boss.width > bullet.x &&
                     boss.y < bullet.y + bullet.height &&
                     boss.y + boss.height > bullet.y
                 ) {
                     boss.health -= bullet.damage / 2;
                     
                     // Create hit effect
                     createParticles(
                         bullet.x, 
                         bullet.y, 
                         15, 
                         boss.color
                     );
                     
                     // Remove bullet
                     bullets.splice(i, 1);
                     
                     // Add to score
                     score += 5 * comboCount;
                 }
             }
         }
         
         // Remove bullets that go off screen
         if (bullet.x < -100 || bullet.x > gameWidth + 100 || 
             bullet.y < -100 || bullet.y > gameHeight + 100) {
             bullets.splice(i, 1);
         }
     }
 }
 
 // Update attacks
 function updateAttacks() {
     // Apply bullet time effect
     const timeScale = player.isBulletTime ? 0.4 : 1;
     
     // Update player attacks
     for (let i = player.attacks.length - 1; i >= 0; i--) {
         const attack = player.attacks[i];
         attack.timer -= 16 * timeScale;
         
         if (attack.timer <= 0) {
             player.attacks.splice(i, 1);
         }
     }
     
     // Update enemy attacks
     for (let i = 0; i < enemies.length; i++) {
         const enemy = enemies[i];
         for (let j = enemy.attacks.length - 1; j >= 0; j--) {
             const attack = enemy.attacks[j];
             attack.timer -= 16 * timeScale;
             
             if (attack.timer <= 0) {
                 enemy.attacks.splice(j, 1);
             }
         }
     }
     
     // Update boss attacks
     if (boss) {
         for (let i = boss.attacks.length - 1; i >= 0; i--) {
             const attack = boss.attacks[i];
             attack.timer -= 16 * timeScale;
             
             if (attack.timer <= 0) {
                 boss.attacks.splice(i, 1);
             } else if (attack.type === 'laser') {
                 // Update laser position to follow boss
                 attack.x = boss.x - 100;
                 attack.y = boss.y + 50;
             }
         }
     }
 }
 
 // Update particles
 function updateParticles() {
     for (let i = particles.length - 1; i >= 0; i--) {
         const particle = particles[i];
         
         // Apply bullet time effect to non-health particles
         const timeScale = (player.isBulletTime && particle.type !== 'health' && particle.type !== 'health-big') ? 0.4 : 1;
         
         if (particle.speedX) particle.x += particle.speedX * timeScale;
         if (particle.speedY) particle.y += particle.speedY * timeScale;
         if (particle.gravity) particle.speedY += particle.gravity * timeScale;
         
         particle.life -= 1 * timeScale;
         
         // Check collision with player for health pickups
         if ((particle.type === 'health' || particle.type === 'health-big') && 
             player.x < particle.x + particle.width &&
             player.x + player.width > particle.x &&
             player.y < particle.y + particle.height &&
             player.y + player.height > particle.y
         ) {
             const healAmount = particle.type === 'health' ? 10 : 30;
             player.health = Math.min(player.health + healAmount, player.maxHealth);
             particles.splice(i, 1);
             
             // Create heal effect
             createParticles(
                 player.x + player.width/2, 
                 player.y + player.height/2, 
                 15, 
                 '#0f0'
             );
             continue;
         }
         
         if (particle.life <= 0) {
             particles.splice(i, 1);
         }
     }
 }
 
 // Create particles
 function createParticles(x, y, count, color) {
     for (let i = 0; i < count; i++) {
         const angle = Math.random() * Math.PI * 2;
         const speed = Math.random() * 3 + 1;
         
         particles.push({
             x: x,
             y: y,
             speedX: Math.cos(angle) * speed,
             speedY: Math.sin(angle) * speed,
             width: Math.random() * 5 + 2,
             height: Math.random() * 5 + 2,
             color: color,
             life: Math.random() * 60 + 30,
             gravity: 0.1
         });
     }
 }
 
 // Update combo counter
 function updateComboCounter() {
     const comboElement = document.getElementById('comboCounter');
     comboElement.textContent = `COMBO x${comboCount}`;
     comboElement.style.opacity = '1';
     comboElement.style.transform = 'translateX(-50%) scale(1.2)';
     
     // Reset combo if no attacks for a while
     clearTimeout(comboTimeout);
     comboTimeout = setTimeout(() => {
         comboCount = 0;
         comboElement.style.opacity = '0';
         comboElement.style.transform = 'translateX(-50%) scale(1)';
     }, COMBO_TIMEOUT);
 }
 
 // Update UI
 function updateUI() {
     // Health bar
     const healthPercent = (player.health / player.maxHealth) * 100;
     document.getElementById('healthFill').style.width = `${healthPercent}%`;
     
     // Score
     document.getElementById('scoreDisplay').textContent = `SCORE: ${score}`;
     
     // Bullet time
     const bulletTimePercent = player.bulletTime;
     document.getElementById('bulletTimeFill').style.width = `${bulletTimePercent}%`;
 }
 
 // Render game
 function render() {
     // Clear canvas
     ctx.clearRect(0, 0, gameWidth, gameHeight);
     
     // Draw background
     drawBackground();
     
     // Draw platforms
     drawPlatforms();
     
     // Draw bullets
     drawBullets();
     
     // Draw enemies
     drawEnemies();
     
     // Draw boss
     if (bossActive && boss) {
         drawBoss();
     }
     
     // Draw player
     drawPlayer();
     
     // Draw attacks
     drawAttacks();
     
     // Draw particles
     drawParticles();
     
     // Draw grappling hook
     if (player.grapplingHook.active) {
         drawGrapplingHook();
     }
 }
 
 // Draw background
 function drawBackground() {
     // Dark blue gradient background
     const bgGradient = ctx.createLinearGradient(0, 0, 0, gameHeight);
     bgGradient.addColorStop(0, '#0a0a1a');
     bgGradient.addColorStop(1, '#1a0033');
     ctx.fillStyle = bgGradient;
     ctx.fillRect(0, 0, gameWidth, gameHeight);
     
     // Draw distant cityscape
     for (const bgElement of backgroundElements) {
         ctx.fillStyle = bgElement.color;
         ctx.globalAlpha = bgElement.brightness;
         ctx.fillRect(bgElement.x, bgElement.y, bgElement.width, bgElement.height);
         
         // Add some neon windows
         ctx.fillStyle = `hsl(${Math.random() * 60 + 200}, 80%, 50%)`;
         for (let i = 0; i < 5; i++) {
             const windowX = bgElement.x + 10 + Math.random() * (bgElement.width - 20);
             const windowY = bgElement.y + 10 + Math.random() * (bgElement.height - 20);
             const windowSize = 3 + Math.random() * 5;
             ctx.fillRect(windowX, windowY, windowSize, windowSize);
         }
     }
     ctx.globalAlpha = 1;
     
     // Grid lines for cyberpunk effect
     ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
     ctx.lineWidth = 1;
     
     // Horizontal lines
     for (let y = 0; y < gameHeight; y += 40) {
         ctx.beginPath();
         ctx.moveTo(0, y);
         ctx.lineTo(gameWidth, y);
         ctx.stroke();
     }
     
     // Vertical lines
     for (let x = 0; x < gameWidth; x += 40) {
         ctx.beginPath();
         ctx.moveTo(x, 0);
         ctx.lineTo(x, gameHeight);
         ctx.stroke();
     }
 }
 
 // Draw platforms
 function drawPlatforms() {
     for (const platform of platforms) {
         // Platform base
         ctx.fillStyle = platform.color;
         ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
         
         // Neon edge
         ctx.strokeStyle = '#0ff';
         ctx.lineWidth = 2;
         ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
         
         // Grid pattern on top
         if (platform.y < gameHeight - 60) { // Don't draw grid on ground platform
             ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
             ctx.lineWidth = 1;
             
             // Horizontal lines
             for (let y = platform.y + 5; y < platform.y + platform.height; y += 10) {
                 ctx.beginPath();
                 ctx.moveTo(platform.x, y);
                 ctx.lineTo(platform.x + platform.width, y);
                 ctx.stroke();
             }
             
             // Vertical lines
             for (let x = platform.x + 5; x < platform.x + platform.width; x += 10) {
                 ctx.beginPath();
                 ctx.moveTo(x, platform.y);
                 ctx.lineTo(x, platform.y + platform.height);
                 ctx.stroke();
             }
         }
     }
 }
 
 // Draw player
 function drawPlayer() {
     // Save context
     ctx.save();
     
     // Position the player
     ctx.translate(player.x, player.y);
     
     // Flip if facing left
     if (player.facing === -1) {
         ctx.scale(-1, 1);
         ctx.translate(-player.width, 0);
     }
     
     // Draw player body
     ctx.fillStyle = '#0ff';
     ctx.fillRect(10, 10, player.width - 20, player.height - 20);
     
     // Draw player head
     ctx.fillStyle = '#333';
     ctx.fillRect(15, 0, player.width - 30, 20);
     
     // Draw neon details based on skin
     ctx.strokeStyle = '#f0f';
     ctx.lineWidth = 2;
     
     // Body lines
     ctx.beginPath();
     ctx.moveTo(15, 30);
     ctx.lineTo(player.width - 15, 30);
     ctx.moveTo(20, 50);
     ctx.lineTo(player.width - 20, 50);
     ctx.stroke();
     
     // Restore context
     ctx.restore();
     
     // Draw sword when attacking
     if (player.isAttacking) {
         ctx.save();
         
         const swordLength = 60;
         const swordX = player.facing === 1 ? 
             player.x + player.width : 
             player.x - swordLength;
         
         // Sword blade
         ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
         ctx.fillRect(swordX, player.y + 20, swordLength, 5);
         
         // Sword glow
         const swordGradient = ctx.createLinearGradient(
             swordX, player.y + 20, 
             swordX + swordLength, player.y + 20
         );
         swordGradient.addColorStop(0, '#0ff');
         swordGradient.addColorStop(1, 'transparent');
         ctx.fillStyle = swordGradient;
         ctx.globalAlpha = 0.5;
         ctx.fillRect(swordX, player.y + 20, swordLength, 5);
         ctx.globalAlpha = 1;
         
         // Sword trail particles
         for (let i = 0; i < 3; i++) {
             particles.push({
                 x: swordX + Math.random() * swordLength,
                 y: player.y + 20 + Math.random() * 5,
                 width: 2 + Math.random() * 3,
                 height: 2 + Math.random() * 3,
                 color: '#0ff',
                 life: 10 + Math.random() * 20,
                 speedX: player.facing * (2 + Math.random() * 3),
                 speedY: -1 + Math.random() * 2
             });
         }
         
         ctx.restore();
     }
     
     // Draw blasters when shooting
     if (mouse.right && Date.now() - player.lastShot < 100) {
         ctx.fillStyle = '#ff0';
         ctx.fillRect(player.x + player.width/2 - 5, player.y + player.height/2 - 5, 10, 10);
     }
 }
 
 // Draw enemies
 function drawEnemies() {
     for (const enemy of enemies) {
         ctx.save();
         ctx.translate(enemy.x, enemy.y);
         
         // Draw enemy body
         ctx.fillStyle = enemy.color;
         ctx.fillRect(10, 10, enemy.width - 20, enemy.height - 20);
         
         // Draw enemy head
         ctx.fillStyle = '#333';
         ctx.fillRect(15, 0, enemy.width - 30, 20);
         
         // Draw health bar
         const healthPercent = (enemy.health / enemy.maxHealth) * (enemy.width - 20);
         ctx.fillStyle = '#f00';
         ctx.fillRect(10, 5, healthPercent, 3);
         
         // Draw neon details based on type
         ctx.strokeStyle = '#fff';
         ctx.lineWidth = 2;
         
         if (enemy.type === 'cyber-ninja') {
             // Body lines
             ctx.beginPath();
             ctx.moveTo(15, 30);
             ctx.lineTo(enemy.width - 15, 30);
             ctx.moveTo(20, 50);
             ctx.lineTo(enemy.width - 20, 50);
             ctx.stroke();
         } else if (enemy.type === 'drone') {
             // Propeller effect
             ctx.beginPath();
             ctx.arc(enemy.width/2, enemy.height/2, 15, 0, Math.PI * 2);
             ctx.stroke();
             
             // Rotating blades
             const angle = Date.now() / 50;
             for (let i = 0; i < 4; i++) {
                 const bladeAngle = angle + (i * Math.PI / 2);
                 ctx.beginPath();
                 ctx.moveTo(enemy.width/2, enemy.height/2);
                 ctx.lineTo(
                     enemy.width/2 + Math.cos(bladeAngle) * 25,
                     enemy.height/2 + Math.sin(bladeAngle) * 25
                 );
                 ctx.stroke();
             }
         }
         
         ctx.restore();
     }
 }
 
 // Draw boss
 function drawBoss() {
     ctx.save();
     ctx.translate(boss.x, boss.y);
     
     // Draw boss body
     ctx.fillStyle = boss.color;
     ctx.fillRect(0, 0, boss.width, boss.height);
     
     // Draw boss head
     ctx.fillStyle = '#333';
     ctx.fillRect(20, 10, boss.width - 40, 40);
     
     // Draw health bar
     const healthPercent = (boss.health / boss.maxHealth) * boss.width;
     ctx.fillStyle = boss.phase === 1 ? '#f80' : '#f00';
     ctx.fillRect(0, -10, healthPercent, 5);
     
     // Draw phase indicator
     ctx.fillStyle = '#fff';
     ctx.font = '14px Courier New';
     ctx.fillText(`PHASE ${boss.phase}`, 10, -15);
     
     // Draw glowing core
     const coreGradient = ctx.createRadialGradient(
         boss.width/2, boss.height/2, 10,
         boss.width/2, boss.height/2, 30
     );
     coreGradient.addColorStop(0, '#fff');
     coreGradient.addColorStop(1, 'transparent');
     ctx.fillStyle = coreGradient;
     ctx.globalAlpha = 0.7;
     ctx.beginPath();
     ctx.arc(boss.width/2, boss.height/2, 30, 0, Math.PI * 2);
     ctx.fill();
     ctx.globalAlpha = 1;
     
     // Draw damage effects if in phase 2
     if (boss.phase === 2) {
         ctx.strokeStyle = '#f00';
         ctx.lineWidth = 3;
         
         // Cracks on armor
         ctx.beginPath();
         ctx.moveTo(30, 60);
         ctx.lineTo(60, 80);
         ctx.lineTo(90, 60);
         ctx.stroke();
         
         ctx.beginPath();
         ctx.moveTo(boss.width - 30, 60);
         ctx.lineTo(boss.width - 60, 80);
         ctx.lineTo(boss.width - 90, 60);
         ctx.stroke();
     }
     
     ctx.restore();
     
     // Draw missiles
     for (const missile of boss.missiles) {
         ctx.save();
         ctx.translate(missile.x, missile.y);
         
         // Missile body
         ctx.fillStyle = missile.color;
         ctx.beginPath();
         ctx.moveTo(0, missile.height/2);
         ctx.lineTo(missile.width, 0);
         ctx.lineTo(missile.width, missile.height);
         ctx.closePath();
         ctx.fill();
         
         // Missile flame
         const flameGradient = ctx.createLinearGradient(0, 0, -20, 0);
         flameGradient.addColorStop(0, '#f80');
         flameGradient.addColorStop(1, 'transparent');
         ctx.fillStyle = flameGradient;
         ctx.beginPath();
         ctx.moveTo(0, missile.height/3);
         ctx.lineTo(-20, missile.height/2);
         ctx.lineTo(0, missile.height*2/3);
         ctx.closePath();
         ctx.fill();
         
         ctx.restore();
     }
 }
 
 // Draw bullets
 function drawBullets() {
     for (const bullet of bullets) {
         ctx.save();
         ctx.translate(bullet.x, bullet.y);
         
         // Bullet glow
         const bulletGradient = ctx.createRadialGradient(
             bullet.width/2, bullet.height/2, 0,
             bullet.width/2, bullet.height/2, bullet.width
         );
         bulletGradient.addColorStop(0, bullet.color);
         bulletGradient.addColorStop(1, 'transparent');
         ctx.fillStyle = bulletGradient;
         ctx.globalAlpha = 0.7;
         ctx.fillRect(0, 0, bullet.width, bullet.height);
         ctx.globalAlpha = 1;
         
         // Bullet core
         ctx.fillStyle = '#fff';
         ctx.fillRect(
             bullet.width/2 - 2, 
             bullet.height/2 - 2, 
             4, 
             4
         );
         
         ctx.restore();
     }
 }
 
 // Draw attacks
 function drawAttacks() {
     // Draw player attacks
     for (const attack of player.attacks) {
         if (attack.type === 'sword') {
             // Sword slash effect
             const slashGradient = ctx.createLinearGradient(
                 attack.x, attack.y, 
                 attack.x + attack.width * attack.direction, attack.y + attack.height
             );
             slashGradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
             slashGradient.addColorStop(1, 'transparent');
             ctx.fillStyle = slashGradient;
             ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
         }
     }
     
     // Draw enemy attacks
     for (const enemy of enemies) {
         for (const attack of enemy.attacks) {
             ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
             ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
         }
     }
     
     // Draw boss attacks
     if (boss) {
         for (const attack of boss.attacks) {
             if (attack.type === 'laser') {
                 // Laser beam
                 const laserGradient = ctx.createLinearGradient(
                     attack.x, attack.y, 
                     attack.x, attack.y + attack.height
                 );
                 laserGradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
                 laserGradient.addColorStop(0.3, 'rgba(255, 0, 0, 0.8)');
                 laserGradient.addColorStop(0.7, 'rgba(255, 0, 0, 0.8)');
                 laserGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                 ctx.fillStyle = laserGradient;
                 ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
                 
                 // Laser glow
                 ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
                 ctx.fillRect(attack.x - 10, attack.y - 10, attack.width + 20, attack.height + 20);
             }
         }
     }
 }
 
 // Draw particles
 function drawParticles() {
     for (const particle of particles) {
         if (particle.type === 'health' || particle.type === 'health-big') {
             // Health pickup
             ctx.fillStyle = particle.color;
             ctx.beginPath();
             ctx.arc(
                 particle.x, 
                 particle.y, 
                 particle.width/2, 
                 0, 
                 Math.PI * 2
             );
             ctx.fill();
             
             // Pulse effect
             const pulseSize = Math.sin(Date.now() / 200) * 3 + 5;
             ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
             ctx.lineWidth = 2;
             ctx.beginPath();
             ctx.arc(
                 particle.x, 
                 particle.y, 
                 particle.width/2 + pulseSize, 
                 0, 
                 Math.PI * 2
             );
             ctx.stroke();
         } else {
             // Regular particles
             ctx.fillStyle = particle.color;
             ctx.fillRect(
                 particle.x - particle.width/2, 
                 particle.y - particle.height/2, 
                 particle.width, 
                 particle.height
             );
             
             // Glow effect
             ctx.fillStyle = particle.color;
             ctx.globalAlpha = 0.3;
             ctx.beginPath();
             ctx.arc(
                 particle.x, 
                 particle.y, 
                 particle.width * 1.5, 
                 0, 
                 Math.PI * 2
             );
             ctx.fill();
             ctx.globalAlpha = 1;
         }
     }
 }
 
 // Draw grappling hook
 function drawGrapplingHook() {
     const hookX = player.grapplingHook.x + player.grapplingHook.directionX * player.grapplingHook.length;
     const hookY = player.grapplingHook.y + player.grapplingHook.directionY * player.grapplingHook.length;
     
     // Rope
     ctx.strokeStyle = '#0ff';
     ctx.lineWidth = 2;
     ctx.beginPath();
     ctx.moveTo(player.x + player.width/2, player.y + player.height/2);
     ctx.lineTo(hookX, hookY);
     ctx.stroke();
     
     // Hook
     ctx.fillStyle = '#f0f';
     ctx.beginPath();
     ctx.arc(hookX, hookY, 5, 0, Math.PI * 2);
     ctx.fill();
     
     // Glow
     ctx.fillStyle = '#f0f';
     ctx.globalAlpha = 0.3;
     ctx.beginPath();
     ctx.arc(hookX, hookY, 10, 0, Math.PI * 2);
     ctx.fill();
     ctx.globalAlpha = 1;
 }
 
 // PWA Service Worker Registration
 if ('serviceWorker' in navigator) {
     window.addEventListener('load', () => {
         navigator.serviceWorker.register('sw.js').then(registration => {
             console.log('ServiceWorker registration successful');
         }).catch(err => {
             console.log('ServiceWorker registration failed: ', err);
         });
     });
 }
 
 // Start the game
 window.onload = init;