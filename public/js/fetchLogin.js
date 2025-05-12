document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    let formData = new FormData(this);
    let data = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.data && result.data.token) {
                localStorage.setItem('token', result.data.token);
                window.location.href = '/profil';
            } else {
                document.getElementById('message').textContent = result.message || "Erreur de connexion";
            }
        })
        .catch(err => {
            document.getElementById('message').textContent = 'Erreur réseau';
            console.error(err);
        });
});
