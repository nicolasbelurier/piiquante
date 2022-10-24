const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma de donnée pour un utilisateur(User)
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Plugin de validation Mongoose pour garantir l'unicité de l'email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);