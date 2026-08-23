// src/components/admin/EditQuiz.jsx
import React, { useState } from 'react';
import { createQuiz, createQuestion } from '../../services/api';
import EditQuestion from './EditQuestion.jsx';

function EditQuiz({ quiz, moduleId, onUpdate }) {
  const [quizTitle, setQuizTitle] = useState(quiz ? quiz.title : 'New Module Quiz');

  const handleCreateQuiz = async () => {
    try {
      await createQuiz(moduleId, quizTitle || "New Quiz");
      onUpdate();
    } catch (err) {
      alert(`Error creating quiz: ${err.message}`);
    }
  };

  const handleAddNewQuestion = async () => {
    if (!quiz) {
      alert("Please create the quiz first.");
      return;
    }
    try {
      const newOrder = (quiz.questions?.length || 0) + 1;
      await createQuestion(
        quiz.id,
        "New question text...",
        newOrder,
        ["Option A", "Option B"],
        "Option A"
      );
      onUpdate();
    } catch (err) {
      alert(`Error adding new question: ${err.message}`);
    }
  };

  if (!quiz) {
    return (
      <div className="edit-quiz-container">
        <p>This assessment module doesn't have a quiz yet.</p>
        <div className="form-group" style={{ maxWidth: '300px', margin: '0.5rem 0 1rem' }}>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Quiz Title"
          />
        </div>
        <button onClick={handleCreateQuiz} className="btn btn-primary">
          Create Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="edit-quiz-container">
      <h3>Quiz Questions</h3>
      {quiz.questions.length > 0 ? (
        quiz.questions.map(question => (
          <EditQuestion
            key={question.id}
            question={question}
            onUpdate={onUpdate}
          />
        ))
      ) : <p>This quiz has no questions.</p>}

      <button onClick={handleAddNewQuestion} className="btn btn-secondary" style={{marginTop: '1rem'}}>
        + Add New Question
      </button>
    </div>
  );
}

export default EditQuiz;