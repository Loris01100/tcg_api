import { DataTypes } from 'sequelize';
import bdd from '../db.js';

const Enchere = bdd.define('Enchere', {
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    bid: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
});

export default Enchere;
