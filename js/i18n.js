(function() {
	var SUPPORTED_LANGS = ["pl", "en", "de", "es"];
	var STORAGE_KEY = "portfolio.lang";

	function getByPath(obj, path) {
		return path.split(".").reduce(function(acc, key) {
			return acc && typeof acc === "object" ? acc[key] : undefined;
		}, obj);
	}

	function normalizeLang(value) {
		var lang = (value || "").toLowerCase().slice(0, 2);
		return SUPPORTED_LANGS.indexOf(lang) >= 0 ? lang : "pl";
	}

	function detectInitialLang() {
		var saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			return normalizeLang(saved);
		}
		return normalizeLang(navigator.language || "pl");
	}

	function t(key, fallback) {
		var catalogs = window.i18nCatalogs || {};
		var active = catalogs[window.currentLang] || {};
		var pl = catalogs.pl || {};
		return getByPath(active, key) || getByPath(pl, key) || fallback || key;
	}

	function updateStaticText() {
		document.querySelectorAll("[data-i18n]").forEach(function(node) {
			var key = node.getAttribute("data-i18n");
			var value = t(key, node.textContent);
			if (/<[a-z][\s\S]*>/i.test(value)) {
				node.innerHTML = value;
			} else {
				node.textContent = value;
			}
		});

		document.querySelectorAll("[data-i18n-content]").forEach(function(node) {
			var key = node.getAttribute("data-i18n-content");
			node.setAttribute("content", t(key, node.getAttribute("content")));
		});

		document.querySelectorAll("[data-i18n-aria-label]").forEach(function(node) {
			var key = node.getAttribute("data-i18n-aria-label");
			node.setAttribute("aria-label", t(key, node.getAttribute("aria-label")));
		});

		document.title = t("meta.title", document.title);
		document.documentElement.lang = window.currentLang;
	}

	function updateLangButton() {
		var button = document.getElementById("lang-button");
		if (!button) {
			return;
		}
		button.textContent = (window.currentLang || "pl").toUpperCase();
	}

	function setLanguage(lang) {
		window.currentLang = normalizeLang(lang);
		localStorage.setItem(STORAGE_KEY, window.currentLang);
		updateStaticText();
		updateLangButton();
		if (typeof window.renderProjects === "function") {
			window.renderProjects();
		}
		if (typeof window.setCurrentYear === "function") {
			window.setCurrentYear();
		}
	}

	function initLanguageSwitcher() {
		var button = document.getElementById("lang-button");
		var menu = document.getElementById("lang-menu");
		if (!button || !menu) {
			return;
		}

		button.addEventListener("click", function() {
			var expanded = button.getAttribute("aria-expanded") === "true";
			button.setAttribute("aria-expanded", expanded ? "false" : "true");
			menu.hidden = expanded;
		});

		menu.querySelectorAll(".lang-option").forEach(function(option) {
			option.addEventListener("click", function() {
				setLanguage(option.getAttribute("data-lang"));
				button.setAttribute("aria-expanded", "false");
				menu.hidden = true;
			});
		});

		document.addEventListener("click", function(event) {
			if (!menu.hidden && !menu.contains(event.target) && event.target !== button) {
				button.setAttribute("aria-expanded", "false");
				menu.hidden = true;
			}
		});
	}

	window.currentLang = detectInitialLang();
	window.t = t;
	window.applyI18n = updateStaticText;

	document.addEventListener("DOMContentLoaded", function() {
		initLanguageSwitcher();
		updateLangButton();
		updateStaticText();
		if (typeof window.renderProjects === "function") {
			window.renderProjects();
		}
		if (typeof window.setCurrentYear === "function") {
			window.setCurrentYear();
		}
	});
})();
