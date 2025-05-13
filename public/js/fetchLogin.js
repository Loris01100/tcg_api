document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();

    let form = new FormData(e.target);
    let data = {
        username: form.get('username'),
        password: form.get('password')
    };

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {
            if (result.data?.token) {
                localStorage.setItem('token', result.data.token);
                window.location.href = '/profil';
            }
        });
});
