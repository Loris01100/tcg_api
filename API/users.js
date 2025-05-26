import crypto from 'crypto';
import { User, Card, Collection } from './Models/Association.js';

//Assure l'enregistrement d'un utilisateur
export async function RegisterUser(req, res) {
    console.log("Headers Content-Type:", req.headers['content-type']);
    console.log("Corps de la requête (req.body) :", req.body);

    const { username, password } = req.body;

    try {
        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(409).send("Nom d'utilisateur déjà pris");
        }

        const newUser = await User.create({
            username,
            password,
            currency: 0,
            token: crypto.randomBytes(8).toString('hex'),
            lastBooster: Date.now()
        });

        console.log("Nouvel utilisateur enregistré :", newUser.username);

        if (req.headers.accept?.includes('text/html')) {
            res.redirect('/login.html');
        } else {
            res.status(201).json({
                message: "Utilisateur enregistré avec succès",
                user: { id: newUser.id, username: newUser.username }
            });
        }

    } catch (error) {
        console.error("Erreur enregistrement :", error);
        res.status(500).send("Erreur serveur");
    }
}



//assure la connexion d'un utilisateur
export async function Login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username, password } });

        if (!user) {
            return res.status(401).json({ message: "nom d'utilisateur ou mot de passe incorrect" });
        }

        const token = crypto.randomBytes(8).toString('hex');
        user.token = token;
        await user.save();

        res.status(200).json({
            message: "Authentification réussie",
            data: { token }
        });
    } catch (error) {
        console.error("Erreur de connexion :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}


//récupère un utilisateur grâce à son token
export async function GetUser(req, res) {
    let token = req.query.token || req.body?.token;

    try {
        let user = await User.findOne({
            where: { token },
            include: {
                model: Card,
                through: { attributes: ['nb'] }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        let collection = user.Cards.map(card => ({
            id: card.id,
            name: card.name,
            rarity: card.rarity,
            nb: card.Collection.nb
        }));

        res.status(200).json({
            message: "Utilisateur trouvé",
            data: {
                id: user.id,
                username: user.username,
                currency: user.currency,
                lastBooster: user.lastBooster,
                collection
            }
        });
    } catch (error) {
        console.error("Erreur GetUser :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

//assure la déconnexion d'un utilisateur
export async function DisconnectUser(req, res) {
    const token = req.body.token;

    try {
        const user = await User.findOne({ where: { token } });

        if (!user) {
            return res.status(404).json({ message: "l'utilisateur n'a pas été trouvé dans la base de données" });
        }

        user.token = null;
        await user.save();

        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        console.error("Erreur déconnexion :", error);
        res.status(500).json({ message: "Erreur côté serveur" });
    }
}