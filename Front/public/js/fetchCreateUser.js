document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3001/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert(" Compte créé avec succès !");
            window.location.href = "login.html";
        } else {
            alert(`${data.message || "Erreur lors de l'inscription."}`);
        }
    } catch (err) {
        console.error("Erreur requête /register :", err);
        alert(" Erreur réseau ou serveur.");
    }
});
