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
window.techEasterEggState = {
	hoverTimes: [],
	activeUntil: 0,
	cooldownUntil: 0
};

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
		return;
	}

	container.classList.add("tech-overheat-message");
	setTimeout(function() {
		container.classList.remove("tech-overheat");
	}, 120);
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
