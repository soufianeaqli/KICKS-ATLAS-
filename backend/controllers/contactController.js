import Contact from '../models/Contact.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message envoyé avec succès', contact });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markReadContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllReadContact = async (req, res) => {
  try {
    await Contact.updateMany({ read: false }, { read: true });
    res.json({ message: 'Tous les messages marqués comme lus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
