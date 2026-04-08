function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function renderProjects() {
	var list = document.getElementById("portfolio-list");
	if (!list || !Array.isArray(window.projectsData)) {
		return;
	}

	var projectReadmeUrl = "https://github.com/SomeUnusualProgramming/SomeUnusualProgramming.github.io#readme";
	var html = "";
	window.projectsData.forEach(function(project) {
		var stack = (project.stack || [])
			.map(function(tag) {
				return '<span class="project-tag">' + escapeHtml(tag) + "</span>";
			})
			.join("");

		html += '<article class="project-card">';
		html += '    <h3>' + escapeHtml(project.title || "") + "</h3>";
		html += '    <p>' + escapeHtml(project.description || "") + "</p>";
		html += '    <div class="project-tags">' + stack + "</div>";
		html +=
			'    <a class="project-link" target="_blank" rel="noopener noreferrer" href="' +
			projectReadmeUrl +
			'">Więcej informacji</a>';
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
	container.innerHTML = html;
}

function renderTechSpace(items) {
	var container = document.getElementById("tech-space");
	if (!container || !Array.isArray(items) || items.length === 0) {
		return;
	}

	var html = items
		.map(function(item, index) {
			if (!item || !item.logo) {
				return "";
			}
			var label = escapeHtml(item.name || "");
			var logo = item.logo ? escapeHtml(item.logo) : "";
			var delay = (index % 7) * 0.4;
			var driftX = (Math.random() * 8 + 4).toFixed(2) + "px";
			var driftY = (Math.random() * 10 + 5).toFixed(2) + "px";
			var duration = (Math.random() * 3 + 4).toFixed(2) + "s";
			return (
				'<button class="tech-node" style="animation-delay:' + delay + "s;" +
				"--drift-x:" + driftX + ";" +
				"--drift-y:" + driftY + ";" +
				"--orbit-duration:" + duration + ';" aria-label="' + label + '">' +
				'<img loading="lazy" src="' + logo + '" alt="' + label + ' logo">' +
				'<span class="tech-tooltip">' + label + "</span>" +
				"</button>"
			);
		})
		.join("");

	container.innerHTML = html;
	initTechSpaceInteractions(container);
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
	var padding = 22;
	var minDistance = Math.max(108, nodeSize * 1.25);
	var maxX = Math.max(padding, bounds.width - nodeSize - padding);
	var maxY = Math.max(padding, bounds.height - nodeSize - padding);
	var placed = [];

	nodes.forEach(function(node) {
		var x = padding;
		var y = padding;
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
		node.style.left = x + "px";
		node.style.top = y + "px";
		node.style.setProperty("--trail-offset", (nodeSize * 0.42).toFixed(1) + "px");
	});
}

function moveNodeToNewPosition(container, node) {
	var nodes = Array.prototype.slice.call(container.querySelectorAll(".tech-node"));
	var bounds = container.getBoundingClientRect();
	var nodeSize = node.offsetWidth || 72;
	var padding = 22;
	var minDistance = Math.max(108, nodeSize * 1.25);
	var maxX = Math.max(padding, bounds.width - nodeSize - padding);
	var maxY = Math.max(padding, bounds.height - nodeSize - padding);
	var occupied = nodes
		.filter(function(other) { return other !== node; })
		.map(function(other) {
			return {
				x: parseFloat(other.style.left) || 0,
				y: parseFloat(other.style.top) || 0
			};
		});

	var x = padding;
	var y = padding;
	var attempts = 0;
	var oldX = parseFloat(node.style.left) || padding;
	var oldY = parseFloat(node.style.top) || padding;
	while (attempts < 120) {
		x = randomBetween(padding, maxX);
		y = randomBetween(padding, maxY);
		if (!isTooClose(x, y, occupied, minDistance)) {
			break;
		}
		attempts++;
	}

	var dx = x - oldX;
	var dy = y - oldY;
	var angleDeg = (Math.atan2(dy, dx) * (180 / Math.PI)) + 180;
	node.style.setProperty("--trail-angle", angleDeg + "deg");
	node.style.setProperty("--trail-offset", (nodeSize * 0.42).toFixed(1) + "px");

	node.classList.add("tech-node-escaping");
	node.style.left = x + "px";
	node.style.top = y + "px";
	setTimeout(function() {
		node.classList.remove("tech-node-escaping");
	}, 320);
}

function initTechSpaceInteractions(container) {
	positionTechNodes(container);
	var nodes = container.querySelectorAll(".tech-node");
	nodes.forEach(function(node) {
		node.addEventListener("click", function() {
			moveNodeToNewPosition(container, node);
		});
	});

	window.addEventListener("resize", function() {
		positionTechNodes(container);
	});
}

function setCurrentYear() {
	var yearNode = document.getElementById("current-year");
	if (!yearNode) {
		return;
	}
	yearNode.textContent = new Date().getFullYear();
}

renderProjects();
if (window.marqueeData) {
	renderTechSpace(window.marqueeData.technologies || []);
	renderLogoGrid("company-logos", window.marqueeData.companies || []);
	renderLogoGrid("partner-logos", window.marqueeData.partners || []);
}
setCurrentYear();
