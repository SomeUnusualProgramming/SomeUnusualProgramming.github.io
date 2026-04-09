function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

window.boostMode = false;
var TECH_EASTER_EGG_SHOWN_KEY = "tech.easterEggShown.v1";
var MISSIONS_STATE_KEY = "portfolio.missions.v1";
var CONSULT_PHOTO_STATE_KEY = "portfolio.consultPhoto.v1";
var CONSULT_PHOTO_UNTIL_KEY = "portfolio.consultPhotoUntil.v1";
var CONSULT_PHOTO_DURATION_MS = 5 * 60 * 1000;
window.techEasterEggState = {
	hoverTimes: [],
	activeUntil: 0,
	cooldownUntil: 0
};
window.missionsState = null;
window.learnFactClicks = 0;
window.consultClickCount = 0;
window.learnFactsPool = [];
window.learnFactsPoolLang = "";

function shuffleArray(list) {
	for (var i = list.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = list[i];
		list[i] = list[j];
		list[j] = temp;
	}
	return list;
}

function nextLearnFact(facts) {
	var lang = String(window.currentLang || "pl").toLowerCase();
	if (!Array.isArray(facts) || facts.length === 0) {
		return "";
	}
	if (window.learnFactsPoolLang !== lang || !Array.isArray(window.learnFactsPool) || window.learnFactsPool.length === 0) {
		window.learnFactsPoolLang = lang;
		window.learnFactsPool = shuffleArray(facts.slice());
	}
	return window.learnFactsPool.pop() || facts[0];
}

function initBoostToggle() {
	var toggle = document.getElementById("boost-toggle");
	if (!toggle) {
		return;
	}
	window.boostMode = !!toggle.checked;
	toggle.addEventListener("change", function() {
		window.boostMode = !!toggle.checked;
	});
}

function ensureTechEasterEggOverlay(container) {
	var overlay = container.querySelector(".tech-easter-egg");
	if (overlay) {
		return overlay;
	}
	overlay = document.createElement("div");
	overlay.className = "tech-easter-egg";
	overlay.innerHTML = '<p class="tech-easter-egg-text"></p>';
	overlay.addEventListener("click", function() {
		container.classList.remove("tech-overheat-message");
	});
	container.appendChild(overlay);
	return overlay;
}

function triggerTechEasterEgg(container) {
	var state = window.techEasterEggState;
	var now = performance.now();
	if (now < state.cooldownUntil) {
		return;
	}
	var alreadyShown = localStorage.getItem(TECH_EASTER_EGG_SHOWN_KEY) === "1";
	state.activeUntil = now + 1900;
	state.cooldownUntil = now + 14000;
	container.classList.add("tech-overheat");
	var overlay = ensureTechEasterEggOverlay(container);
	var textNode = overlay.querySelector(".tech-easter-egg-text");
	if (textNode) {
		var msgKey = alreadyShown ? "skills.easterEggRepeat" : "skills.easterEgg";
		var fallback = alreadyShown
			? "Widzimy, że dalej testujesz. Boost pozostaje aktywny."
			: "Fajnie, że tu dotarłeś - to znaczy, że naprawdę testujesz aplikację.";
		var msg = (typeof window.t === "function") ? window.t(msgKey, fallback) : fallback;
		textNode.textContent = msg;
	}

	var nodes = Array.prototype.slice.call(container.querySelectorAll(".tech-node"));
	if (!alreadyShown) {
		nodes.forEach(function(node) {
			var angle = randomBetween(0, Math.PI * 2);
			var distance = randomBetween(220, 420);
			var x = Math.cos(angle) * distance;
			var y = Math.sin(angle) * distance;
			var rot = randomBetween(-220, 220);
			node.style.setProperty("--boom-x", x.toFixed(1) + "px");
			node.style.setProperty("--boom-y", y.toFixed(1) + "px");
			node.style.setProperty("--boom-r", rot.toFixed(1) + "deg");
			node.classList.add("tech-node-boom");
		});
		setTimeout(function() {
			container.classList.add("tech-overheat-message");
		}, 950);
		setTimeout(function() {
			nodes.forEach(function(node) {
				node.classList.remove("tech-node-boom");
			});
			positionTechNodes(container);
			container.classList.remove("tech-overheat");
		}, 1850);
		localStorage.setItem(TECH_EASTER_EGG_SHOWN_KEY, "1");
		completeMission("boostOverheat");
		return;
	}

	container.classList.add("tech-overheat-message");
	setTimeout(function() {
		container.classList.remove("tech-overheat");
	}, 120);
}

