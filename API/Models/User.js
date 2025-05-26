import { DataTypes } from 'sequelize';
import bdd from '../db.js';
//import sequelize from "../db.js";
//await sequelize.sync({ alter: true });
const User = bdd.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    token: {
        type: DataTypes.STRING
    },
    lastBooster: {
        type: DataTypes.BIGINT
    }
});

export default User;