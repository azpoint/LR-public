// --------- NAVBAR ----------
let navbar = document.getElementById("navbar");
let navPos = navbar.getBoundingClientRect().top;
let header = document.getElementById('header');

window.addEventListener("scroll", e => {
  let scrollPos = window.scrollY;
  if (scrollPos > navPos) {
    navbar.classList.add('sticky');
    header.classList.add('navbarOffsetMargin');
  } else {
    navbar.classList.remove('sticky');
    header.classList.remove('navbarOffsetMargin');
  }
});

window.onscroll = function() {scrollBar()};

function scrollBar() {
  let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let scrolled = (winScroll / height) * 100;
  document.getElementById("myBar").style.width = scrolled + "%";
}

// -------- SLIDER --------
let slider = document.querySelector('.swiper-container');
let fullScreenIcon = document.querySelector('.goFullScreen');


const swiper = new Swiper('.swiper', {
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  effect: 'coverflow',
  grabCursor: true,
  preloadImages: false,
  lazy: {
    loadPrevNext: true,
  }
});


function fullScreenToggler() {
  if(!document.fullscreenElement) {
    slider.requestFullscreen();
    fullScreenIcon.classList.add('moveFSI')
  } else {
    document.exitFullscreen();
    fullScreenIcon.classList.remove('moveFSI')
  }
}

fullScreenIcon.addEventListener('click', fullScreenToggler);