function loadMissionsState() {
	var raw = localStorage.getItem(MISSIONS_STATE_KEY);
	var base = {
		boostOverheat: localStorage.getItem(TECH_EASTER_EGG_SHOWN_KEY) === "1",
		learnWithAdam: false,
		secretLogo: false,
		rewardUnlocked: false
	};
	if (!raw) {
		window.missionsState = base;
		return;
	}
	try {
		var parsed = JSON.parse(raw);
		window.missionsState = {
			boostOverheat: !!parsed.boostOverheat || base.boostOverheat,
			learnWithAdam: !!parsed.learnWithAdam,
			secretLogo: !!parsed.secretLogo,
			rewardUnlocked: !!parsed.rewardUnlocked
		};
	} catch (e) {
		window.missionsState = base;
	}
}

function saveMissionsState() {
	if (!window.missionsState) {
		return;
	}
	localStorage.setItem(MISSIONS_STATE_KEY, JSON.stringify(window.missionsState));
}

function updateMissionsUI() {
	if (!window.missionsState) {
		return;
	}
	var map = [
		{ key: "boostOverheat", id: "mission-boost", cardId: "mission-card-boost" },
		{ key: "learnWithAdam", id: "mission-learn", cardId: "mission-card-learn" },
		{ key: "secretLogo", id: "mission-secret", cardId: "mission-card-secret" }
	];
	var done = 0;
	map.forEach(function(item) {
		var node = document.getElementById(item.id);
		var card = document.getElementById(item.cardId);
		if (!node) {
			return;
		}
		var ok = !!window.missionsState[item.key];
		var doneText = (typeof window.t === "function") ? window.t("missions.done", "Zaliczone") : "Zaliczone";
		var todoText = (typeof window.t === "function") ? window.t("missions.todo", "Do zrobienia") : "Do zrobienia";
		node.textContent = ok ? doneText : todoText;
		if (card) {
			card.classList.toggle("done", ok);
		}
		if (ok) {
			done++;
		}
	});

	var allDone = !!window.missionsState.boostOverheat &&
		!!window.missionsState.learnWithAdam &&
		!!window.missionsState.secretLogo;

	var claim = document.getElementById("mission-claim");
	if (claim) {
		claim.hidden = !(allDone && !window.missionsState.rewardUnlocked);
	}

	var consultPanel = document.getElementById("consult-panel");
	var consultBadge = document.getElementById("consult-badge");
	if (consultPanel) {
		consultPanel.classList.toggle("consult-online", !!window.missionsState.secretLogo);
	}
	if (consultBadge) {
		var badgeKey = window.missionsState.secretLogo ? "about.consultOnline" : "about.consultBadge";
		var badgeFallback = window.missionsState.secretLogo ? "Online" : "Offline";
		consultBadge.textContent = (typeof window.t === "function") ? window.t(badgeKey, badgeFallback) : badgeFallback;
	}

	applyRewardMode();
}

function completeMission(key) {
	if (!window.missionsState || window.missionsState[key]) {
		return;
	}
	window.missionsState[key] = true;
	saveMissionsState();
	updateMissionsUI();
}

