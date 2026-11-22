export function gradeAssessment(questions, answers, passMark = 70) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("An assessment must contain at least one question.");
  }
  if (!Number.isFinite(passMark) || passMark < 0 || passMark > 100) {
    throw new RangeError("A pass mark must be between 0 and 100.");
  }

  const results = questions.map((question) => {
    const rawAnswer = answers[question.id];
    const selectedAnswer = rawAnswer === undefined || rawAnswer === null ? null : Number(rawAnswer);
    const correct = Number.isInteger(selectedAnswer) && selectedAnswer === question.answer;
    return {
      questionId: question.id,
      topic: question.topic,
      selectedAnswer,
      correct,
      explanation: question.explanation
    };
  });
  const correct = results.filter((result) => result.correct).length;
  const percentage = Math.round(correct / questions.length * 100);

  return {
    correct,
    total: questions.length,
    percentage,
    passed: percentage >= passMark,
    passMark,
    results
  };
}
