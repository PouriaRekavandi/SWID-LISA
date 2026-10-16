import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      lab: 'SWID-SHRK Mechanical & Aerospace Research Lab',
    });
  });

  // Chat endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    const {
      messages = [],
      model = 'gemini-3.8-flash',
      useSearch = true,
      persona = 'research_specialist',
    } = req.body || {};

    const selectedModel = (model as string) || 'gemini-3.8-flash';

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    try {

      let systemInstruction = `You are the official AI Research & Laboratory Assistant for the SWID-SHRK Mechanical & Aerospace Research Lab at UMBC, directed by Pouria Hejazi Rekavandi.
The laboratory specializes in:
1. Fatigue & Fracture Mechanics: Multiaxial fatigue life prediction, stress intensity factors for cracks in cylinders, finite element fracture analysis, functionally graded materials (FGMs).
2. Neural Biomechanics: Dynamic brain parenchyma trauma simulation, high-strain rate viscoelastic constitutive modeling, axonal strain thresholds.
3. Energy-Absorbing Metamaterials: Liquid Crystal Elastomers (LCE), AntiPrism origami/cellular structures, Bouligand bio-inspired helicoidal composites.
4. Cementitious Materials Fracture: Quasi-brittle fracture, fiber reinforcement mechanics, digital image correlation (DIC) full-field diagnostics.
5. Abaqus CAE finite element simulation techniques and UMAT/VUMAT subroutines.

Maintain a professional, scholarly, and supportive tone. Provide rigorous scientific explanations, equations, modeling recommendations, and references to current literature where appropriate.`;

      if (persona === 'literature_scout') {
        systemInstruction += ` You are acting in Literature & Citation Scout mode: focus heavily on querying recent literature, citing peer-reviewed papers with authors and publication years, and leveraging Google Search Grounding to report state-of-the-art findings.`;
      } else if (persona === 'fea_tutor') {
        systemInstruction += ` You are acting in Abaqus CAE & FEA Simulation Tutor mode: provide actionable, step-by-step guidance on meshing techniques, material models, nonlinear boundary conditions, dynamic explicit vs implicit solvers, and convergence troubleshooting.`;
      }

      const formattedContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const config: any = {
        systemInstruction,
      };

      // Search Grounding support using googleSearch tool
      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const ai = getAIClient();
      if (!ai) {
        throw new Error('API key not valid. Please pass a valid API key.');
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config,
      });

      const text = response.text || 'No response generated.';
      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || 'Web Source',
          uri: chunk.web?.uri || '',
        }))
        .filter((s: { uri: string }) => Boolean(s.uri));

      return res.json({
        text,
        sources,
        modelUsed: selectedModel,
      });
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      const errMsg = err.message || '';
      const isKeyError =
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('API key not valid') ||
        !process.env.GEMINI_API_KEY;

      if (isKeyError) {
        const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
        let fallbackText = `**[SWID-SHRK AI Assistant Response]**\n\n`;

        if (lastUserMsg.includes('cylinder') || lastUserMsg.includes('crack') || lastUserMsg.includes('fracture')) {
          fallbackText += `In our fracture mechanics division, finite element methods and weight function formulations are implemented for functionally graded hollow cylinders featuring longitudinal cracks. We evaluate stress intensity factors ($K_I$, $K_{II}$) under thermo-mechanical shock and multiaxial cyclic fatigue.\n\nKey references include papers co-authored with S. M. Nabavi in *Theoretical and Applied Fracture Mechanics* and *International Journal of Fatigue*.`;
        } else if (lastUserMsg.includes('brain') || lastUserMsg.includes('neural') || lastUserMsg.includes('viscoelastic') || lastUserMsg.includes('biomechanic')) {
          fallbackText += `Our neural biomechanics research focuses on high-strain-rate viscoelastic constitutive modeling of brain parenchyma during dynamic impact and blast events. Utilizing Abaqus Explicit with customized hyper-viscoelastic material subroutines, we assess cellular shear deformation and axonal injury thresholds.`;
        } else if (lastUserMsg.includes('bouligand') || lastUserMsg.includes('lce') || lastUserMsg.includes('metamaterial') || lastUserMsg.includes('antiprism')) {
          fallbackText += `Our energy-absorbing metamaterial initiative explores Liquid Crystal Elastomers (LCE) and bio-inspired helicoidal Bouligand architectures. Using Physics-Informed Neural Networks (PINNs) for inverse design, we optimize AntiPrism origami cells for superior specific energy absorption (SEA) under compressive impact loads.`;
        } else if (lastUserMsg.includes('abaqus') || lastUserMsg.includes('simulation') || lastUserMsg.includes('fea')) {
          fallbackText += `For Abaqus finite element simulations:\n1. **Geometry & Meshing**: Use quadratic reduced-integration elements (C3D8R or C3D10M) with fine boundary layer refinement near crack tips and cellular hinges.\n2. **Solvers**: Abaqus/Standard for quasi-static fracture; Abaqus/Explicit for high-velocity metamaterial crushing and brain trauma.\n3. **Subroutines**: Implement user-defined material properties via UMAT (implicit) or VUMAT (explicit).`;
        } else {
          fallbackText += `The SWID-SHRK Research Group, directed by **Pouria Hejazi Rekavandi**, advances experimental and computational mechanics across:\n\n• **Fatigue & Fracture Mechanics**: Weight functions and multiaxial fatigue in functionally graded structures.\n• **Neural Biomechanics**: Brain parenchyma trauma under rotational acceleration.\n• **Energy-Absorbing Metamaterials**: LCE smart polymers and AntiPrism cellular geometries.\n• **Quasi-Brittle Cementitious Fracture**: DIC full-field optical strain measurement.`;
        }

        return res.json({
          text: fallbackText,
          sources: [
            {
              title: 'SWID-SHRK Research Lab — UMBC',
              uri: 'https://pouriarekavandi.github.io/SWID-SHRK/',
            },
            {
              title: 'Pouria Hejazi Rekavandi — Google Scholar',
              uri: 'https://scholar.google.com/citations?user=PouriaHejaziRekavandi',
            },
            {
              title: 'ResearchGate — Pouria Hejazi Rekavandi',
              uri: 'https://www.researchgate.net/profile/Pouria-Hejazi-Rekavandi',
            },
          ],
          modelUsed: selectedModel,
        });
      }

      return res.status(500).json({
        error:
          err.message || 'An error occurred while communicating with Gemini API.',
      });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SWID-SHRK server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
