(function () {
  const doc = document;
  const win = window;
  const canvas = doc.getElementById("QuantumWaffle");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const title = doc.getElementById("title");
  const buttonContainer = doc.getElementById("GizmoFluff");
  
  if (!canvas || !ctx || !buttonContainer) return;
  
  let width, height, segments = 10, dot = { x: 0, y: 0 }, isDragging = false, isSuccess = false, caterpillar = [], fadeOpacity = 0, shieldActive = true, lastInteractionTime = Date.now();
  let targetAngle = 0, currentAngle = 0, angleLerp = 0;
  
  const rand = Math.random;
  const PI = Math.PI;
  const atan2 = Math.atan2;
  const sqrt = Math.sqrt;
  const sin = Math.sin;
  
  const drawCircle = (x, y, radius, color, context, opacity = 1, isHollow = false) => {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * PI);
    context.globalAlpha = opacity;
    if (isHollow) {
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
    } else {
      context.fillStyle = color;
      context.fill();
    }
    context.globalAlpha = 1;
  };
  
  const generateRandomString = () => {
    let str = "";
    for (let i = 0; i < 10; i++) {
      str += String.fromCharCode(65 + Math.floor(rand() * 26));
    }
    return str;
  };
  
  const lerpAngle = (start, end, t) => {
    const delta = ((((end - start) % (2 * PI)) + 3 * PI) % (2 * PI)) - PI;
    return start + delta * t;
  };
  
  const initializeGame = () => {
    width = canvas.width = win.innerWidth;
    height = canvas.height = win.innerHeight;
    dot = { x: width / 2, y: height / 2 }; // Changed to center of page
    segments = 10;
    isDragging = false;
    shieldActive = true;
    lastInteractionTime = Date.now();
    if (!isSuccess) {
      caterpillar = [];
      let edge = rand() * 4 | 0;
      let x = edge === 0 ? -14 : edge === 1 ? width + 14 : width * rand();
      let y = edge === 2 ? -14 : edge === 3 ? height + 14 : height * rand();
      caterpillar.push({ 
        x, y, 
        angle: atan2(height / 2 - y, width / 2 - x), 
        speed: 1, 
        targetSpeed: 1, 
        time: 0, 
        pause: 0, 
        pauseDuration: 0, 
        speedState: 'normal', 
        speedTimer: 0, 
        hesitationTimer: 0, 
        pauseTimer: 0, 
        wonderMode: 'none', 
        wonderAngle: 0, 
        targetWonderAngle: 0, // New: target angle for smooth eye transition
        wonderLerp: 0,       // New: lerp progress for eye transition
        decelerationPhase: 0, 
        pauseType: 'none', 
        curlPhase: 0,
        shieldState: 'none',
        shieldLoopAngle: 0,
        shieldCooldown: 0,
        shieldSprintTimer: 0
      });
      buttonContainer.classList.add("hidden");
      buttonContainer.style.visibility = "hidden";
    }
    fadeOpacity = 0;
    angleLerp = 0;
  };
  
  const renderGame = () => {
    ctx.clearRect(0, 0, width, height);
    let titleHeight = title ? title.offsetHeight + 20 : 20;
    
    for (let i = 0; i < caterpillar.length; i++) {
      let { x, y, angle, wonderMode, wonderAngle, pauseType } = caterpillar[i];
      let radius = i === 0 ? 14 : 13 - (i / caterpillar.length) * 5;
      let wiggle = (pauseType === 'medium' || pauseType === 'long') && i > 0 ? sin(Date.now() * 0.002 + i * 0.5) * 1 : 0;
      drawCircle(x + wiggle, y, radius, `rgba(245,245,247,${1 - (i / caterpillar.length) * 0.3})`, ctx);
      if (i === 0) {
        let sway = (pauseType !== 'none') ? sin(Date.now() * 0.0004) * 2 : 0;
        drawCircle(x + sway + wiggle, y, radius, `rgba(245,245,247,${1 - (i / caterpillar.length) * 0.3})`, ctx);
        let eyeAngle = wonderMode === 'head' ? angle + wonderAngle : angle;
        drawCircle(x + sway + wiggle + radius * 0.6 * Math.cos(eyeAngle + 0.3), y + radius * 0.6 * Math.sin(eyeAngle + 0.3), 2, "#000", ctx);
        drawCircle(x + sway + wiggle + radius * 0.6 * Math.cos(eyeAngle - 0.3), y + radius * 0.6 * Math.sin(eyeAngle - 0.3), 2, "#000", ctx);
      }
    }
    
    let { x, y } = dot;
    let distanceFromStart = sqrt((x - width / 2) ** 2 + (y - height / 2) ** 2); // Updated to check center
    drawCircle(x, y, 6, "#0f0", ctx);
    if (!isDragging && distanceFromStart < 1) {
      let opacity = 0.75 + 0.25 * sin(Date.now() * 0.002);
      drawCircle(x, y, 40.8, "#fff", ctx, opacity, true);
    }
    if (shieldActive) {
      drawCircle(x, y, 40.8, "#fff", ctx, 0.5, true);
    }
  };
  
  const updateGame = () => {
    if (Date.now() - lastInteractionTime > 2000 && !isDragging) {
      shieldActive = true;
    }
    
    if (caterpillar.length < segments) {
      let last = caterpillar[caterpillar.length - 1];
      let { x, y, angle } = last;
      let noise = rand() * 0.2 - 0.1;
      let newX = x + Math.cos(angle) * 10;
      let newY = y + Math.sin(angle) * 10;
      caterpillar.push({ 
        x: newX, 
        y: newY, 
        angle: angle + noise, 
        speed: last.speed, 
        targetSpeed: last.targetSpeed, 
        time: 0, 
        pause: 0, 
        pauseDuration: 0, 
        speedState: last.speedState, 
        speedTimer: 0, 
        hesitationTimer: 0, 
        pauseTimer: 0, 
        wonderMode: last.wonderMode, 
        wonderAngle: last.wonderAngle, 
        targetWonderAngle: last.targetWonderAngle, // Propagate new property
        wonderLerp: last.wonderLerp,             // Propagate new property
        decelerationPhase: 0, 
        pauseType: 'none', 
        curlPhase: 0,
        shieldState: last.shieldState,
        shieldLoopAngle: last.shieldLoopAngle,
        shieldCooldown: last.shieldCooldown,
        shieldSprintTimer: last.shieldSprintTimer
      });
    } else {
      let { x, y, angle, speed, targetSpeed, time, pause, pauseDuration, speedState, speedTimer, hesitationTimer, pauseTimer, wonderMode, wonderAngle, targetWonderAngle, wonderLerp, decelerationPhase, pauseType, curlPhase, shieldState, shieldLoopAngle, shieldCooldown, shieldSprintTimer } = caterpillar[0];
      let newX = x, newY = y;
      
      // Shield interaction logic
      let distanceToShield = sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
      let shieldRadius = 40.8;
      let shieldZone = shieldRadius * 4; // 4 times the shield diameter
      let closeDistance = shieldRadius + 14 + 5; // Very close but not touching (shield radius + caterpillar radius + small buffer)
      
      if (shieldActive && shieldCooldown <= 0 && pause <= 0) { // Only trigger if not paused
        if (shieldState === 'none' && distanceToShield <= shieldZone) {
          // Enter notice state
          shieldState = 'notice';
          targetSpeed = 0.25; // Slow down to 0.25 of normal speed
          wonderMode = 'head';
          targetWonderAngle = atan2(dot.y - y, dot.x - x) - angle; // Set target eye angle
          wonderLerp = 0; // Reset lerp for smooth transition
          angleLerp = 0; // Reset angle interpolation for smooth turning
        } else if (shieldState === 'notice') {
          // Move closer slowly
          targetSpeed = 0.6; // 0.6 of normal speed
          let angleToShield = atan2(dot.y - y, dot.x - x);
          targetAngle = angleToShield;
          targetWonderAngle = angleToShield - angle; // Update target eye angle
          wonderLerp += 0.1; // Increment lerp progress
          if (wonderLerp > 1) wonderLerp = 1;
          wonderAngle = lerpAngle(wonderAngle, targetWonderAngle, wonderLerp); // Smooth eye transition
          speed += (targetSpeed - speed) * 0.1; // Smooth speed transition
          newX = x + Math.cos(angleToShield) * speed * 2; // Move toward shield
          newY = y + Math.sin(angleToShield) * speed * 2;
          if (distanceToShield <= closeDistance) {
            // Enter looping state
            shieldState = 'looping';
            targetSpeed = 1; // Normal speed for looping
            shieldLoopAngle = atan2(y - dot.y, x - dot.x); // Start loop at current angle
          }
        } else if (shieldState === 'looping') {
          // Perform one loop around shield
          let loopSpeed = 2 * PI / 2; // Complete one loop in ~2 seconds at normal speed
          shieldLoopAngle += loopSpeed * 0.016;
          targetSpeed = 1;
          speed += (targetSpeed - speed) * 0.1; // Smooth speed transition
          let orbitRadius = closeDistance;
          newX = dot.x + orbitRadius * Math.cos(shieldLoopAngle);
          newY = dot.y + orbitRadius * Math.sin(shieldLoopAngle);
          targetAngle = atan2(newY - y, newX - x);
          targetWonderAngle = atan2(dot.y - y, dot.x - x) - angle; // Keep eyes on shield
          wonderLerp += 0.1; // Increment lerp progress
          if (wonderLerp > 1) wonderLerp = 1;
          wonderAngle = lerpAngle(wonderAngle, targetWonderAngle, wonderLerp); // Smooth eye transition
          
          if (shieldLoopAngle >= 2 * PI + atan2(y - dot.y, x - dot.x)) {
            // Loop complete, enter sprint state
            shieldState = 'sprint';
            shieldSprintTimer = 1.5; // Sprint for 1.5 seconds
            targetSpeed = 2; // Sprint at 2x normal speed
            shieldCooldown = 4; // 4-second cooldown
            let angleAway = atan2(y - dot.y, x - dot.x); // Move away from shield
            targetAngle = angleAway;
            targetWonderAngle = 0; // Eyes return to default
            wonderLerp = 0; // Reset lerp for smooth transition
            wonderMode = 'none';
          }
        } else if (shieldState === 'sprint' && shieldSprintTimer > 0) {
          // Continue sprinting
          targetSpeed = 2;
          shieldSprintTimer -= 0.016;
          let angleAway = atan2(y - dot.y, x - dot.x);
          targetAngle = angleAway;
          targetWonderAngle = 0; // Eyes stay at default
          wonderLerp += 0.1; // Increment lerp progress
          if (wonderLerp > 1) wonderLerp = 1;
          wonderAngle = lerpAngle(wonderAngle, targetWonderAngle, wonderLerp); // Smooth eye transition
          speed += (targetSpeed - speed) * 0.1; // Smooth speed transition
          newX = x + Math.cos(angleAway) * speed * 2; // Move away from shield
          newY = y + Math.sin(angleAway) * speed * 2;
          if (shieldSprintTimer <= 0) {
            // End sprint, return to normal
            shieldState = 'none';
            targetSpeed = 1;
            speedState = 'normal';
          }
        }
      } else if (shieldState !== 'none' && (shieldCooldown > 0 || pause > 0)) {
        // Reset shield state if cooldown or pause is active
        shieldState = 'none';
        targetSpeed = 1;
        wonderMode = 'none';
        targetWonderAngle = 0;
        wonderLerp = 0;
        wonderAngle = lerpAngle(wonderAngle, targetWonderAngle, wonderLerp);
      }
      
      // Update cooldown
      if (shieldCooldown > 0) {
        shieldCooldown -= 0.016;
        if (shieldCooldown < 0) shieldCooldown = 0;
      }
      
      caterpillar[0].speedTimer += 0.016;
      if (speedTimer > 10 + rand() * 10 && shieldState === 'none') {
        let r = rand();
        caterpillar[0].speedState = r < 0.05 ? 'slow' : r < 0.25 ? 'sprint' : 'normal';
        caterpillar[0].speedTimer = 0;
      }
      let newTargetSpeed = speedState === 'slow' ? 0.5 : speedState === 'sprint' ? 1.5 : 1;
      if (shieldState !== 'none') newTargetSpeed = targetSpeed; // Override with shield state speed
      
      if (pause <= 0 && shieldState === 'none') {
        let noise = rand() * 0.15 - 0.075;
        let elapsed = time + rand() * 0.1;
        caterpillar[0].hesitationTimer += 0.016;
        caterpillar[0].pauseTimer += 0.016;
        
        if (hesitationTimer > 20 + rand() * 40 && decelerationPhase === 0) {
          let r = rand();
          if (r < 0.7) {
            caterpillar[0].pause = 0.2 + rand() * 0.3;
            caterpillar[0].pauseType = 'short';
            caterpillar[0].hesitationTimer = 0;
          } else if (r < 0.95) {
            caterpillar[0].pause = 1 + rand() * 2;
            caterpillar[0].pauseType = 'medium';
            caterpillar[0].hesitationTimer = 0;
          } else {
            caterpillar[0].pause = 5 + rand() * 5;
            caterpillar[0].pauseType = 'long';
            caterpillar[0].hesitationTimer = 0;
            caterpillar[0].curlPhase = rand() < 0.3 ? 2 : 0;
          }
          caterpillar[0].decelerationPhase = 0.8 + rand() * 0.4;
          caterpillar[0].targetSpeed = 0.2;
          caterpillar[0].pauseDuration = caterpillar[0].pause;
          caterpillar[0].wonderMode = 'head';
          caterpillar[0].wonderAngle = 0;
          caterpillar[0].targetWonderAngle = 0;
          caterpillar[0].wonderLerp = 0;
        } else if (pauseTimer > 120 + rand() * 120 && decelerationPhase === 0) {
          let r = rand();
          if (r < 0.25) {
            caterpillar[0].pause = 1 + rand() * 2;
            caterpillar[0].pauseType = 'medium';
          } else {
            caterpillar[0].pause = 5 + rand() * 5;
            caterpillar[0].pauseType = 'long';
            caterpillar[0].curlPhase = rand() < 0.3 ? 2 : 0;
          }
          caterpillar[0].decelerationPhase = 0.8 + rand() * 0.4;
          caterpillar[0].targetSpeed = 0.2;
          caterpillar[0].pauseDuration = caterpillar[0].pause;
          caterpillar[0].angle += (rand() * PI / 2 - PI / 4) * (rand() < 0.5 ? -1 : 1);
          caterpillar[0].time = 0;
          caterpillar[0].pauseTimer = 0;
          caterpillar[0].wonderMode = 'head';
          caterpillar[0].wonderAngle = 0;
          caterpillar[0].targetWonderAngle = 0;
          caterpillar[0].wonderLerp = 0;
        } else {
          caterpillar[0].time = elapsed;
          caterpillar[0].angle += noise;
          caterpillar[0].targetSpeed = newTargetSpeed;
          caterpillar[0].wonderMode = 'none';
          caterpillar[0].wonderAngle = 0;
          caterpillar[0].targetWonderAngle = 0;
          caterpillar[0].wonderLerp = 0;
          caterpillar[0].decelerationPhase = 0;
          caterpillar[0].pauseType = 'none';
          caterpillar[0].curlPhase = 0;
        }
        
        if (decelerationPhase > 0) {
          speed -= (speed - 0.2) * 0.15 * (1 - decelerationPhase / (0.8 + rand() * 0.4));
          caterpillar[0].decelerationPhase -= 0.016;
          if (caterpillar[0].decelerationPhase <= 0) {
            caterpillar[0].decelerationPhase = 0;
          }
        } else {
          speed += (targetSpeed - speed) * 0.1;
        }
        
        targetAngle = caterpillar[0].angle;
        angleLerp += 0.1;
        if (angleLerp > 1) angleLerp = 1;
        currentAngle = lerpAngle(currentAngle, targetAngle, angleLerp);
        
        if (shieldState !== 'looping') {
          newX = x + Math.cos(currentAngle) * speed * 2;
          newY = y + Math.sin(currentAngle) * speed * 2;
        }
        for (let i = 1; i < caterpillar.length; i++) {
          let segment = caterpillar[i];
          let distToSegment = sqrt((newX - segment.x) ** 2 + (newY - segment.y) ** 2);
          if (distToSegment < 10) {
            let pushAngle = atan2(newY - segment.y, newX - segment.x);
            newX = segment.x + 10 * Math.cos(pushAngle);
            newY = segment.y + 10 * Math.sin(pushAngle);
            currentAngle = targetAngle = pushAngle + (rand() * PI / 2 - PI / 4) * (rand() < 0.5 ? -1 : 1);
            angleLerp = 0;
            caterpillar[0].wonderMode = 'none';
            caterpillar[0].wonderAngle = 0;
            caterpillar[0].targetWonderAngle = 0;
            caterpillar[0].wonderLerp = 0;
            break;
          }
        }
      } else if (pause > 0) {
        caterpillar[0].pause -= 0.016;
        speed += (0.2 - speed) * 0.1;
        newX = x;
        newY = y;
        caterpillar[0].wonderMode = 'head';
        caterpillar[0].wonderAngle = sin(Date.now() * 0.0004) * (0.4 + rand() * 0.4);
        caterpillar[0].targetWonderAngle = caterpillar[0].wonderAngle;
        caterpillar[0].wonderLerp = 1; // No lerp during pause wobble
        if (pauseType === 'long' && curlPhase > 0) {
          caterpillar[0].angle += (rand() < 0.5 ? 1 : -1) * (PI / 6) * (0.016 / 2);
          caterpillar[0].curlPhase -= 0.016;
          if (caterpillar[0].curlPhase <= 0) {
            caterpillar[0].curlPhase = 0;
          }
        }
      }
      
      let titleHeight = title ? title.offsetHeight + 20 : 20;
      let margin = 14;
      let hitEdge = false;
      if (newX < margin) {
        newX = margin;
        currentAngle = targetAngle = angle + (rand() * PI / 2 - PI / 4) * (rand() < 0.5 ? -1 : 1);
        angleLerp = 0;
        caterpillar[0].targetSpeed = newTargetSpeed;
        caterpillar[0].wonderMode = 'none';
        caterpillar[0].wonderAngle = 0;
        caterpillar[0].targetWonderAngle = 0;
        caterpillar[0].wonderLerp = 0;
        hitEdge = true;
      }
      if (newX > width - margin) {
        newX = width - margin;
        currentAngle = targetAngle = angle + (rand() * PI / 2 - PI / 4) * (rand() < 0.5 ? -1 : 1);
        angleLerp = 0;
        caterpillar[0].targetSpeed = newTargetSpeed;
        caterpillar[0].wonderMode = 'none';
        caterpillar[0].wonderAngle = 0;
        caterpillar[0].targetWonderAngle = 0;
        caterpillar[0].wonderLerp = 0;
        hitEdge = true;
      }
      if (newY < titleHeight) {
        newY = titleHeight;
        currentAngle = targetAngle = angle + (rand() * PI / 2 - PI / 4) * (rand() < 0.5 ? -1 : 1);
        angleLerp = 0;
        caterpillar[0].targetSpeed = newTargetSpeed;
        caterpillar[0].wonderMode = 'none';
        caterpillar[0].wonderAngle = 0;
        caterpillar[0].targetWonderAngle = 0;
        caterpillar[0].wonderLerp = 0;
        hitEdge = true;
      }
      if (newY > height - margin) {
        newY = height - margin;
        currentAngle = targetAngle = angle + (rand() * PI / 2 - PI / 4) * (rand() < 0.5 ? -1 : 1);
        angleLerp = 0;
        caterpillar[0].targetSpeed = newTargetSpeed;
        caterpillar[0].wonderMode = 'none';
        caterpillar[0].wonderAngle = 0;
        caterpillar[0].targetWonderAngle = 0;
        caterpillar[0].wonderLerp = 0;
        hitEdge = true;
      }
      
      if (hitEdge && rand() < 0.2 && decelerationPhase === 0 && shieldState === 'none') {
        caterpillar[0].pause = 0.2 + rand() * 0.3;
        caterpillar[0].pauseType = 'short';
        caterpillar[0].decelerationPhase = 0.8 + rand() * 0.4;
        caterpillar[0].targetSpeed = 0.2;
        caterpillar[0].pauseDuration = caterpillar[0].pause;
        caterpillar[0].wonderMode = 'head';
        caterpillar[0].wonderAngle = 0;
        caterpillar[0].targetWonderAngle = 0;
        caterpillar[0].wonderLerp = 0;
      }
      
      caterpillar[0].speed = speed;
      caterpillar[0].targetSpeed = targetSpeed;
      caterpillar[0].speedState = speedState;
      caterpillar[0].speedTimer = speedTimer;
      caterpillar[0].hesitationTimer = hesitationTimer;
      caterpillar[0].pauseTimer = pauseTimer;
      caterpillar[0].x = newX;
      caterpillar[0].y = newY;
      caterpillar[0].angle = currentAngle;
      caterpillar[0].wonderMode = wonderMode;
      caterpillar[0].wonderAngle = wonderAngle;
      caterpillar[0].targetWonderAngle = targetWonderAngle;
      caterpillar[0].wonderLerp = wonderLerp;
      caterpillar[0].decelerationPhase = decelerationPhase;
      caterpillar[0].pauseType = pauseType;
      caterpillar[0].curlPhase = curlPhase;
      caterpillar[0].shieldState = shieldState;
      caterpillar[0].shieldLoopAngle = shieldLoopAngle;
      caterpillar[0].shieldCooldown = shieldCooldown;
      caterpillar[0].shieldSprintTimer = shieldSprintTimer;
      
      for (let i = 1; i < caterpillar.length; i++) {
        let prev = caterpillar[i - 1];
        let curr = caterpillar[i];
        let moveAngle = atan2(prev.y - curr.y, prev.x - curr.x);
        let distance = sqrt((prev.x - curr.x) ** 2 + (prev.y - curr.y) ** 2);
        if (distance > 10) {
          curr.x = prev.x - 10 * Math.cos(moveAngle);
          curr.y = prev.y - 10 * Math.sin(moveAngle);
        }
        curr.angle = moveAngle;
        curr.shieldState = prev.shieldState;
        curr.shieldLoopAngle = prev.shieldLoopAngle;
        curr.shieldCooldown = prev.shieldCooldown;
        curr.shieldSprintTimer = prev.shieldSprintTimer;
        curr.wonderAngle = prev.wonderAngle; // Propagate for consistency
        curr.targetWonderAngle = prev.targetWonderAngle;
        curr.wonderLerp = prev.wonderLerp;
      }
    }
    
    if (caterpillar.length > 0) {
      let { x, y } = caterpillar[0];
      let distance = sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
      if (distance < 17 && !isSuccess && !shieldActive) {
        isSuccess = true;
        caterpillar = [];
        dot = { x: -100, y: -100 };
        buttonContainer.classList.remove("hidden");
        buttonContainer.style.visibility = "visible";
        let script = doc.createElement("script");
        script.src = `Z.js?r=${generateRandomString()}`;
        doc.body.appendChild(script);
      }
    }
    
    renderGame();
    win.requestAnimationFrame(updateGame);
  };
  
  const handleInput = (event, type = "mouse") => {
    if (isSuccess) return;
    let { x, y } =
      type === "mouse"
        ? { x: event.clientX, y: event.clientY }
        : { x: event.touches[0].clientX, y: event.touches[0].clientY };
    let distance = sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
    if (distance < 40.8) {
      isDragging = true;
      shieldActive = false;
      lastInteractionTime = Date.now();
    }
    if (isDragging) {
      dot = { x, y };
    }
    if (
      (type === "mouse" && event.type === "mouseup") ||
      (type === "touch" && event.type === "touchend")
    ) {
      isDragging = false;
      lastInteractionTime = Date.now();
    }
  };
  
  const handleTouch = (event) => {
    event.preventDefault();
    if (isSuccess) return;
    handleInput(event, "touch");
  };
  
  canvas.addEventListener("mousedown", (e) => handleInput(e, "mouse"));
  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) handleInput(e, "mouse");
  });
  canvas.addEventListener("mouseup", (e) => handleInput(e, "mouse"));
  canvas.addEventListener("touchstart", handleTouch, { passive: false });
  canvas.addEventListener("touchmove", handleTouch, { passive: false });
  canvas.addEventListener("touchend", handleTouch, { passive: false });
  win.addEventListener("resize", initializeGame);
  
  initializeGame();
  updateGame();
})();