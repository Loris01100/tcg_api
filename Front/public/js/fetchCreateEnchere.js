document.addEventListener("DOMContentLoaded", () => {
    let token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    let selectCarte = document.getElementById("selectCarte");

    Promise.all([
        fetch(`http://localhost:3001/api/profil?token=${token}`).then(res => res.json()),
        fetch(`http://localhost:3001/api/cards`).then(res => res.json())
    ])
        .then(([userRes, cardsRes]) => {
            let collection = userRes.data.collection;
            let allCards = cardsRes.data;

            collection.forEach(entry => {
                let card = allCards.find(c => c.id === entry.id);
                if (card) {
                    let option = document.createElement("option");
                    option.value = card.id;
                    option.textContent = `${card.name} (${entry.nb}x - ${card.rarity})`;
                    selectCarte.appendChild(option);
                }
            });

            if (selectCarte.options.length === 0) {
                let option = document.createElement("option");
                option.textContent = "Aucune carte disponible";
                option.disabled = true;
                selectCarte.appendChild(option);
            }
        });

    document.getElementById("formulaireEnchere").addEventListener("submit", async (e) => {
        e.preventDefault();
        let cardId = parseInt(selectCarte.value);
        let res = await fetch("http://localhost:3001/enchere", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, cardId })
        });
        let data = await res.json();
        if (res.ok) {
            alert("Enchère créée !");
            window.location.href = "enchere.html";
        } else {
            alert("Erreur : " + data.message);
        }
    });
});
