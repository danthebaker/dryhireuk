$(document).ready(function() {
	// Active Theme: Select the theme you want to activate on the entire website
	$("body").addClass("wp-theme-3");
	
	//Carousels
	$('.carousel-3').carousel({
		interval: 5000,
		pause	: 'hover'
	});
	// Sortable list
	/* $('#ulSorList').mixitup();*/
	// Fancybox
	$(".theater").fancybox();
	// Fancybox	
	$(".ext-source").fancybox({
		'transitionIn'		: 'none',
		'transitionOut'		: 'none',
		'autoScale'     	: false,
		'type'				: 'iframe',
		'width'				: '50%',
		'height'			: '60%',
		'scrolling'   		: 'no'
	});
	
	// Scroll to top
	$().UItoTop({ easingType: 'easeOutQuart' });
	// Inview animations
	$.fn.waypoint.defaults = {
		context: window,
		continuous: true,
		enabled: true,
		horizontal: false,
		offset: 300,
		triggerOnce: false
	}

});