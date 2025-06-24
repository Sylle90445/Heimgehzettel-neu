// Warten, bis das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
    // Login-Modal Funktionalität
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');

    function hideLoginHint() {
        const loginRequiredModal = document.getElementById('loginRequiredModal');
        if (loginRequiredModal) loginRequiredModal.style.display = 'none';
    }
    function showLoginHintIfNeeded() {
        const loginRequiredModal = document.getElementById('loginRequiredModal');
        const userDisplay = document.getElementById('userDisplay');
        if (loginRequiredModal && userDisplay.style.display === 'none') {
            loginRequiredModal.style.display = 'flex';
        }
    }

    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'block';
        hideLoginHint();
    });

    closeLoginModal.addEventListener('click', function() {
        loginModal.style.display = 'none';
        showLoginHintIfNeeded();
    });


    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Registrierung-Modal Logik
    const showRegisterModal = document.getElementById('showRegisterModal');
    const registerModal = document.getElementById('registerModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const registerForm = document.getElementById('registerForm');

    showRegisterModal.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
        hideLoginHint();
    });

    closeRegisterModal.addEventListener('click', function() {
        registerModal.style.display = 'none';
        showLoginHintIfNeeded();
    });

    // Registrierung absenden
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Passwort-Vergleich
        const pw = document.getElementById('registerPassword').value;
        const pw2 = document.getElementById('registerPasswordRepeat').value;
        if (pw !== pw2) {
            alert('Die Passwörter stimmen nicht überein!');
            return;
        }
        // Daten sammeln
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = pw;
        const role = document.getElementById('registerRole') ? document.getElementById('registerRole').value : 'user';
        const adminPassword = document.getElementById('adminPassword') ? document.getElementById('adminPassword').value : undefined;
        // Anfrage an lokalen Proxy senden
        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role, adminPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                registerModal.style.display = 'none';
                document.getElementById('registerSuccessModal').style.display = 'block';
            } else {
                alert('Fehler: ' + (data.message || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            alert('Fehler beim Registrieren: ' + error);
        });
    });

    // Hilfsfunktion zum Umschalten der Sichtbarkeit
    let currentUser = null;
    function setLoggedInState(isLoggedIn, username, role) {
        currentUser = isLoggedIn ? { username, role } : null;
        const userDisplay = document.getElementById('userDisplay');
        const loginRequiredModal = document.getElementById('loginRequiredModal');
        const mainFormContainer = document.getElementById('mainFormContainer');
        if (isLoggedIn) {
            userDisplay.textContent = `Angemeldet als: ${username}`;
            userDisplay.style.display = 'block';
            if (mainFormContainer) mainFormContainer.style.display = '';
            if (role === 'hortner' && hortInfoEditorArea) hortInfoEditorArea.style.display = '';
            else if (hortInfoEditorArea) hortInfoEditorArea.style.display = 'none';
            if (loginRequiredModal) loginRequiredModal.style.display = 'none';
        } else {
            userDisplay.style.display = 'none';
            userDisplay.textContent = '';
            if (mainFormContainer) mainFormContainer.style.display = 'none';
            if (hortInfoEditorArea) hortInfoEditorArea.style.display = 'none';
            if (loginRequiredModal) loginRequiredModal.style.display = 'flex';
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.remove();
        }
    }

    // --- HORTINFO LOGIK ---
    const hortInfoBox = document.getElementById('hortInfoBox');
    const hortInfoEditorArea = document.getElementById('hortInfoEditorArea');
    const hortInfoEditor = document.getElementById('hortInfoEditor');
    const saveHortInfoBtn = document.getElementById('saveHortInfoBtn');

    function loadHortInfo() {
        fetch('/hortinfo')
            .then(r => r.json())
            .then(data => {
                hortInfoBox.textContent = data.text || 'Noch keine Informationen vom Hort.';
                hortInfoEditor && (hortInfoEditor.value = data.text || '');
            });
    }
    loadHortInfo();

    if (saveHortInfoBtn) {
        saveHortInfoBtn.addEventListener('click', function() {
            if (!currentUser || currentUser.role !== 'hortner') return;
            fetch('/hortinfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username, role: currentUser.role, text: hortInfoEditor.value })
            })
            .then(r => r.json())
            .then(data => {
                if (data.result === 'success') {
                    loadHortInfo();
                    alert('Informationen gespeichert!');
                } else {
                    alert('Fehler: ' + (data.message || 'Unbekannter Fehler'));
                }
            });
        });
    }

    // Beim Laden: ausloggen und Modal zeigen
    setLoggedInState(false);

    // Login absenden
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role') ? document.getElementById('role').value : 'user';
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                loginModal.style.display = 'none';
                setLoggedInState(true, data.user.username, data.user.role);
                // Logout-Button einfügen, falls noch nicht vorhanden
                const userDisplay = document.getElementById('userDisplay');
                if (!document.getElementById('logoutBtn')) {
                  const logoutBtn = document.createElement('button');
                  logoutBtn.id = 'logoutBtn';
                  logoutBtn.textContent = 'Logout';
                  logoutBtn.style.marginLeft = '12px';
                  logoutBtn.onclick = function() {
                    setLoggedInState(false);
                  };
                  userDisplay.appendChild(logoutBtn);
                }
            } else {
                alert('Login fehlgeschlagen: ' + (data.message || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            alert('Fehler beim Login: ' + error);
        });
    });

    const form = document.getElementById('heimgehzettelForm');
    const submitBtn = document.getElementById('submitBtn');
    const confirmation = document.getElementById('confirmation');
    const resetBtn = document.getElementById('resetBtn');

    // Erfolgsmodal nach Registrierung schließen
    const registerSuccessModal = document.getElementById('registerSuccessModal');
    const closeRegisterSuccessModal = document.getElementById('closeRegisterSuccessModal');
    closeRegisterSuccessModal.addEventListener('click', function() {
        registerSuccessModal.style.display = 'none';
    });

    // Event-Listener für Formular-Submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Überprüfen der Sperrzeit (10:00 - 17:00 Uhr)
        const now = new Date();
        const currentHour = now.getHours();
        
        if (currentHour >= 15 && currentHour < 17) {
            alert('Das Formular kann nur außerhalb der Sperrzeit (10:00 - 17:00 Uhr) bearbeitet werden.');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gesendet...';
        
        try {
            // Formulardaten sammeln
            const formData = {
                email: form.email.value,
                childName: form.childName.value,
                class: form.class.value,
                aloneHome: form.aloneHome.value === 'sonstiges' ? form.aloneHomeOther.value : form.aloneHome.value,
                monday: form.monday.value === 'sonstiges' ? form.mondayOther.value : form.monday.value,
                tuesday: form.tuesday.value === 'sonstiges' ? form.tuesdayOther.value : form.tuesday.value,
                wednesday: form.wednesday.value === 'sonstiges' ? form.wednesdayOther.value : form.wednesday.value,
                thursday: form.thursday.value === 'sonstiges' ? form.thursdayOther.value : form.thursday.value,
                friday: form.friday.value === 'sonstiges' ? form.fridayOther.value : form.friday.value
            };
            
            // An Google Apps Script senden mit JSONP
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbwOwl66_7su5YbHeTOyt9uZg76pfWgQHlnJZW3l3lgTB7ciJcNoBJlTu-KNs9iq1dRpdw/exec';
            const params = new URLSearchParams();
            
            // Formulardaten zu den URL-Parametern hinzufügen
            Object.entries(formData).forEach(([key, value]) => {
                params.append(key, value);
            });
            
            // JSONP-Anfrage erstellen
            const script = document.createElement('script');
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            
            // Callback-Funktion für die Antwort
            window[callbackName] = function(data) {
                // Aufräumen
                delete window[callbackName];
                document.body.removeChild(script);
                
                if (data.result === "success") {
                    // Erfolgreiche Übermittlung
                    document.querySelector('.container').style.display = 'none';
                    confirmation.style.display = 'block';
                    form.reset();
                    // Autosave im localStorage löschen
                    localStorage.removeItem('formAutosave');
                    // Automatisch ausloggen
                    setLoggedInState(false);
                } else {
                    throw new Error(data.error || 'Unbekannter Fehler');
                }
            };
            
            // Fehlerbehandlung für Timeout
            const timeout = setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    throw new Error('Zeitüberschreitung bei der Serveranfrage');
                }
            }, 10000); // 10 Sekunden Timeout
            
            // Script-Tag erstellen und anhängen
            script.src = scriptUrl + '?callback=' + callbackName + '&' + params.toString();
            document.body.appendChild(script);
            
        } catch (error) {
            console.error('Fehler:', error);
            alert('Es ist ein Fehler aufgetreten: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Absenden';
        }
    });

    // Formular zurücksetzen
    resetBtn.addEventListener('click', function() {
        if (confirm('Möchten Sie das Formular wirklich zurücksetzen?')) {
            form.reset();
        }
    });

    // Automatisches Speichern alle 30 Sekunden
    setInterval(() => {
        if (form.checkValidity()) {
            const formData = new FormData(form);
            const formDataObj = Object.fromEntries(formData.entries());
            localStorage.setItem('formAutosave', JSON.stringify(formDataObj));
        }
    }, 30000);

    // Gespeicherte Daten laden
    const savedData = localStorage.getItem('formAutosave');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const element = form.elements[key];
                if (element) {
                    if (element.type === 'radio' || element.type === 'checkbox') {
                        if (element.value === data[key]) {
                            element.checked = true;
                        }
                    } else {
                        element.value = data[key];
                    }
                }
            });
        } catch (e) {
            console.error('Fehler beim Laden der gespeicherten Daten:', e);
        }
    }

    // Sonstiges-Felder für Montag bis Freitag anzeigen/ausblenden
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    days.forEach(function(day) {
        const select = form.elements[day];
        const otherInput = form.elements[day + 'Other'];
        if (select && otherInput) {
            select.addEventListener('change', function() {
                if (select.value === 'sonstiges') {
                    otherInput.style.display = '';
                    otherInput.required = true;
                } else {
                    otherInput.style.display = 'none';
                    otherInput.required = false;
                    otherInput.value = '';
                }
            });
            // Initialzustand setzen
            if (select.value === 'sonstiges') {
                otherInput.style.display = '';
                otherInput.required = true;
            } else {
                otherInput.style.display = 'none';
                otherInput.required = false;
            }
        }
    });
});
