// Sperrt oder entsperrt das Formular heimgehzettelForm und blendet den Hinweis ein/aus
function setFormEnabled(enabled) {
    const form = document.getElementById('heimgehzettelForm');
    if (!form) return;
    const elements = form.querySelectorAll('input, select, textarea, button');
    elements.forEach(el => {
        // Logout-Button und Hinweis nicht deaktivieren
        if (el.type !== 'button' && el.id !== 'logoutBtn') {
            el.disabled = !enabled;
        }
    });
    // Hinweis ein-/ausblenden
    const notice = document.getElementById('formLockNotice');
    if (notice) notice.style.display = enabled ? 'none' : 'block';
}

// Initial: Formular gesperrt
window.addEventListener('DOMContentLoaded', function() {
    setFormEnabled(false);
});
