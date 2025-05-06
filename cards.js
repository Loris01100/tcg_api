import fs from 'fs';
import path from 'path';

const cardsPath = path.resolve('data/cards.json');
const usersPath = path.resolve('data/users.json');

const rarityChances = {
    Common: 80,
    Rare: 15,
    Legendary: 5
};

function getRandomCardByRarity(cards) {
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(rarityChances)) {
        cumulative += chance;
        if (rand < cumulative) {
            const filtered = cards.filter(card => card.rarity === rarity);
            if (filtered.length > 0) {
                return filtered[Math.floor(Math.random() * filtered.length)];
            }
        }
    }

    // fallback
    return cards[Math.floor(Math.random() * cards.length)];
}

function OpenBooster(req, res) {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({ message: "Token manquant" });
    }

    fs.readFile(usersPath, 'utf8', (err, userData) => {
        if (err) return res.status(500).json({ message: "Erreur lecture utilisateurs" });

        let users;
        try {
            users = JSON.parse(userData);
        } catch {
            return res.status(500).json({ message: "Fichier utilisateurs corrompu" });
        }

        const userIndex = users.findIndex(u => u.token === token);
        if (userIndex === -1) {
            return res.status(401).json({ message: "Token invalide" });
        }

        const now = Date.now();
        const lastBooster = users[userIndex].lastBooster || 0;
        const delay = 5 * 60 * 1000; // 5 minutes en millisecondes

        if (now - lastBooster < delay) {
            const remaining = Math.ceil((delay - (now - lastBooster)) / 1000);
            return res.status(429).json({ message: `Veuillez attendre encore ${remaining} secondes avant d'ouvrir un nouveau booster.` });
        }

        fs.readFile(cardsPath, 'utf8', (err, cardData) => {
            if (err) return res.status(500).json({ message: "Erreur lecture cartes" });

            let cards;
            try {
                cards = JSON.parse(cardData);
            } catch {
                return res.status(500).json({ message: "Fichier cartes corrompu" });
            }

            const booster = [];
            for (let i = 0; i < 5; i++) {
                const card = getRandomCardByRarity(cards);
                booster.push(card);
                users[userIndex].collection.push(card);
            }

            users[userIndex].lastBooster = now;

            fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8', (err) => {
                if (err) {
                    return res.status(500).json({ message: "Erreur enregistrement collection" });
                }

                res.status(200).json({
                    message: "Booster ouvert avec succès",
                    booster
                });
            });
        });
    });
}

export { OpenBooster };
