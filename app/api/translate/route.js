// app/api/translate/route.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

// POST endpoint to call the IndicTrans2 translation service
router.post('/', async (req, res) => {
    const { text, targetLanguage } = req.body;

    // Validate the request body
    if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Both 'text' and 'targetLanguage' are required." });
    }

    try {
        // Send request to IndicTrans2 API running in the 'indictrans' service (e.g., localhost:8080)
        const response = await axios.post('http://localhost:8080/transliterate', {
            text: text,
            target_language: targetLanguage,
        });

        // Return the translation response from IndicTrans2 API
        res.json(response.data);
    } catch (error) {
        console.error("Error calling IndicTrans2:", error);
        res.status(500).json({ error: "An error occurred while calling the IndicTrans2 API." });
    }
});

module.exports = router;
