"use client";

import React, { useState } from "react";
import { ShieldCheck, HelpCircle, CheckCircle, XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const QUIZ_QUESTIONS = [
  {
    scenario: "You receive an SMS from 'PAYPAL-SEC' asking you to verify an urgent unauthorized transfer by clicking 'http://192.168.1.15/paypal-login'. What indicator makes this definitely malicious?",
    options: [
      "The message was sent during business hours.",
      "The URL uses a direct IP address and unencrypted HTTP instead of official https://paypal.com domain.",
      "The SMS contained your first name.",
      "It offered 24 hours to dispute the transfer.",
    ],
    correctIndex: 1,
    explanation: "Legitimate enterprise services never authenticate accounts through raw IP addresses or plain HTTP protocols. Module 02 (SIS Phishing Shield) automatically detects raw IP hosts as high-risk triggers.",
  },
  {
    scenario: "An Android application downloaded from an unofficial APK forum requests CAMERA, READ_CONTACTS, and RECORD_AUDIO to function as a flashlight app. What should you do?",
    options: [
      "Grant all permissions to ensure flashlight brightness.",
      "Deny the permissions and uninstall the application immediately.",
      "Turn off Wi-Fi and use the app normally.",
      "Clear app cache daily.",
    ],
    correctIndex: 1,
    explanation: "A utility like a flashlight has zero legitimate requirement for contacts, camera, or audio. SIS Endpoint Guardian flags apps requesting disproportionate privileged permissions.",
  },
  {
    scenario: "When connecting your laptop or mobile phone to an airport or coffee shop public Wi-Fi without a password, what is the primary risk?",
    options: [
      "Your battery will discharge twice as fast.",
      "Unencrypted network packets may be sniffed or subjected to rogue DNS redirection and ARP spoofing.",
      "Your phone screen will lock automatically.",
      "Bluetooth will be disabled by the airport.",
    ],
    correctIndex: 1,
    explanation: "Open Wi-Fi hotspots transmit data across open airwaves without link-layer encryption. Module 04 (SIS Network Sentinel) alerts you whenever your device joins an unencrypted network.",
  },
];

export default function AwarenessPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              SECURITY AWARENESS CENTER
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Interactive Threat Simulator
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Test your threat identification skills against realistic social engineering, phishing, and endpoint risk scenarios.
            </p>
          </div>

          {/* Interactive Quiz */}
          <div className="space-y-8">
            {QUIZ_QUESTIONS.map((q, qIdx) => {
              const selected = selectedAnswers[qIdx];
              const isAnswered = selected !== undefined;
              const isCorrect = selected === q.correctIndex;

              return (
                <div key={qIdx} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                    <HelpCircle className="h-4 w-4" />
                    SCENARIO #{qIdx + 1}
                  </div>
                  <p className="text-sm font-medium text-white">{q.scenario}</p>

                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selected === oIdx;
                      let btnStyle = "border-cyber-border bg-cyber-surface hover:border-slate-500 text-slate-300";

                      if (showResults) {
                        if (oIdx === q.correctIndex) {
                          btnStyle = "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-semibold";
                        } else if (isOptionSelected) {
                          btnStyle = "border-rose-500/60 bg-rose-500/10 text-rose-300";
                        }
                      } else if (isOptionSelected) {
                        btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold";
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelect(qIdx, oIdx)}
                          className={`w-full text-left rounded-xl border p-3 text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {showResults && oIdx === q.correctIndex && (
                            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                          )}
                          {showResults && isOptionSelected && oIdx !== q.correctIndex && (
                            <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="rounded-xl bg-slate-900 border border-cyber-border/80 p-3 text-xs text-slate-300 mt-2 space-y-1">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Analysis Breakdown:
                      </div>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="text-center pt-4">
              <button
                onClick={() => setShowResults(!showResults)}
                className="rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                {showResults ? "Reset Simulator" : "Check Threat Responses"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
