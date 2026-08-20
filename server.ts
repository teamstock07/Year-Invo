import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { handlePaddleWebhook } from "./server/paddleWebhook";
import {
  handleCreateInvitation,
  handleResendInvitation,
  handleRevokeInvitation,
  handleGetInvitationDetails,
  handleAcceptInvitation,
  handleListInvitations,
} from "./server/invitationApi";
import {
  handleSendVerificationOtp,
  handleVerifyOtp,
  handleCheckVerificationStatus,
} from "./server/emailVerificationApi";
import {
  handleGetSubscriptionStatus,
  handleValidateSubscriptionAction,
  getAuthoritativeSubscription,
} from "./server/subscriptionServer";
import {
  handleOwnerListUsers,
  handleOwnerUpdateUserPlan,
  handleOwnerApproveSubscription,
  handleOwnerRejectSubscription,
  handleOwnerUpdateUserRole,
} from "./server/ownerApi";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configure Express to capture raw body for HMAC signature verification
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Paddle Billing Server-side Webhook Endpoint
app.post("/api/paddle/webhook", handlePaddleWebhook);

// Team Member Email Invitation API Endpoints (Powered by Resend)
app.post("/api/team/invite", handleCreateInvitation);
app.post("/api/team/resend-invite", handleResendInvitation);
app.post("/api/team/revoke-invite", handleRevokeInvitation);
app.get("/api/team/invitation-details", handleGetInvitationDetails);
app.post("/api/team/accept-invite", handleAcceptInvitation);
app.get("/api/team/invitations", handleListInvitations);

// Email Verification 6-Digit OTP Endpoints (Powered by Resend)
app.post("/api/auth/send-verification-otp", handleSendVerificationOtp);
app.post("/api/auth/verify-otp", handleVerifyOtp);
app.post("/api/auth/check-verification-status", handleCheckVerificationStatus);

// Authoritative Subscription & Limits Endpoints
app.get("/api/subscription/status", handleGetSubscriptionStatus);
app.post("/api/subscription/status", handleGetSubscriptionStatus);
app.post("/api/subscription/validate-action", handleValidateSubscriptionAction);

// Server-Authoritative Platform Owner Endpoints (Strictly Protected)
app.post("/api/owner/users", handleOwnerListUsers);
app.post("/api/owner/update-user-plan", handleOwnerUpdateUserPlan);
app.post("/api/owner/approve-subscription", handleOwnerApproveSubscription);
app.post("/api/owner/reject-subscription", handleOwnerRejectSubscription);
app.post("/api/owner/update-user-role", handleOwnerUpdateUserRole);

// Gemini AI Insights Endpoint (Protected by Pro/Premium Plan)
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { businessData, queryType, language, userId } = req.body;

    // Backend validation of subscription for AI Insights
    if (userId) {
      try {
        const sub = await getAuthoritativeSubscription(userId);
        if (!sub.limits.isAiInsightsAllowed) {
          return res.status(403).json({
            error: "AI Business Insights is a Pro/Premium feature. Please upgrade your subscription to access AI intelligence.",
            code: "AI_INSIGHTS_LOCKED",
            requiredPlan: "Pro",
          });
        }
      } catch (subErr) {
        console.warn("[AI Insights API] Subscription verification notice:", subErr);
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "Gemini API key is missing. Please configure GEMINI_API_KEY in Secrets.",
      });
    }

    const isBengali = language === "bn";

    let prompt = "";
    if (queryType === "sales_prediction") {
      prompt = `Act as an expert AI Business Intelligence Analyst for a SaaS POS & Inventory system. 
Analyze the provided sales & inventory data:
${JSON.stringify(businessData, null, 2)}

Provide a concise, highly actionable sales prediction, demand forecast, and stock reorder recommendations for the next 30 days.
Language: ${isBengali ? "Bengali (বাংলা)" : "English"}.
Format as clean Markdown with bullet points and bold highlights. Keep it practical for a small to medium business owner.`;
    } else if (queryType === "expense_analysis") {
      prompt = `Act as an expert AI Financial Advisor for a retail business.
Analyze the expense and sales figures:
${JSON.stringify(businessData, null, 2)}

Identify cost-saving opportunities, unusual expense patterns, and profit optimization suggestions.
Language: ${isBengali ? "Bengali (বাংলা)" : "English"}.
Format as clean Markdown with bullet points.`;
    } else {
      prompt = `Act as an expert AI Business Strategy Advisor.
Analyze this overall business summary:
${JSON.stringify(businessData, null, 2)}

Provide 3 key business growth insights, 2 risk warnings (e.g. low stock or high due amounts), and 3 profit improvement ideas.
Language: ${isBengali ? "Bengali (বাংলা)" : "English"}.
Format as clean Markdown with bullet points.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI business insights.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
