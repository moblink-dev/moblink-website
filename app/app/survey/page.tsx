"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "../../../components/app/BottomNav";

const surveyQuestions = [
  {
    id: "q1",
    question: "What is the most important issue facing you and your community right now?",
    type: "choice",
    options: [
      "Housing and accommodation",
      "Health and wellbeing",
      "Legal and justice",
      "Employment and training",
      "Education and youth",
      "Family and community",
      "Culture and connection",
      "Financial support",
      "Transport",
      "Something else",
    ],
  },
  {
    id: "q2",
    question: "How would you rate your current access to services and support?",
    type: "scale",
    options: ["Very good", "Good", "Average", "Poor", "Very poor"],
  },
  {
    id: "q3",
    question: "What would make the biggest difference to your community?",
    type: "choice",
    options: [
      "More housing options",
      "Better health services",
      "More legal support",
      "Job opportunities",
      "Youth programs",
      "Cultural connection",
      "Transport access",
      "Financial assistance",
      "Community spaces",
      "Other",
    ],
  },
  {
    id: "q4",
    question: "Is there anything else you'd like IRAAC to know?",
    type: "text",
    options: [],
  },
];

export default function SurveyPage() {
  const [variant, setVariant] = useState<"iraac" | "moblink">("moblink");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setVariant(new URLSearchParams(window.location.search).get("type") === "iraac" ? "iraac" : "moblink");
  }, []);

  const questions = useMemo(() => variant === "iraac" ? [
    { id: "q1", question: "How has your experience with IRAAC YouthScape been so far?", type: "scale", options: ["Very good", "Good", "Average", "Poor", "Very poor"] },
    { id: "q2", question: "Has the support helped with your legal or safe-return needs?", type: "choice", options: ["Yes, a lot", "Yes, a little", "Not yet", "I need different support"] },
    { id: "q3", question: "What should IRAAC do next to support you?", type: "text", options: [] },
    { id: "q4", question: "Would you like an IRAAC worker to follow up?", type: "choice", options: ["Yes, message me", "Yes, call me", "No follow-up needed"] },
  ] : surveyQuestions, [variant]);
  const current = questions[step];
  const isLast = step === questions.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleNext = () => {
    if (answers[current.id]) {
      if (isLast) {
        setSubmitted(true);
      } else {
        setStep((s) => s + 1);
      }
    }
  };

  const handleSkip = () => {
    if (isLast) {
      setSubmitted(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  if (submitted) {
    return (
      <main className="app-page">
        <div className="phone-shell">
          <div className="phone-status" aria-hidden="true">
            <span className="phone-time">Survey complete</span>
            <span className="phone-signal">Moblink</span>
          </div>
          <div className="survey-thanks">
            <div className="survey-thanks-icon">🤝</div>
            <h1>Thank you</h1>
            <p>{variant === "iraac" ? "Your answers help IRAAC improve your support and understand what you need next." : "Your voice matters. De-identified themes help Moblink show government what community needs."}</p>
            <p className="survey-thanks-detail">
              <strong>You share → We listen → Services improve → Community evidence grows</strong>
            </p>
            <div className="survey-thanks-actions">
              <a href="/app/" className="service-card-button">
                Back to home
              </a>
              <a href="/app/search" className="service-card-button service-card-button-secondary">
                Browse services
              </a>
            </div>
          </div>
          <BottomNav current="/app/search" />
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="phone-shell">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">Have Your Say</span>
          <span className="phone-signal">Moblink</span>
        </div>

        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">{variant === "iraac" ? "Optional IRAAC check-in" : "Monthly community pulse"}</p>
            <h1>{variant === "iraac" ? "How is support going?" : "Have Your Say"}</h1>
          </div>
        </header>

        <div className="survey-progress">
          <div className="survey-progress-bar">
            <div
              className="survey-progress-fill"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="survey-progress-label">
            {step + 1} of {questions.length}
          </span>
        </div>

        <div className="survey-question">
          <h2 className="survey-question-text">{current.question}</h2>

          <div className="survey-options">
            {current.type === "text" ? (
              <textarea
                className="survey-textarea"
                rows={5}
                placeholder="Share your thoughts here..."
                value={answers[current.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            ) : current.type === "scale" ? (
              <div className="survey-scale">
                {current.options.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={`survey-scale-btn ${answers[current.id] === opt ? "survey-scale-active" : ""}`}
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="survey-choice-grid">
                {current.options.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={`survey-choice-btn ${answers[current.id] === opt ? "survey-choice-active" : ""}`}
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="survey-actions">
            <button
              type="button"
              className="service-card-button"
              onClick={handleNext}
              disabled={!answers[current.id]}
            >
              {isLast ? "Submit" : "Next"}
            </button>
            <button type="button" className="survey-skip-btn" onClick={handleSkip}>
              Skip this question
            </button>
          </div>
        </div>

        <BottomNav current="/app/messages" />
      </div>
    </main>
  );
}
