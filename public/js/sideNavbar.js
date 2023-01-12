let sideNavbar = document.getElementById('sideNavbar-container');
let burgerIcon = document.getElementById('navbarMenuIcon');

burgerIcon.addEventListener('click', () =>{
    sideNavbar.classList.toggle('is-open');
});