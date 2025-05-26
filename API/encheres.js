import { User, Card, Collection, Enchere } from './Models/Association.js';

// req.body : { token, cardId }
export async function CreateEnchere(req, res) {
    const { token, cardId } = req.body;

    try {
        const user = await User.findOne({ where: { token } });
        if (!user) return res.status(401).json({ message: "Token invalide" });

        const card = await Card.findByPk(cardId);
        if (!card) return res.status(404).json({ message: "Carte introuvable" });

        const entry = await Collection.findOne({ where: { UserId: user.id, CardId: cardId } });
        if (!entry || entry.nb < 1)
            return res.status(400).json({ message: "Vous ne possédez pas cette carte" });

        //pour retirer la carte de la collection de l'utilisateur
        entry.nb -= 1;
        await entry.save();

        const endDate = new Date(Date.now() + 5 * 60 * 1000);

        const enchere = await Enchere.create({
            CardId: cardId,
            sellerId: user.id,
            end_date: endDate
        });

        res.status(201).json({ message: "Enchère créée", enchere });
    } catch (e) {
        console.error("Erreur création enchère :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

export async function PlaceBid(req, res) {
    const { token, enchereId, bid } = req.body;

    try {
        const user = await User.findOne({ where: { token } });
        const enchere = await Enchere.findByPk(enchereId, { include: ['seller', 'bidder', Card] });

        if (!user || !enchere) return res.status(404).json({ message: "Utilisateur ou enchère introuvable" });
        if (enchere.sellerId === user.id) return res.status(403).json({ message: "Vous ne pouvez pas enchérir sur votre propre enchère" });
        if (enchere.end_date < new Date()) return res.status(410).json({ message: "Enchère expirée" });
        if (bid <= enchere.bid) return res.status(400).json({ message: "Montant trop faible" });
        if (user.currency < bid) return res.status(402).json({ message: "Fonds insuffisants" });

        //pour rembourser l' ancien enchérisseur
        if (enchere.bidderId) {
            const prev = await User.findByPk(enchere.bidderId);
            prev.currency += enchere.bid;
            await prev.save();
        }

        //on enlève l'argent à l'enchérisseur le plus élevé
        user.currency -= bid;
        await user.save();

        enchere.bid = bid;
        enchere.bidderId = user.id;
        await enchere.save();

        res.status(200).json({ message: "Enchère placée" });
    } catch (e) {
        console.error("Erreur enchère :", e);
        res.status(500).json({ message: "Erreur côté serveur" });
    }
}

export async function GetEncheres(req, res) {
    try {
        const encheres = await Enchere.findAll({
            include: ['seller', 'bidder', Card]
        });

        res.status(200).json({ message: "Liste des enchères", encheres });
    } catch (e) {
        console.error("Erreur get enchères :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

export async function CloseEnchere(req, res) {
    const { token, enchereId } = req.body;

    try {
        const user = await User.findOne({ where: { token } });
        const enchere = await Enchere.findByPk(enchereId);

        if (!user || !enchere) return res.status(404).json({ message: "Introuvable" });
        if (enchere.end_date > new Date()) return res.status(400).json({ message: "Enchère non terminée" });
        if (user.id !== enchere.sellerId && user.id !== enchere.bidderId)
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à clôturer cette enchère" });

        //pour ajouter la carte obtenu au meilleur enchérisseur
        if (enchere.bidderId) {
            const entry = await Collection.findOrCreate({
                where: { UserId: enchere.bidderId, CardId: enchere.CardId },
                defaults: { nb: 1 }
            });
            if (!entry[1]) {
                entry[0].nb += 1;
                await entry[0].save();
            }

            //donner l'argent au vendeur
            const seller = await User.findByPk(enchere.sellerId);
            seller.currency += enchere.bid;
            await seller.save();
        } else {
            // Si aucun enchérisseur : restituer la carte au vendeur
            const entry = await Collection.findOrCreate({
                where: { UserId: enchere.sellerId, CardId: enchere.CardId },
                defaults: { nb: 1 }
            });
            if (!entry[1]) {
                entry[0].nb += 1;
                await entry[0].save();
            }
        }

        await enchere.destroy();
        res.status(200).json({ message: "Enchère clôturée" });
    } catch (e) {
        console.error("Erreur clôture :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}