function initLearnWithAdam() {
	var button = document.getElementById("learn-button");
	var text = document.getElementById("learn-fact");
	if (!button || !text) {
		return;
	}

	button.addEventListener("click", function() {
		var facts = (typeof window.t === "function") ? window.t("learn.facts", []) : [];
		if (!Array.isArray(facts) || facts.length === 0) {
			return;
		}
		text.textContent = nextLearnFact(facts);
		window.learnFactClicks++;
		if (window.learnFactClicks >= 3 && !window.missionsState.learnWithAdam) {
			completeMission("learnWithAdam");
		}
	});
}

function applyRewardMode() {
	if (!window.missionsState) {
		return;
	}
	var badge = document.getElementById("reward-badge");
	if (badge) {
		badge.hidden = !window.missionsState.rewardUnlocked;
	}
}

function initRewardClaim() {
	var button = document.getElementById("claim-reward-button");
	if (!button) {
		return;
	}

	function playRewardClaimEffect() {
		var badge = document.getElementById("reward-badge");
		if (!badge) {
			return;
		}
		badge.classList.remove("reward-claim-animate");
		void badge.offsetWidth;
		badge.classList.add("reward-claim-animate");

		for (var i = 0; i < 12; i++) {
			var line = document.createElement("span");
			line.className = "reward-confetti-line";
			var angle = (360 / 12) * i + (Math.random() * 16 - 8);
			var distance = 76 + Math.random() * 70;
			line.style.setProperty("--confetti-angle", angle.toFixed(1) + "deg");
			line.style.setProperty("--confetti-distance", distance.toFixed(1) + "px");
			line.style.setProperty("--confetti-delay", (Math.random() * 0.14).toFixed(3) + "s");
			badge.appendChild(line);
			(function(node) {
				setTimeout(function() {
					if (node && node.parentNode) {
						node.parentNode.removeChild(node);
					}
				}, 1300);
			})(line);
		}

		setTimeout(function() {
			badge.classList.remove("reward-claim-animate");
		}, 1250);
	}

	button.addEventListener("click", function() {
		if (!window.missionsState) {
			return;
		}
		playRewardClaimEffect();
		window.missionsState.rewardUnlocked = true;
		saveMissionsState();
		updateMissionsUI();
	});
}

function initConsultModeMission() {
	var badge = document.getElementById("consult-badge");
	if (!badge) {
		return;
	}

	badge.addEventListener("click", function() {
		if (window.missionsState && window.missionsState.secretLogo) {
			return;
		}
		window.consultClickCount++;
		if (window.consultClickCount >= 5) {
			completeMission("secretLogo");
		}
	});
}

function setConsultPhoto(mode) {
	var photo = document.querySelector("#consult-panel .hero-photo");
	if (!photo) {
		return;
	}
	if (mode === "deal") {
		photo.src = "images/poggers.jpeg";
		photo.dataset.photoMode = "deal";
		return;
	}
	photo.src = "images/mua.JPG";
	photo.dataset.photoMode = "default";
}

function restoreConsultPhotoState() {
	var mode = localStorage.getItem(CONSULT_PHOTO_STATE_KEY);
	var until = Number(localStorage.getItem(CONSULT_PHOTO_UNTIL_KEY) || 0);
	var now = Date.now();
	if (mode === "deal" && until > now) {
		setConsultPhoto("deal");
		return;
	}
	localStorage.removeItem(CONSULT_PHOTO_STATE_KEY);
	localStorage.removeItem(CONSULT_PHOTO_UNTIL_KEY);
	setConsultPhoto("default");
}

function scheduleConsultPhotoReset() {
	var until = Number(localStorage.getItem(CONSULT_PHOTO_UNTIL_KEY) || 0);
	var now = Date.now();
	if (!until || until <= now) {
		return;
	}
	setTimeout(function() {
		localStorage.removeItem(CONSULT_PHOTO_STATE_KEY);
		localStorage.removeItem(CONSULT_PHOTO_UNTIL_KEY);
		setConsultPhoto("default");
	}, until - now);
}

