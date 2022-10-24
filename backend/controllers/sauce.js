const Sauce = require('../models/sauce');
const fs = require('fs');

// Création d'une sauce par un utilisateur
exports.createSauce = (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(req.file);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce saved.' }))
        .catch(error => res.status(400).json({ error }));
};

// Renvoi toutes les sauces présentent dans la base de données
exports.getAllSauce = (req, res) => {
    Sauce.find()
        .then(sauces => {
            res.status(200).json(sauces);
        })
        .catch(error => {
            res.status(404).json({ error })
        });
};

// Renvoi une sauce présente dans la base de donnée selon l'ID de la sauce
exports.getOneSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            res.status(200).json(sauce);
        })
        .catch(error => res.status(404).json({ error }));
};

// Modification de la sauce
exports.updateSauce = (req, res) => {

    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body }

    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
        .then(res.status(200).json({ message: "Sauce modified." }))
        .catch((error) => res.status(400).json({ error }))
};

// Suppression d'une sauce
exports.deleteSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {

            const fileName = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileName}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce deleted." }))
                    .catch((error) => res.status(400).json({ error }));
            });

        })
        .catch((error) => res.status(400).json({ error }))
};

// Gestion des likes
exports.likeSauce = (req, res) => {
    const userId = req.body.userId;
    const sauceId = req.params.id;
    const likeState = req.body.like;

    switch (likeState) {
        // Si like=1 on incrémente l'attribut likes de la sauce et on ajoute l'id de l'utilisateur dans le tableau usersLiked
        case 1:
            Sauce.updateOne({ _id: sauceId }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
                .then(() => res.status(200).json({ message: "Sauce liked." }))
                .catch((error) => res.status(400).json({ error }));
            break;
            // Si like=0 alors on check les deux tableaux usersLiked et usersDisliked et on màj les attributs likes et dislikes ainsi que les tableaux eux mêmes selon la présence de l'userId dans l'un des deux
        case 0:
            // Retourne le tableau correspondant a sauceId
            Sauce.findOne({ _id: sauceId })
                .then(sauce => {
                    if (sauce.usersLiked.includes(userId)) {
                        // Décrémente l'attribut likes de la sauce et supprime l'userId du tableau usersLiked
                        Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
                            .then(() => res.status(200).json({ message: "Sauce unliked." }))
                            .catch(error => res.status(400).json({ error }));
                    } else if (sauce.usersDisliked.includes(userId)) {
                        // Décrémente l'attribut dislikes de la sauce et supprime l'userId du tableau usersDisliked
                        Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
                            .then(() => res.status(200).json({ message: "Sauce undisliked." }))
                            .catch(error => res.status(400).json({ error }));
                    }
                })
                .catch(error => res.status(400).json({ error }));
            break;
            // Si like=-1 on incrémente l'attribut dislikes de la sauce et on ajoute l'id de l'utilisateur dans le tableau usersDisliked
        case -1:
            Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
                .then(() => res.status(200).json({ message: "Sauce disliked." }))
                .catch((error) => res.status(400).json({ error }));
            break;
    }
}