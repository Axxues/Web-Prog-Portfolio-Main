const toggleBtn = document.getElementById('theme-toggle');
const body = document.querySelector("html");

// Check for saved user preference, if any, on load
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  toggleBtn.textContent = 'Light Mode';
}
window.onload = () => {
    toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        toggleBtn.textContent = 'Light Mode';
    } else {
        localStorage.setItem('theme', 'light');
        toggleBtn.textContent = 'Dark Mode';
    }
    }); 
}