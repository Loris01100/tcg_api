import { User, Card, Collection } from './Models/Association.js';

//récupère une carte aléatoire par rapport à la rareté obtenu
function getRandomCardByRarity(cards, rarity) {
    let filtered = cards.filter(card => card.rarity === rarity);
    if (filtered.length === 0) return null;
    let index = Math.floor(Math.random() * filtered.length);
    return filtered[index];
}

//selon le tirage on roll la rareté de la carte
function tirageAleatoireRarity() {
    let rand = Math.random() * 151;
    if (rand < 5) return 'legendary';
    else if (rand < 15) return 'rare';
    else return 'common';
}

//fonction pour ouvrir un booster, async car base de données,
export async function OpenBooster(req, res) {
    let { token } = req.body;

    try {
        let user = await User.findOne({ where: { token } });
        if (!user) return res.status(401).json({ message: "Token invalide" });

        let now = Date.now();
        let delay =  5 * 60 * 1000; //à remodifier pour mettre 5 minutes
        if (now - user.lastBooster < delay) {
            let restant = Math.ceil((delay - (now - user.lastBooster)) / 1000);
            return res.status(429).json({ message: `Il reste encore ${restant}s` });
        }

        let allCards = await Card.findAll();
        let booster = [];

        for (let i = 0; i < 5; i++) {
            let rarity = tirageAleatoireRarity();
            let card = getRandomCardByRarity(allCards, rarity);
            if (card) booster.push(card);
        }

        for (let card of booster) {
            let [entry, created] = await Collection.findOrCreate({
                where: { UserId: user.id, CardId: card.id },
                defaults: { nb: 1 }
            });

            if (!created) {
                entry.nb += 1;
                await entry.save();
            }
        }

        user.lastBooster = now;
        await user.save();

        res.status(200).json({
            message: "Ouverture du booster valide",
            booster
        });

    } catch (err) {
        console.error("Erreur booster :", err);
        res.status(500).json({ message: "Erreur côté serveur" });
    }
}

//fonction pour récupérer toutes les cartes et les afficher dans la page carte.html
export async function GetAllCards(req, res) {
    try {
        let cards = await Card.findAll();

        //si l'utilisateur n'a aucune carte
        if (!cards || cards.length === 0) {
            return res.status(404).json({
                message: "Aucune carte trouvée"
            });
        }

        //requête réussie
        res.status(200).json({
            message: "Cartes disponibles",
            data: cards
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des cartes :", err);

        //erreur serveur
        res.status(500).json({
            message: "Erreur serveur interne"
        });
    }
}

//fonction pour convertir une carte en argent
export async function ConvertCards(req, res) {
    let { token, cardId } = req.body;

    try {
        let user = await User.findOne({ where: { token } });
        if (!user) return res.status(401).json({ message: "Token invalide" });

        let card = await Card.findByPk(cardId);
        if (!card) return res.status(404).json({ message: "Carte introuvable" });

        let entry = await Collection.findOne({
            where: { UserId: user.id, CardId: card.id }
        });

        if (!entry || entry.nb < 2) {
            return res.status(400).json({ message: "Cette carte ne peut pas être convertie" });
        }

        //le coût d'une carte en fonction de sa rareté
        const gain = {
            common: 5,
            rare: 25,
            legendary: 150
        };

        entry.nb -= 1;
        await entry.save();

        user.currency += gain[card.rarity] || 0;
        await user.save();

        res.status(200).json({
            message: "Carte convertie avec succès",
            currency: user.currency
        });

    } catch (err) {
        console.error("Erreur ConvertCards :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

