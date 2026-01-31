// controllers/healthBotController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatHistory from '../Models/HealthBot.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instruction for health bot
const SYSTEM_INSTRUCTION = `You are CurDocs AI Health Assistant - a helpful, empathetic health information bot.

CRITICAL RULES:
1. NEVER diagnose medical conditions - you provide general health information only
2. Always recommend consulting healthcare professionals for medical concerns
3. If you detect emergency symptoms (chest pain, difficulty breathing, severe bleeding, signs of stroke, severe allergic reactions), immediately advise calling emergency services
4. Be empathetic, supportive, and professional
5. Provide evidence-based general health information
6. Ask clarifying questions when needed
7. Keep responses concise but informative (2-3 paragraphs max)
8. Always end responses with: "Remember to consult a healthcare professional for personalized medical advice."

EMERGENCY KEYWORDS to watch for: chest pain, can't breathe, severe bleeding, stroke symptoms, heart attack, unconscious, suicide thoughts, severe allergic reaction

You are NOT a replacement for medical professionals. You assist with general health information and guidance.`;

// Emergency keywords list
const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  'can\'t breathe',
  'difficulty breathing',
  'severe bleeding',
  'stroke',
  'unconscious',
  'suicide',
  'kill myself',
  'severe allergic',
  'anaphylaxis',
  'choking'
];

// Check for emergency symptoms
const checkEmergency = (message) => {
  const lowerMessage = message.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

// Send message to health bot
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check for emergency
    const isEmergency = checkEmergency(message);
    
    if (isEmergency) {
      return res.status(200).json({
        success: true,
        isEmergency: true,
        emergencyMessage: '🚨 EMERGENCY ALERT: Based on your message, you may be experiencing a medical emergency. Please call emergency services immediately (911 or your local emergency number) or go to the nearest emergency room. Do not wait for online assistance.',
        data: {
          userMessage: message,
          botResponse: 'I\'ve detected potential emergency symptoms in your message. Please seek immediate medical attention by calling emergency services or going to the nearest emergency room. Your safety is the top priority.',
          disclaimer: 'This is an automated emergency detection. When in doubt, always seek immediate medical care.'
        }
      });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId,
        messages: []
      });
    }

    // Prepare chat history for Gemini (last 10 messages for context)
    const recentMessages = chatHistory.messages.slice(-10);
    const history = recentMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = result.response;
    const botReply = response.text();

    // Save messages to database
    chatHistory.messages.push(
      {
        role: 'user',
        content: message,
        timestamp: new Date()
      },
      {
        role: 'bot',
        content: botReply,
        timestamp: new Date()
      }
    );

    await chatHistory.save();

    // Return response
    return res.status(200).json({
      success: true,
      isEmergency: false,
      data: {
        userMessage: message,
        botResponse: botReply,
        timestamp: new Date(),
        disclaimer: '⚠️ This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a healthcare provider for medical concerns.'
      }
    });

  } catch (error) {
    console.error('Health Bot Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get response from health bot. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const chatHistory = await ChatHistory.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('messages createdAt sessionId');

    if (!chatHistory || chatHistory.messages.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          messages: [],
          totalMessages: 0
        }
      });
    }

    // Return limited messages (most recent first)
    const messages = chatHistory.messages.slice(-limit);

    return res.status(200).json({
      success: true,
      data: {
        messages: messages,
        totalMessages: chatHistory.messages.length,
        sessionId: chatHistory.sessionId,
        createdAt: chatHistory.createdAt
      }
    });

  } catch (error) {
    console.error('Get Chat History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Clear chat history (start new session)
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await ChatHistory.findOneAndDelete({ userId });

    return res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully. Starting fresh session.'
    });

  } catch (error) {
    console.error('Clear Chat History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chatHistory = await ChatHistory.findOne({ userId });

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: {
          totalMessages: 0,
          totalUserMessages: 0,
          totalBotMessages: 0,
          firstMessageDate: null,
          lastMessageDate: null
        }
      });
    }

    const userMessages = chatHistory.messages.filter(m => m.role === 'user');
    const botMessages = chatHistory.messages.filter(m => m.role === 'bot');

    return res.status(200).json({
      success: true,
      data: {
        totalMessages: chatHistory.messages.length,
        totalUserMessages: userMessages.length,
        totalBotMessages: botMessages.length,
        firstMessageDate: chatHistory.messages[0]?.timestamp,
        lastMessageDate: chatHistory.messages[chatHistory.messages.length - 1]?.timestamp,
        sessionStarted: chatHistory.createdAt
      }
    });

  } catch (error) {
    console.error('Get Chat Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};