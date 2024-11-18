const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/users");
const Discussion = require("../models/discussion");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER,
  useTLS: true,
});

// Envoyer un nouveau message dans une discussion
router.post("/discussions/:discussionId/messages", async (req, res) => {
  const { discussionId } = req.params;
  const { token, text } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(401)
        .json({ result: false, error: "Utilisateur non authentifié" });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res
        .status(404)
        .json({ result: false, error: "Discussion non trouvée" });
    }

    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      author: user._id.toString(),
      message: text,
      date: new Date(),
      status: "sent",
    };

    discussion.message.push(newMessage);
    await discussion.save();

    // Déclencher l'événement Pusher
    pusher.trigger(`discussion-${discussionId}`, "new-message", {
      message: newMessage,
    });

    res.json({
      result: true,
      message: "Message envoyé avec succès",
      discussion,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du message:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

// Créer une nouvelle discussion ou récupérer une existante entre deux utilisateurs.
router.post("/discussions/create/:otherUserId", async (req, res) => {
  const { otherUserId } = req.params;
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(401)
        .json({ result: false, error: "Utilisateur non authentifié" });
    }

    let discussion = await Discussion.findOne({
      $or: [
        { user_1: user._id, user_2: otherUserId },
        { user_1: otherUserId, user_2: user._id },
      ],
    });

    if (!discussion) {
      discussion = new Discussion({
        user_1: user._id,
        user_2: otherUserId,
        message: [],
      });
      await discussion.save();
    }

    res.json({ result: true, discussionId: discussion._id });
  } catch (error) {
    console.error(
      "Erreur lors de la création/récupération de la discussion:",
      error
    );
    res.status(500).json({ result: false, error: error.message });
  }
});

// Récupérer toutes les discussions d'un utilisateur
router.get("/discussions", async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(401)
        .json({ result: false, error: "Utilisateur non authentifié" });
    }

    const discussions = await Discussion.find({
      $or: [{ user_1: user._id }, { user_2: user._id }],
    })
      .populate("user_1", "firstname lastname job business profile_picture")
      .populate("user_2", "firstname lastname job business profile_picture")
      .sort({ updatedAt: -1 });

    console.log(
      "Discussions trouvées pour l'utilisateur:",
      user._id,
      discussions
    );
    res.json({ result: true, data: { discussions } });
  } catch (error) {
    console.error("Erreur lors de la récupération des discussions:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

// Récupérer les discussions d'un utilisateur
router.get("/messages/:token", (req, res) => {
  const token = req.params.token;
  User.findOne({ token: token })
    .populate("discussion")
    .then((data) => {
      res.json({ result: true, data });
    });
});

// Récupérer tous les messages d'une discussion spécifique.
router.get("/discussions/:discussionId/messages", async (req, res) => {
  const { discussionId } = req.params;

  try {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res
        .status(404)
        .json({ result: false, error: "Discussion not found" });
    }
    res.json({ result: true, discussion });
  } catch (error) {
    console.error("Error fetching discussion:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