function initRewardContactUnlock() {
	var links = document.querySelectorAll(".contact-links a");
	if (!links || links.length === 0) {
		return;
	}
	links.forEach(function(link) {
		link.addEventListener("click", function() {
			if (!window.missionsState || !window.missionsState.rewardUnlocked) {
				return;
			}
			setConsultPhoto("deal");
			localStorage.setItem(CONSULT_PHOTO_STATE_KEY, "deal");
			localStorage.setItem(CONSULT_PHOTO_UNTIL_KEY, String(Date.now() + CONSULT_PHOTO_DURATION_MS));
			scheduleConsultPhotoReset();
			setTimeout(function() {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}, 120);
		});
	});
}

function registerHoverActivity(container) {
	if (!window.boostMode) {
		return;
	}
	var state = window.techEasterEggState;
	var now = performance.now();
	var windowMs = 6500;
	state.hoverTimes = state.hoverTimes.filter(function(ts) { return now - ts < windowMs; });
	state.hoverTimes.push(now);
	if (state.hoverTimes.length >= 16) {
		state.hoverTimes = [];
		triggerTechEasterEgg(container);
	}
}

function renderProjects() {
	var list = document.getElementById("portfolio-list");
	if (!list || !Array.isArray(window.projectsData)) {
		return;
	}

	var lang = (window.currentLang || "pl").toLowerCase();
	function pickLocalized(value) {
		if (value && typeof value === "object" && !Array.isArray(value)) {
			return value[lang] || value.pl || "";
		}
		return value || "";
	}
	var html = "";
	window.projectsData.forEach(function(project) {
		var projectTitle = pickLocalized(project.title);
		var projectDescription = pickLocalized(project.description);
		var projectStack = pickLocalized(project.stack);
		var projectLink = pickLocalized(project.link) || project.link || "#";
		var stack = (Array.isArray(projectStack) ? projectStack : [])
			.map(function(tag) {
				return '<span class="project-tag">' + escapeHtml(tag) + "</span>";
			})
			.join("");

		html += '<article class="project-card">';
		html += '    <h3>' + escapeHtml(projectTitle || "") + "</h3>";
		html += '    <p>' + escapeHtml(projectDescription || "") + "</p>";
		html += '    <div class="project-tags">' + stack + "</div>";
		html +=
			'    <a class="project-link" target="_blank" rel="noopener noreferrer" href="' +
			escapeHtml(projectLink) +
			'">' + escapeHtml(typeof window.t === "function" ? window.t("projects.moreInfo", "Więcej informacji") : "Więcej informacji") + "</a>";
		html += "</article>";
	});

	list.innerHTML = html;
}

function createLogoItem(item, showLabel) {
	var label = escapeHtml(item && item.name ? item.name : "");
	var logo = item && item.logo ? escapeHtml(item.logo) : "";

	if (!logo) {
		return "";
	}

	var html = '<span class="logo-item">';
	html += '<span class="logo-frame"><img loading="lazy" src="' + logo + '" alt="' + label + ' logo"></span>';

	if (showLabel) {
		html += '<span class="logo-item-label">' + label + "</span>";
	}

	html += "</span>";
	return html;
}

function renderLogoGrid(containerId, items) {
	var container = document.getElementById(containerId);
	if (!container || !Array.isArray(items) || items.length === 0) {
		return;
	}

	var html = items
		.map(function(item) {
			return createLogoItem(item, false);
		})
		.join("");
	if (!html) {
		container.innerHTML = "";
		return;
	}
	container.innerHTML = '<div class="ticker-track">' + html + html + html + "</div>";
}

