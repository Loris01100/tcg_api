import express from 'express';
import { RegisterUser, Login, GetUser, DisconnectUser } from './users.js';
import { OpenBooster } from './cards.js';



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: "Bienvenue sur l'API TCG",
        data: {}
    });
});

//route connexion
app.post('/register', RegisterUser);

app.post('/login', Login);

app.get('/user', GetUser);

app.post('/disconnect', DisconnectUser);

//route carte
app.post('/booster', OpenBooster);

app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
