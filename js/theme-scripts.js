$(window).scroll(function() {
	if ($(document).scrollTop() > 150) {
		$('.navbar').addClass('navbar-shrink');
	} else {
		$('.navbar').removeClass('navbar-shrink');
	}
});

$(function() {
	$('a[href*=#]:not([href=#])').click(
			function() {
				if (location.pathname.replace(/^\//, '') == this.pathname
						.replace(/^\//, '')
						&& location.hostname == this.hostname) {
					var target = $(this.hash);
					target = target.length ? target : $('[name='
							+ this.hash.slice(1) + ']');
					if (target.length) {
						$('html,body').animate({
							scrollTop : target.offset().top
						}, 1500);
						return false;
					}
				}
			});
});

(function($) {
	$.fn.countTo = function(options) {
		options = options || {};

		return $(this)
				.each(
						function() {
							// set options for current element
							var settings = $.extend({}, $.fn.countTo.defaults,
									{
										from : $(this).data('from'),
										to : $(this).data('to'),
										speed : $(this).data('speed'),
										refreshInterval : $(this).data(
												'refresh-interval'),
										decimals : $(this).data('decimals')
									}, options);

							// how many times to update the value, and how much
							// to increment the value on each update
							var loops = Math.ceil(settings.speed
									/ settings.refreshInterval), increment = ((settings.to - settings.from) / loops);

							// references & variables that will change with each
							// update
							var self = this, $self = $(this), loopCount = 0, value = settings.from, data = $self
									.data('countTo')
									|| {};

							$self.data('countTo', data);

							// if an existing interval can be found, clear it
							// first
							if (data.interval) {
								clearInterval(data.interval);
							}
							data.interval = setInterval(updateTimer,
									settings.refreshInterval);

							// initialize the element with the starting value
							render(value);

							function updateTimer() {
								value += increment;
								loopCount++;

								render(value);

								if (typeof (settings.onUpdate) == 'function') {
									settings.onUpdate.call(self, value);
								}

								if (loopCount >= loops) {
									// remove the interval
									$self.removeData('countTo');
									clearInterval(data.interval);
									value = settings.to;

									if (typeof (settings.onComplete) == 'function') {
										settings.onComplete.call(self, value);
									}
								}
							}

							function render(value) {
								var formattedValue = settings.formatter.call(
										self, value, settings);
								$self.html(formattedValue);
							}
						});
	};

	$.fn.countTo.defaults = {
		from : 0, // the number the element should start at
		to : 0, // the number the element should end at
		speed : 1000, // how long it should take to count between the target
						// numbers
		refreshInterval : 100, // how often the element should be updated
		decimals : 0, // the number of decimal places to show
		formatter : formatter, // handler for formatting the value before
								// rendering
		onUpdate : null, // callback method for every time the element is
							// updated
		onComplete : null
	// callback method for when the element finishes updating
	};

	function formatter(value, settings) {
		return value.toFixed(settings.decimals);
	}
}(jQuery));

jQuery(function($) {
	// custom formatting example
	$('.count-number').data(
			'countToOptions',
			{
				formatter : function(value, options) {
					return value.toFixed(options.decimals).replace(
							/\B(?=(?:\d{3})+(?!\d))/g, ',');
				}
			});

	// start all the timers
	$('.timer').each(count);

	function count(options) {
		var $this = $(this);
		options = $.extend({}, options || {}, $this.data('countToOptions')
				|| {});
		$this.countTo(options);
	}
});

// Owl carousel
$('.owl-carousel').owlCarousel({
	loop : true,
	margin : 10,
	nav : false,
	autoplay : true,
	autoplayTimeout : 3000,
	autoplayHoverPause : true,
	responsive : {
		0 : {
			items : 1
		},
		600 : {
			items : 3
		},
		1000 : {
			items : 5
		}
	}
})

// hide #back-top first
$("#back-top").hide();

// fade in #back-top

$(window).scroll(function() {
	if ($(this).scrollTop() > 100) {
		$('#back-top').fadeIn();
	} else {
		$('#back-top').fadeOut();
	}
});

// scroll body to 0px on click
$('#back-top a').on("click", function() {
	$('body,html').animate({
		scrollTop : 0
	}, 800);
	return false;
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
	$('.navbar-toggle:visible').click();
});

function czas() {

		if (!document.layers && !document.getElementById && !document.all)
			return

		var godzina, minuty, sekundy, dzien, licz_dzien, miesiac, dzisiaj, rok, tekst_miesiac, tekst_dzien;
		dzisiaj = new Date();
		godzina = dzisiaj.getHours();
		minuty = dzisiaj.getMinutes();
		sekundy = dzisiaj.getSeconds();
		rok = dzisiaj.getYear();
		dzien = dzisiaj.getDate();
		licz_dzien = dzisiaj.getDay();
		if (licz_dzien == 0) {
			tekst_dzien = "Niedziela"
		}
		if (licz_dzien == 1) {
			tekst_dzien = "Poniedziałek"
		}
		if (licz_dzien == 2) {
			tekst_dzien = "Wtorek"
		}
		if (licz_dzien == 3) {
			tekst_dzien = "Środa"
		}
		if (licz_dzien == 4) {
			tekst_dzien = "Czwartek"
		}
		if (licz_dzien == 5) {
			tekst_dzien = "Piątek"
		}
		if (licz_dzien == 6) {
			tekst_dzien = "Sobota"
		}
		miesiac = dzisiaj.getMonth() + 1;
		if (miesiac == 1) {
			tekst_miesiac = "stycznia"
		}
		if (miesiac == 2) {
			tekst_miesiac = "lutego"
		}
		if (miesiac == 3) {
			tekst_miesiac = "marca"
		}
		if (miesiac == 4) {
			tekst_miesiac = "kwietnia"
		}
		if (miesiac == 5) {
			tekst_miesiac = "maja"
		}
		if (miesiac == 6) {
			tekst_miesiac = "czerwca"
		}
		if (miesiac == 7) {
			tekst_miesiac = "lipca"
		}
		if (miesiac == 8) {
			tekst_miesiac = "sierpnia"
		}
		if (miesiac == 9) {
			tekst_miesiac = "września"
		}
		if (miesiac == 10) {
			tekst_miesiac = "października"
		}
		if (miesiac == 11) {
			tekst_miesiac = "listopada"
		}
		if (miesiac == 12) {
			tekst_miesiac = "grudnia"
		}
		if ((rok >= 00) && (rok <= 1900)) {
			rok = 1900 + rok;
		}
		if (miesiac < 10) {
			miesiac = "0" + miesiac;
		}
		if (dzien < 10) {
			dzien = "0" + dzien;
		}
		if (godzina < 10) {
			godzina = "0" + godzina;
		}
		if (minuty < 10) {
			minuty = "0" + minuty;
		}
		if (sekundy < 10) {
			sekundy = "0" + sekundy;
		}
		pelnyczas = tekst_dzien + ", " + dzien + " " + tekst_miesiac + " "
				+ rok + "<br>" + godzina + ":" + minuty + ":" + sekundy;

		if (document.getElementById) {
			document.getElementById("Data").innerHTML = pelnyczas
		} else if (document.layers) {
			document.layers.Data.document.write(pelnyczas)
		} else if (document.all)
			Data.innerHTML = pelnyczas

			// Czestotliwosc odswiezania
		setTimeout("czas()", 500)
	}