function renderTechSpace(items) {
	var container = document.getElementById("tech-space");
	if (!container || !Array.isArray(items) || items.length === 0) {
		return;
	}

	var html = items
		.map(function(item, index) {
			if (!item || (!item.logo && !item.glyph)) {
				return "";
			}
			var label = escapeHtml(item.name || "");
			var techSlug = escapeHtml(String(item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"));
			var logo = item.logo ? escapeHtml(item.logo) : "";
			var glyph = item.glyph ? escapeHtml(item.glyph) : "";
			var glyphClass = item.glyphClass ? escapeHtml(item.glyphClass) : "";
			var delay = (index % 7) * 0.4;
			var driftX = (Math.random() * 8 + 4).toFixed(2) + "px";
			var driftY = (Math.random() * 10 + 5).toFixed(2) + "px";
			var duration = (Math.random() * 3 + 4).toFixed(2) + "s";
			var visual = logo
				? '<img loading="lazy" src="' + logo + '" alt="' + label + ' logo">'
				: '<span class="tech-glyph ' + glyphClass + '" aria-hidden="true">' + glyph + "</span>";
			return (
				'<button class="tech-node" style="animation-delay:' + delay + "s;" +
				"--drift-x:" + driftX + ";" +
				"--drift-y:" + driftY + ";" +
				"--orbit-duration:" + duration + ';" aria-label="' + label + '" data-tech="' + techSlug + '">' +
				visual +
				'<span class="tech-tooltip">' + label + "</span>" +
				"</button>"
			);
		})
		.join("");

	container.innerHTML = html;
	initTechSpaceInteractions(container);
}

function renderSecondaryTools(items) {
	var container = document.getElementById("secondary-tools");
	if (!container || !Array.isArray(items)) {
		return;
	}
	var html = items
		.filter(function(item) { return item && (item.logo || item.glyph); })
		.map(function(item) {
			var label = escapeHtml(item.name || "");
			var logo = escapeHtml(item.logo || "");
			var glyph = escapeHtml(item.glyph || "");
			var glyphClass = escapeHtml(item.glyphClass || "");
			var visual = logo
				? '<img loading="lazy" src="' + logo + '" alt="' + label + ' logo">'
				: '<span class="secondary-glyph ' + glyphClass + '" aria-hidden="true">' + glyph + "</span>";
			return '<span class="secondary-tool" aria-label="' + label + '">' + visual + "</span>";
		})
		.join("");
	container.innerHTML = html ? '<div class="ticker-track">' + html + html + html + "</div>" : "";
}

function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}

function isTooClose(candidateX, candidateY, placedNodes, minDistance) {
	for (var i = 0; i < placedNodes.length; i++) {
		var dx = candidateX - placedNodes[i].x;
		var dy = candidateY - placedNodes[i].y;
		if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
			return true;
		}
	}
	return false;
}

function positionTechNodes(container) {
	var nodes = Array.prototype.slice.call(container.querySelectorAll(".tech-node"));
	if (!nodes.length) {
		return;
	}

	var bounds = container.getBoundingClientRect();
	var nodeSize = nodes[0].offsetWidth || 72;
	var padding = 14;
	var minDistance = Math.max(90, nodeSize * 1.12);
	var maxX = Math.max(padding + nodeSize * 0.5, bounds.width - nodeSize * 0.5 - padding);
	var maxY = Math.max(padding + nodeSize * 0.5, bounds.height - nodeSize * 0.5 - padding);
	var placed = [];
	var physics = container.__techPhysics || { nodes: [], rafId: null, lastTs: 0 };
	container.__techPhysics = physics;
	physics.nodes = [];

	nodes.forEach(function(node, index) {
		var x = padding + nodeSize * 0.5;
		var y = padding + nodeSize * 0.5;
		var attempts = 0;

		while (attempts < 90) {
			x = randomBetween(padding, maxX);
			y = randomBetween(padding, maxY);
			if (!isTooClose(x, y, placed, minDistance)) {
				break;
			}
			attempts++;
		}

		placed.push({ x: x, y: y });
		node.style.left = (x - nodeSize * 0.5) + "px";
		node.style.top = (y - nodeSize * 0.5) + "px";
		node.style.setProperty("--trail-offset", (nodeSize * 0.42).toFixed(1) + "px");

		var speed = randomBetween(42, 92);
		var angle = randomBetween(0, Math.PI * 2);
		physics.nodes[index] = {
			el: node,
			x: x,
			y: y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			r: nodeSize * 0.5
		};
	});
}

