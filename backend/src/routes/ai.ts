import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const AI_ENABLED = !!process.env.OPENAI_API_KEY

// ── POST /api/ai/transcribe ──
// Transcribe audio — returns mock if no API key
router.post('/transcribe', async (req: AuthRequest, res: Response) => {
  try {
    if (!AI_ENABLED) {
      // Mock transcript for development/demo
      return res.json({
        success: true,
        aiEnabled: false,
        transcript: "Doctor: Good morning. How are you feeling today?\nPatient: Doctor, I have headache and high BP since 2 days.\nDoctor: Let me check. BP is 142/90, slightly elevated. Are you taking your medications?\nPatient: Yes doctor, taking Metformin but sometimes missing evening dose.\nDoctor: Please take regularly. I will continue your current medications and add Pantoprazole for acidity. Come back in 30 days.",
        language: "en",
        message: "⚠️ AI not enabled — showing mock transcript. Add OPENAI_API_KEY to .env to enable real transcription."
      })
    }

    // Real Whisper transcription (when API key is added)
    const OpenAI = require('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const { audioBase64 } = req.body
    const buffer = Buffer.from(audioBase64, 'base64')
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: undefined // auto-detect
    })

    res.json({
      success: true,
      aiEnabled: true,
      transcript: transcription.text,
      language: transcription.language
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ── POST /api/ai/extract ──
// Extract clinical data from transcript
router.post('/extract', async (req: AuthRequest, res: Response) => {
  try {
    const { transcript } = req.body

    if (!AI_ENABLED) {
      // Mock extraction for development
      return res.json({
        success: true,
        aiEnabled: false,
        data: {
          chiefComplaint: "Headache and elevated blood pressure",
          complaintDays: 2,
          diagnosis: "Hypertension Stage 1 — stress-induced",
          icd10Code: "I10",
          medications: [
            { name: "Metformin 500mg", timing: "After food", dose: "1-0-1", days: 30 },
            { name: "Amlodipine 5mg", timing: "After food", dose: "1-0-0", days: 30 },
            { name: "Pantoprazole 40mg", timing: "Before food", dose: "1-0-0", days: 14 }
          ],
          dietInstructions: "Low sodium diet. Avoid processed foods. Include green vegetables and fruits.",
          exercise: "Walk 30 minutes daily. Yoga for stress management.",
          advice: "Monitor BP daily. Take medications consistently. Reduce work stress.",
          nextVisitDays: 30,
          nextVisitUnit: "Days",
          nextVisitNotes: "Review BP readings and HbA1c results",
          investigations: ["HbA1c", "Renal Function Test", "Lipid Profile"]
        },
        message: "⚠️ AI not enabled — showing mock extraction. Add OPENAI_API_KEY to .env to enable."
      })
    }

    // Real GPT-4o extraction
    const OpenAI = require('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = `You are a clinical AI assistant. Extract structured medical data from this doctor-patient conversation transcript.

TRANSCRIPT:
${transcript}

Return ONLY valid JSON with this exact structure:
{
  "chiefComplaint": "string",
  "complaintDays": number,
  "diagnosis": "string",
  "icd10Code": "string",
  "medications": [{"name": "string", "timing": "string", "dose": "string", "days": number}],
  "dietInstructions": "string",
  "exercise": "string",
  "advice": "string",
  "nextVisitDays": number,
  "nextVisitUnit": "Days|Weeks|Months",
  "nextVisitNotes": "string",
  "investigations": ["string"]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const data = JSON.parse(response.choices[0].message.content || '{}')
    res.json({ success: true, aiEnabled: true, data })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ── GET /api/ai/status ──
router.get('/status', (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    features: {
      transcription: AI_ENABLED,
      extraction: AI_ENABLED,
      whatsapp: !!process.env.WATI_API_KEY,
      calendar: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    },
    message: AI_ENABLED
      ? '✅ AI features enabled'
      : '⚠️ AI features disabled — add OPENAI_API_KEY to .env to enable'
  })
})

export default router
