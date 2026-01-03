/* ===== APPLICATION INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
    initHeaderDateTime();
});

/* ===== HEADER DATE/TIME DISPLAY ===== */
function initHeaderDateTime() {
    const dateEl = document.getElementById('datetime-date');
    const timeEl = document.getElementById('datetime-time');
    
    if (!dateEl || !timeEl) return;
    
    const POLISH_DAYS = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const POLISH_DAYS_SHORT = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
    const POLISH_MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
    
    function updateDateTime() {
        const now = new Date();
        
        // Format date: "Sob, 3 sty" or "Sobota, 3 stycznia" on desktop
        const dayName = window.innerWidth < 768 ? POLISH_DAYS_SHORT[now.getDay()] : POLISH_DAYS[now.getDay()];
        const day = now.getDate();
        const month = POLISH_MONTHS[now.getMonth()];
        
        dateEl.textContent = `${dayName}, ${day} ${month}`;
        
        // Format time: "14:32"
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}`;
    }
    
    // Initial update
    updateDateTime();
    
    // Update every minute
    setInterval(updateDateTime, 60000);
    
    // Update on resize (to switch between short/long day names)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateDateTime, 100);
    });
}

