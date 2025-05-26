import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('tcgapi', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion réussie à MySQL via Sequelize');
    } catch (error) {
        console.error('Erreur de connexion :', error);
    }
})();

export default sequelize;
