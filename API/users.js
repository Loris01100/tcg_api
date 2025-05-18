import fs from 'fs';
import crypto from 'crypto';

const filePath = 'data/users.json';

//Assure l'enregistrement d'un utilisateur
function RegisterUser(req, res) {
   let { username, password } = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {


        let users = [];
        if (data) {
            users = JSON.parse(data);
        }



        //création d'un nouvel utilisateur
        let nouvUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            username,
            password,
            collection: []
        };

        users.push(nouvUser);

        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
                res.status(201).json({
                message: "Utilisateur enregistré avec succès",
                user: { id: nouvUser.id, username: nouvUser.username }
            });
        });
    });
}


//assure la connexion d'un utilisateur
function Login(req, res) {
    const { username, password } = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {

        if (err) {
            console.error("Erreur lecture fichier :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        let users = [];
        users = JSON.parse(data || '[]');

        let userIndex = users.findIndex(u => u.username === username && u.password === password);
        if (userIndex === -1) {
            return res.status(401).json({
                message: "Nom d'utilisateur ou mot de passe incorrect"
            });
        }

        let token = crypto.randomBytes(8).toString('hex');
        users[userIndex].token = token;

        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                console.error("Erreur écriture fichier :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            console.log("Connexion réussie pour :", username);
            return res.status(200).json({
                message: "Authentification réussie",
                data: { token }
            });
        });
    });
}


//récupère un utilisateur grâce à son token
function GetUser(req, res) {

    const token =
        req.query.token ||
        req.body?.token;

    fs.readFile(filePath, 'utf8', (err, data) => {

        let users = [];
        users = JSON.parse(data || '[]');

        let token;
        token =
            req.query.token ||
            req.body?.token;

        let user = users.find(u => u.token === token);

        let { password, token: _, ...userCorr } = user;

        res.status(200).json({
            message: "Utilisateur trouvé",
            data: userCorr
        });
    });

}

//assure la déconnexion d'un utilisateur
function DisconnectUser(req, res) {
    const token = req.body.token;

    fs.readFile(filePath, 'utf8', (err, data) => {

        let users = [];
        users = JSON.parse(data || '[]');

        const userIndex = users.findIndex(u => u.token === token);

        delete users[userIndex].token;

        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {

            res.status(200).json({ message: "Déconnexion réussie" });
        });
    });
}

export { RegisterUser, Login, GetUser, DisconnectUser };
