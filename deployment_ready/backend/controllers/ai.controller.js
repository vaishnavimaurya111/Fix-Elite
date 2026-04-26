const OpenAI = require('openai');

/**
 * @desc    Analyze problem description to estimate cost, urgency, and extract location
 * @route   POST /api/ai/estimate
 * @access  Private
 */
exports.analyzeProblem = async (req, res, next) => {
  try {
    const { problemDescription, serviceName } = req.body;

    if (!problemDescription) {
      return res.status(400).json({ success: false, message: 'Please provide a problem description' });
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback if no API key is provided for the hackathon
      console.warn("No OPENAI_API_KEY provided. Using fallback logic.");
      return res.status(200).json({
        success: true,
        data: {
          problemType: `${serviceName} Issue`,
          suggestedService: serviceName || "General Service",
          estimatedCost: "₹500 - ₹1500",
          urgency: problemDescription.toLowerCase().includes('urgent') || problemDescription.toLowerCase().includes('emergency') ? 'high' : 'medium',
          description: "This is a fallback AI estimate because the OPENAI_API_KEY is not set in the server/.env file. Please add the key to see real results.",
          tips: ["Add OPENAI_API_KEY to server/.env", "Restart the server"],
          extractedLocation: "Unknown Location (No API Key)"
        }
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
      You are an expert home services estimator. The user has described a problem related to the service: "${serviceName || 'Home Service'}".
      User's Problem Description: "${problemDescription}"
      
      Analyze the text and provide a JSON response with the following keys EXACTLY:
      - "problemType": A short 2-3 word category for the problem.
      - "suggestedService": The specific service they need.
      - "estimatedCost": A realistic estimated cost range in Indian Rupees (e.g., "₹500 - ₹1200").
      - "urgency": Must be one of exactly "low", "medium", or "high".
      - "description": A 1-2 sentence professional summary of what likely needs to be done.
      - "tips": An array of 2-3 short strings with immediate safety or preparation tips.
      - "extractedLocation": If the user mentions any location, address, area, or city in the description, extract it here. If they don't, return null.

      Return ONLY valid JSON. No markdown formatting.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content;
    let parsedData;
    
    try {
      // Remove any potential markdown wrapping like ```json
      const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("OpenAI JSON parsing error:", parseError);
      return res.status(500).json({ success: false, message: 'Failed to parse AI response' });
    }

    res.status(200).json({
      success: true,
      data: parsedData
    });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ success: false, message: 'Server error during AI analysis' });
  }
};