function moveNodeToNewPosition(container, node, isFastEscape) {
	var physics = container.__techPhysics;
	if (!physics || !physics.nodes) {
		return;
	}

	var state = physics.nodes.find(function(n) { return n.el === node; });
	if (!state) {
		return;
	}
	var impulseAngle = randomBetween(0, Math.PI * 2);
	var boostMultiplier = window.boostMode ? 10 : 1;
	var impulse = (isFastEscape ? randomBetween(220, 320) : randomBetween(120, 180)) * boostMultiplier;
	state.vx += Math.cos(impulseAngle) * impulse;
	state.vy += Math.sin(impulseAngle) * impulse;
	if (window.boostMode && isFastEscape) {
		state.boostUntil = performance.now() + 1200;
	}

	var dx = state.vx;
	var dy = state.vy;
	var angleDeg = (Math.atan2(dy, dx) * (180 / Math.PI)) + 180;
	node.style.setProperty("--trail-angle", angleDeg + "deg");

	node.classList.add("tech-node-escaping");
	setTimeout(function() {
		node.classList.remove("tech-node-escaping");
	}, 320);
}

function runTechPhysics(container, timestamp) {
	var physics = container.__techPhysics;
	if (!physics || !physics.nodes || !physics.nodes.length) {
		return;
	}

	if (!physics.lastTs) {
		physics.lastTs = timestamp;
	}
	var dt = Math.min(0.032, (timestamp - physics.lastTs) / 1000);
	physics.lastTs = timestamp;

	var bounds = container.getBoundingClientRect();
	var padding = 12;
	var maxSpeed = 340;
	var minSpeed = 38;
	var wallBoost = 1.1;
	var state = window.techEasterEggState;
	var overheatNow = timestamp < (state.activeUntil || 0);

	// soft repulsion for close nodes
	for (var i = 0; i < physics.nodes.length; i++) {
		for (var j = i + 1; j < physics.nodes.length; j++) {
			var a = physics.nodes[i];
			var b = physics.nodes[j];
			var dx = b.x - a.x;
			var dy = b.y - a.y;
			var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
			var minDist = (a.r + b.r) * 1.15;
			if (dist < minDist) {
				var nx = dx / dist;
				var ny = dy / dist;
				var push = (minDist - dist) * 7.8;
				a.vx -= nx * push;
				a.vy -= ny * push;
				b.vx += nx * push;
				b.vy += ny * push;
			}
		}
	}

	physics.nodes.forEach(function(n) {
		if (n.el.classList.contains("tech-node-boom")) {
			return;
		}
		n.vx *= overheatNow ? 0.988 : 0.999;
		n.vy *= overheatNow ? 0.988 : 0.999;
		n.x += n.vx * dt;
		n.y += n.vy * dt;

		var minX = n.r + padding;
		var maxX = bounds.width - n.r - padding;
		var minY = n.r + padding;
		var maxY = bounds.height - n.r - padding;

		if (n.x < minX) {
			n.x = minX;
			n.vx = Math.abs(n.vx) * wallBoost;
		} else if (n.x > maxX) {
			n.x = maxX;
			n.vx = -Math.abs(n.vx) * wallBoost;
		}

		if (n.y < minY) {
			n.y = minY;
			n.vy = Math.abs(n.vy) * wallBoost;
		} else if (n.y > maxY) {
			n.y = maxY;
			n.vy = -Math.abs(n.vy) * wallBoost;
		}

		var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
		var nodeMaxSpeed = (n.boostUntil && timestamp < n.boostUntil) ? maxSpeed * 10 : maxSpeed;
		if (speed < minSpeed) {
			var boostAngle = Math.atan2(n.vy || randomBetween(-1, 1), n.vx || randomBetween(-1, 1));
			n.vx = Math.cos(boostAngle) * minSpeed;
			n.vy = Math.sin(boostAngle) * minSpeed;
			speed = minSpeed;
		}
		if (speed > nodeMaxSpeed) {
			var factor = nodeMaxSpeed / speed;
			n.vx *= factor;
			n.vy *= factor;
		}

		var angleDeg = (Math.atan2(n.vy, n.vx) * (180 / Math.PI)) + 180;
		n.el.style.setProperty("--trail-angle", angleDeg + "deg");
		n.el.style.left = (n.x - n.r) + "px";
		n.el.style.top = (n.y - n.r) + "px";
	});

	physics.rafId = requestAnimationFrame(function(ts) {
		runTechPhysics(container, ts);
	});
}

