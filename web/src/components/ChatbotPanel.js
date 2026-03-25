import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { v4 as uuidv4 } from 'uuid';

export default function ChatbotPanel({ onEligibilityResult }) {
  const [questions, setQuestions] = useState([]);
  const [sessionId] = useState(uuidv4());
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    api.get('/chatbot/questions').then(r => setQuestions(r.data.questions)).catch(() => {});
    // Load last result from history
    api.get('/chatbot/history').then(r => {
      if (r.data?.length > 0) setLastResult(r.data[0].eligibilityResult);
    }).catch(() => {});
  }, []);

  const handleAnswer = async (option) => {
    const q = questions[step];
    const newAnswers = [...answers, { question: q.question, answer: option, key: q.key, step: q.step }];
    setAnswers(newAnswers);
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const res = await api.post('/chatbot/submit', { sessionId, responses: newAnswers });
        setResult(res.data.eligibilityResult);
        setLastResult(res.data.eligibilityResult);
        if (onEligibilityResult) onEligibilityResult(res.data.eligibilityResult);
      } catch { }
      setLoading(false);
    }
  };

  const restart = () => { setStep(0); setAnswers([]); setResult(null); };

  const current = questions[step];
  const progress = questions.length ? (step / questions.length) * 100 : 0;

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>🤖 Eligibility Check</span>
        {lastResult && !result && (
          <span style={{ ...styles.lastBadge, background: lastResult.eligible ? '#d4edda' : '#ffe0e0', color: lastResult.eligible ? '#2d6a4f' : '#e63946' }}>
            Last: {lastResult.eligible ? '✅ Eligible' : '❌ Not eligible'} ({lastResult.score}/100)
          </span>
        )}
      </div>

      {loading && (
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--gray)', fontSize: 13, marginTop: 8 }}>Analyzing...</p>
        </div>
      )}

      {!loading && result && (
        <div style={styles.result}>
          <div style={{ fontSize: 36, textAlign: 'center' }}>{result.eligible ? '✅' : '❌'}</div>
          <p style={{ ...styles.resultTitle, color: result.eligible ? '#2d6a4f' : '#e63946' }}>
            {result.eligible ? 'You are eligible to donate!' : 'Not eligible right now'}
          </p>
          <div style={styles.scoreRow}>
            <span style={{ fontSize: 28, fontWeight: 700, color: result.score >= 60 ? '#2d6a4f' : '#e63946' }}>{result.score}</span>
            <span style={{ color: 'var(--gray)', fontSize: 13 }}>/100</span>
          </div>
          {result.reasons?.length > 0 && (
            <div style={styles.reasons}>
              {result.reasons.map((r, i) => <div key={i} style={styles.reason}>⚠️ {r}</div>)}
            </div>
          )}
          <button className="btn btn-outline" style={{ width: '100%', marginTop: 12 }} onClick={restart}>
            Check Again
          </button>
        </div>
      )}

      {!loading && !result && current && (
        <>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <p style={styles.stepLabel}>Question {step + 1} of {questions.length}</p>
          <p style={styles.question}>{current.question}</p>
          <div style={styles.options}>
            {current.options.map(opt => (
              <button key={opt} className="btn btn-outline" style={styles.optBtn} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button style={styles.backBtn} onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}>
              ← Back
            </button>
          )}
        </>
      )}

      {!loading && !result && !current && questions.length === 0 && (
        <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 20, fontSize: 13 }}>Loading questions...</p>
      )}
    </div>
  );
}

const styles = {
  panel: { background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  panelTitle: { fontWeight: 700, fontSize: 15, color: 'var(--dark)' },
  lastBadge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 },
  progressBg: { height: 5, background: '#eee', borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s' },
  stepLabel: { fontSize: 12, color: 'var(--gray)', marginBottom: 6 },
  question: { fontSize: 15, fontWeight: 600, marginBottom: 14, lineHeight: 1.4 },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  optBtn: { textAlign: 'left', padding: '10px 14px', fontSize: 14, borderRadius: 8 },
  backBtn: { background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', marginTop: 10, fontSize: 13 },
  center: { textAlign: 'center', padding: '20px 0' },
  spinner: { width: 32, height: 32, border: '3px solid #eee', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
  result: { textAlign: 'center' },
  resultTitle: { fontWeight: 700, fontSize: 15, margin: '8px 0 4px' },
  scoreRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 10 },
  reasons: { background: '#fff3cd', padding: 12, borderRadius: 8, textAlign: 'left', marginBottom: 8 },
  reason: { fontSize: 12, color: '#856404', marginBottom: 4 }
};
