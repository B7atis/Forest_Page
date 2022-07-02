const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

let section = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav ul a')

window.onscroll = () => {
  section.forEach(sec => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute('id');

    if (top >= offset && top < offset + height) {
      navLinks.forEach(links => {
        links.classList.remove('active');
        document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
      })
    }
  })
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
})

document.querySelectorAll('.nav-link').forEach(e => e.addEventListener('click', () => {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
}))
