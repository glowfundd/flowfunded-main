"use client";

import { Award, Download, CheckCircle2, Star } from "lucide-react";
import type { Challenge } from "@/types/database";
import { calcChallengeMetrics } from "@/lib/db";

interface CertificateCardProps {
  challenge: Challenge;
  userName: string;
}

function generateCertificate(challenge: Challenge, userName: string, phaseLabel: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 1200, 800);
  bg.addColorStop(0, "#050810");
  bg.addColorStop(0.5, "#0a0f20");
  bg.addColorStop(1, "#050810");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 800);

  // Border glow
  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 1152, 752);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, 1136, 736);

  // Corner accents
  const corners = [
    [24, 24], [1176, 24], [24, 776], [1176, 776],
  ] as const;
  corners.forEach(([x, y]) => {
    ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
    ctx.fillRect(x - 2, y - 2, 12, 2);
    ctx.fillRect(x - 2, y - 2, 2, 12);
  });

  // Glow orb
  const orb = ctx.createRadialGradient(600, 400, 0, 600, 400, 500);
  orb.addColorStop(0, "rgba(0, 240, 255, 0.04)");
  orb.addColorStop(1, "transparent");
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, 1200, 800);

  // FLOWFUNDED header
  ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
  ctx.font = "bold 18px Inter, Arial, sans-serif";
  ctx.letterSpacing = "8px";
  ctx.textAlign = "center";
  ctx.fillText("FLOWFUNDED", 600, 90);

  // Title
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 52px Inter, Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("CERTIFICATE OF ACHIEVEMENT", 600, 190);

  // Subtitle line
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "22px Inter, Arial, sans-serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("This certifies that", 600, 250);

  // Name
  const nameGrad = ctx.createLinearGradient(300, 0, 900, 0);
  nameGrad.addColorStop(0, "#00f0ff");
  nameGrad.addColorStop(1, "#6366f1");
  ctx.fillStyle = nameGrad;
  ctx.font = "bold 64px Inter, Arial, sans-serif";
  ctx.fillText(userName, 600, 340);

  // Description
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "20px Inter, Arial, sans-serif";
  ctx.fillText(`has successfully completed the`, 600, 400);

  // Phase badge
  ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
  const badgeW = 480;
  const badgeH = 72;
  const badgeX = 600 - badgeW / 2;
  const badgeY = 420;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 12);
  ctx.stroke();

  ctx.fillStyle = "#00f0ff";
  ctx.font = "bold 28px Inter, Arial, sans-serif";
  ctx.fillText(phaseLabel, 600, 463);

  // Account size
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "18px Inter, Arial, sans-serif";
  ctx.fillText(
    `$${challenge.account_size.toLocaleString()} Account  •  Phase ${challenge.phase} Evaluation`,
    600,
    530
  );

  // Date
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "16px Inter, Arial, sans-serif";
  ctx.fillText(
    `Issued ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    600,
    580
  );

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 620);
  ctx.lineTo(1000, 620);
  ctx.stroke();

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "14px Inter, Arial, sans-serif";
  ctx.fillText("flowfunded.com  •  Proprietary Trading Firm Evaluation", 600, 660);

  // Download
  const link = document.createElement("a");
  link.download = `flowfunded-certificate-phase${challenge.phase}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function CertificateCard({
  challenge,
  userName,
}: CertificateCardProps) {
  const { totalPnl, profitTargetAmt, isViolated } = calcChallengeMetrics(challenge);

  const phase2ProfitTarget = challenge.starting_balance * 0.05;
  const phase1Passed = totalPnl >= profitTargetAmt && !isViolated && challenge.phase > 1;
  const phase2Passed =
    challenge.phase >= 2 && totalPnl >= phase2ProfitTarget && !isViolated && challenge.phase > 2;
  const funded = challenge.phase === 3 && challenge.status === "funded";

  // Determine which certificate to show (highest achieved)
  const phaseLabel = funded
    ? "Funded Trader — Phase 3 Complete"
    : phase2Passed
    ? "Phase 2 Verification — Passed"
    : phase1Passed
    ? "Phase 1 Evaluation — Passed"
    : null;

  if (!phaseLabel) return null;

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-primary/5 p-6 glass-panel relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15 border border-yellow-500/30">
          <Award className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-white">Achievement Unlocked</h2>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-sm text-gray-400 mb-1">{phaseLabel}</p>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-400 font-semibold">
              ${challenge.account_size.toLocaleString()} account — all rules met
            </span>
          </div>
          <button
            onClick={() => generateCertificate(challenge, userName, phaseLabel)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition-all"
          >
            <Download className="h-4 w-4" />
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