function initTechSpaceInteractions(container) {
	positionTechNodes(container);
	var physics = container.__techPhysics;
	if (physics && physics.rafId) {
		cancelAnimationFrame(physics.rafId);
		physics.rafId = null;
	}
	if (physics) {
		physics.lastTs = 0;
		physics.rafId = requestAnimationFrame(function(ts) {
			runTechPhysics(container, ts);
		});
	}

	var nodes = container.querySelectorAll(".tech-node");
	nodes.forEach(function(node) {
		node.addEventListener("mouseenter", function() {
			registerHoverActivity(container);
			var now = Date.now();
			var lastEscape = Number(node.dataset.lastEscapeTs || 0);
			if (now - lastEscape < 220) {
				return;
			}
			node.dataset.lastEscapeTs = String(now);
			moveNodeToNewPosition(container, node, true);
		});
		node.addEventListener("click", function() {
			moveNodeToNewPosition(container, node, true);
		});
	});

	if (!window.__techSpaceResizeBound) {
		window.__techSpaceResizeBound = true;
		window.addEventListener("resize", function() {
			var active = document.getElementById("tech-space");
			if (!active) {
				return;
			}
			positionTechNodes(active);
		});
	}

	if (!window.__techSpaceVisibilityBound) {
		window.__techSpaceVisibilityBound = true;
		window.addEventListener("visibilitychange", function() {
			var active = document.getElementById("tech-space");
			if (!active || !active.__techPhysics) {
				return;
			}
			if (document.hidden) {
				if (active.__techPhysics.rafId) {
					cancelAnimationFrame(active.__techPhysics.rafId);
					active.__techPhysics.rafId = null;
				}
			} else if (!active.__techPhysics.rafId) {
				active.__techPhysics.lastTs = 0;
				active.__techPhysics.rafId = requestAnimationFrame(function(ts) {
					runTechPhysics(active, ts);
				});
			}
		});
	}
}

function setCurrentYear() {
	var yearNode = document.getElementById("current-year");
	if (!yearNode) {
		return;
	}
	yearNode.textContent = new Date().getFullYear();
}

renderProjects();
initBoostToggle();
loadMissionsState();
restoreConsultPhotoState();
scheduleConsultPhotoReset();
updateMissionsUI();
initLearnWithAdam();
initConsultModeMission();
initRewardClaim();
initRewardContactUnlock();
if (window.marqueeData) {
	renderTechSpace(window.marqueeData.coreTechnologies || []);
	renderSecondaryTools(window.marqueeData.secondaryTools || []);
	renderLogoGrid("company-logos", window.marqueeData.companies || []);
	renderLogoGrid("partner-logos", window.marqueeData.partners || []);
}
setCurrentYear();

window.renderProjects = renderProjects;
window.renderTechSpace = renderTechSpace;
window.renderSecondaryTools = renderSecondaryTools;
window.renderLogoGrid = renderLogoGrid;
window.setCurrentYear = setCurrentYear;
window.updateMissionsUI = updateMissionsUI;
