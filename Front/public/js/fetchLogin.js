document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();

    let form = new FormData(e.target);
    let data = {
        username: form.get('username'),
        password: form.get('password')
    };

    fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

        .then(async res => {
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message || "Erreur inconnue");
            }

            if (result.data?.token) {
                localStorage.setItem('token', result.data.token);
                window.location.href = 'profil.html';
            } else {
                document.getElementById('message').textContent = "Token non reçu";
            }
        })
        .catch(err => {
            document.getElementById('message').textContent = "Erreur : " + err.message;
            console.error("Erreur de login :", err);
        });
});
