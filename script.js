(() => {
  "use strict";

  const MAX_ATTEMPTS = 10;
  const FIFTH_ATTEMPT_MESSAGE = "Do you actually remember your password?";
  const DEFAULT_STATUS = "Approach the Login button. It seems completely normal.";
  const TEMPORARY_REACTION_MS = 1050;

  const loginForm = document.querySelector("#login-form");
  const loginPanel = document.querySelector("#login-panel");
  const loginButton = document.querySelector("#login-button");
  const cancelButton = document.querySelector("#cancel-button");
  const resetButton = document.querySelector("#reset-button");
  const replayButton = document.querySelector("#replay-button");
  const soundToggle = document.querySelector("#sound-toggle");
  const soundLabel = document.querySelector("#sound-label");
  const attemptCount = document.querySelector("#attempt-count");
  const attemptMeter = document.querySelector("#attempt-meter");
  const meterFill = document.querySelector("#meter-fill");
  const gameStatus = document.querySelector("#game-status");
  const chaseArena = document.querySelector("#chase-arena");
  const decoyLayer = document.querySelector("#decoy-layer");
  const dashboard = document.querySelector("#dashboard");
  const confetti = document.querySelector("#confetti");

  const state = {
    attempts: 0,
    complete: false,
    soundEnabled: true,
    lastReaction: "",
    lastInputSource: "unknown",
    lastPointerAttemptAt: -Infinity,
    ignoreClickUntil: -Infinity,
    timers: new Set(),
    audioContext: null,
  };

  const reactions = [
    { name: "move-away", run: moveAway },
    { name: "shrink", run: shrink },
    { name: "swap-with-cancel", run: swapWithCancel },
    { name: "are-you-sure", run: askAreYouSure },
    { name: "temporarily-disabled", run: temporarilyDisable },
    { name: "rotate", run: rotate },
    { name: "hide-behind-form", run: hideBehindForm },
    { name: "maybe-later", run: maybeLater },
    { name: "split-into-fake-buttons", run: splitIntoFakeButtons },
    { name: "last-moment-move", run: moveAtLastMoment },
  ];

  function schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      state.timers.delete(timer);
      callback();
    }, delay);

    state.timers.add(timer);
    return timer;
  }

  function clearTimers() {
    state.timers.forEach((timer) => window.clearTimeout(timer));
    state.timers.clear();
  }

  function randomIndex(length) {
    if (window.crypto?.getRandomValues) {
      const randomValue = new Uint32Array(1);
      window.crypto.getRandomValues(randomValue);
      return randomValue[0] % length;
    }

    return Math.floor(Math.random() * length);
  }

  function randomBetween(minimum, maximum) {
    if (maximum <= minimum) {
      return minimum;
    }

    return minimum + (randomIndex(10_000) / 10_000) * (maximum - minimum);
  }

  function setStatus(message) {
    gameStatus.textContent = message;
  }

  function updateAttemptDisplay() {
    const percentage = (state.attempts / MAX_ATTEMPTS) * 100;
    attemptCount.textContent = String(state.attempts);
    meterFill.style.width = `${percentage}%`;
    attemptMeter.setAttribute("aria-valuenow", String(state.attempts));
    attemptMeter.setAttribute(
      "aria-valuetext",
      `${state.attempts} of ${MAX_ATTEMPTS} attempts`,
    );
  }

  function clearReaction() {
    clearTimers();
    chaseArena.classList.remove("is-swapped");
    loginButton.classList.remove(
      "is-positioned",
      "is-shrunk",
      "is-rotated",
      "is-disabled",
      "is-behind",
    );
    loginButton.disabled = false;
    loginButton.textContent = "Login";
    loginButton.style.removeProperty("left");
    loginButton.style.removeProperty("right");
    loginButton.style.removeProperty("top");
    decoyLayer.replaceChildren();
  }

  function chooseReaction() {
    const available = reactions.filter((reaction) => reaction.name !== state.lastReaction);
    const reaction = available[randomIndex(available.length)];
    state.lastReaction = reaction.name;
    return reaction;
  }

  function handleAttempt(source = "unknown") {
    if (state.complete) {
      return;
    }

    clearReaction();
    state.attempts += 1;
    state.lastInputSource = source;
    state.lastPointerAttemptAt = source === "pointer" ? performance.now() : state.lastPointerAttemptAt;
    updateAttemptDisplay();
    playSound("attempt");

    if (state.attempts >= MAX_ATTEMPTS) {
      celebrate();
      return;
    }

    const reaction = chooseReaction();
    reaction.run();

    if (state.attempts === 5) {
      setStatus(FIFTH_ATTEMPT_MESSAGE);
    }
  }

  function getBoundedPosition(button = loginButton) {
    const padding = 12;
    const maximumX = Math.max(padding, chaseArena.clientWidth - button.offsetWidth - padding);
    const maximumY = Math.max(padding + 18, chaseArena.clientHeight - button.offsetHeight - padding);

    return {
      x: randomBetween(padding, maximumX),
      y: randomBetween(padding + 18, maximumY),
    };
  }

  function positionButton(button, position = getBoundedPosition(button)) {
    button.classList.add("is-positioned");
    button.style.right = "auto";
    button.style.left = `${position.x}px`;
    button.style.top = `${position.y}px`;
  }

  function moveAway() {
    positionButton(loginButton);
    setStatus("The Login button has relocated for personal reasons.");
  }

  function shrink() {
    loginButton.classList.add("is-shrunk");
    setStatus("Login is suddenly feeling very small and unavailable.");
  }

  function swapWithCancel() {
    chaseArena.classList.add("is-swapped");
    setStatus("Login swapped desks with Cancel. Classic workplace prank.");
  }

  function askAreYouSure() {
    loginButton.textContent = "Are you sure?";
    setStatus("A simple question has become a follow-up question.");
  }

  function temporarilyDisable() {
    const shouldRestoreKeyboardFocus = state.lastInputSource === "keyboard";
    loginButton.disabled = true;
    loginButton.classList.add("is-disabled");
    loginButton.textContent = "Thinking…";
    setStatus("Login is taking a brief, completely unapproved break.");

    schedule(() => {
      loginButton.disabled = false;
      loginButton.classList.remove("is-disabled");
      loginButton.textContent = "Login";

      if (state.attempts !== 5 && !state.complete) {
        setStatus("Login has returned from its break. Suspiciously refreshed.");
      }

      if (
        shouldRestoreKeyboardFocus &&
        (document.activeElement === document.body || document.activeElement === loginButton)
      ) {
        loginButton.focus({ preventScroll: true });
      }
    }, TEMPORARY_REACTION_MS);
  }

  function rotate() {
    loginButton.classList.add("is-rotated");
    setStatus("Login is trying a new angle. Nineteen degrees, specifically.");
  }

  function hideBehindForm() {
    loginButton.classList.add("is-behind");
    setStatus("Login is hiding behind the form. You can still reach it by keyboard.");

    schedule(() => {
      loginButton.classList.remove("is-behind");

      if (state.attempts !== 5 && !state.complete) {
        setStatus("Login has emerged from behind the form. Act natural.");
      }
    }, TEMPORARY_REACTION_MS);
  }

  function maybeLater() {
    loginButton.textContent = "Maybe Later";
    setStatus("Login would prefer to circle back next quarter.");
  }

  function attachDecoyEvents(button) {
    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        event.preventDefault();
        state.ignoreClickUntil = performance.now() + 700;
        handleAttempt("pointer");
      }
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();

      if (performance.now() < state.ignoreClickUntil) {
        return;
      }

      handleAttempt(event.detail === 0 ? "keyboard" : "pointer");
    });
  }

  function splitIntoFakeButtons() {
    loginButton.textContent = "Pick me";
    const labels = ["Login?", "Real Login"];

    labels.forEach((label) => {
      const decoy = document.createElement("button");
      decoy.type = "button";
      decoy.className = "decoy-button";
      decoy.textContent = label;
      decoy.setAttribute("aria-label", `${label}, decoy button`);
      attachDecoyEvents(decoy);
      decoyLayer.append(decoy);
      const position = getBoundedPosition(decoy);
      decoy.style.left = `${position.x}px`;
      decoy.style.top = `${position.y}px`;
    });

    setStatus("Login has split into three buttons. This feels legally questionable.");
  }

  function moveAtLastMoment() {
    positionButton(loginButton);
    setStatus("A last-moment sidestep. Login has been practicing.");

    schedule(() => {
      if (!state.complete) {
        positionButton(loginButton);
        playSound("hop");
      }
    }, 230);
  }

  function createConfetti() {
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 24; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${randomBetween(2, 98)}%`;
      piece.style.animationDelay = `${randomBetween(-2.8, 0)}s`;
      piece.style.animationDuration = `${randomBetween(2.2, 3.8)}s`;
      piece.style.setProperty("--drift", `${randomBetween(-70, 70)}px`);
      fragment.append(piece);
    }

    confetti.replaceChildren(fragment);
  }

  function celebrate() {
    state.complete = true;
    clearReaction();
    updateAttemptDisplay();
    createConfetti();
    playSound("success");
    loginForm.reset();
    loginPanel.hidden = true;
    dashboard.hidden = false;
    dashboard.focus({ preventScroll: true });
    dashboard.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  }

  function resetGame({ moveFocus = true } = {}) {
    clearReaction();
    state.attempts = 0;
    state.complete = false;
    state.lastReaction = "";
    state.lastInputSource = "unknown";
    state.lastPointerAttemptAt = -Infinity;
    state.ignoreClickUntil = -Infinity;
    loginForm.reset();
    confetti.replaceChildren();
    dashboard.hidden = true;
    loginPanel.hidden = false;
    updateAttemptDisplay();
    setStatus(DEFAULT_STATUS);

    if (moveFocus) {
      document.querySelector("#fake-email").focus({ preventScroll: true });
      loginPanel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    }
  }

  function cancelEntry() {
    loginForm.reset();
    setStatus("Canceled. The fake credentials are cleared and nothing was sent.");
    playSound("cancel");
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getAudioContext() {
    if (!state.soundEnabled) {
      return null;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    state.audioContext ||= new AudioContext();

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume().catch(() => {});
    }

    return state.audioContext;
  }

  function playTone(frequency, startTime, duration, volume = 0.035) {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  function playSound(kind) {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;
    const sounds = {
      attempt: [[185, 0, 0.06]],
      hop: [[240, 0, 0.05]],
      cancel: [[160, 0, 0.06], [120, 0.07, 0.08]],
      toggle: [[330, 0, 0.06]],
      success: [[262, 0, 0.09], [330, 0.1, 0.09], [392, 0.2, 0.13]],
    };

    sounds[kind].forEach(([frequency, delay, duration]) => {
      playTone(frequency, now + delay, duration, kind === "success" ? 0.045 : 0.028);
    });
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
    soundLabel.textContent = `Sound: ${state.soundEnabled ? "on" : "off"}`;

    if (state.soundEnabled) {
      playSound("toggle");
      setStatus("Sound is on. Tiny locally generated beeps are standing by.");
    } else {
      setStatus("Sound is off. The chase will proceed in dignified silence.");
    }
  }

  function keepPositionInBounds(button) {
    if (!button.classList.contains("is-positioned") && !button.classList.contains("decoy-button")) {
      return;
    }

    const padding = 12;
    const left = Number.parseFloat(button.style.left) || padding;
    const top = Number.parseFloat(button.style.top) || padding + 18;
    const maximumX = Math.max(padding, chaseArena.clientWidth - button.offsetWidth - padding);
    const maximumY = Math.max(padding + 18, chaseArena.clientHeight - button.offsetHeight - padding);
    button.style.left = `${Math.min(Math.max(left, padding), maximumX)}px`;
    button.style.top = `${Math.min(Math.max(top, padding + 18), maximumY)}px`;
  }

  loginButton.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse" || state.complete || loginButton.disabled) {
      return;
    }

    const now = performance.now();

    if (now - state.lastPointerAttemptAt < 180) {
      return;
    }

    state.ignoreClickUntil = now + 350;
    handleAttempt("pointer");
  });

  loginButton.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      event.preventDefault();
      state.ignoreClickUntil = performance.now() + 700;
      handleAttempt("pointer");
    }
  });

  loginButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (performance.now() < state.ignoreClickUntil || state.complete) {
      return;
    }

    handleAttempt(event.detail === 0 ? "keyboard" : "pointer");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (performance.now() >= state.ignoreClickUntil && !state.complete) {
      handleAttempt("keyboard");
    }
  });

  cancelButton.addEventListener("click", cancelEntry);
  resetButton.addEventListener("click", () => resetGame());
  replayButton.addEventListener("click", () => resetGame());
  soundToggle.addEventListener("click", toggleSound);

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(() => {
      keepPositionInBounds(loginButton);
      decoyLayer.querySelectorAll(".decoy-button").forEach(keepPositionInBounds);
    });
  });

  updateAttemptDisplay();
})();
