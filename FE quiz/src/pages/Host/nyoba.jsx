import React, { useState, useEffect } from 'react';
import Crossword from '@jaredreisinger/react-crossword';
import ttsJson from './tts.json';

const CrosswordPuzzle = () => {
  const [correctAnswers, setCorrectAnswers] = useState({});

  const handleCorrect = (direction, number) => {
    setCorrectAnswers((prevCorrectAnswers) => ({
      ...prevCorrectAnswers,
      [`${direction}-${number}`]: true,
    }));

    // Update cell colors
    document.querySelectorAll(`[data-direction="${direction}"][data-number="${number}"]`).forEach(cell => {
      cell.classList.add('correct');
    });
  };

  const handleCellChange = (direction, number, row, col, char) => {
    const isCorrect = correctAnswers[`${direction}-${number}`];
    if (isCorrect) {
      return false; // Do not allow changes to correct answers
    }
  };

  useEffect(() => {
    const correctStyles = document.querySelectorAll('.correct');
    correctStyles.forEach((cell) => {
      cell.style.color = 'green';
    });
  }, [correctAnswers]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Crossword Puzzle</h1>
      <Crossword
        data={ttsJson}
        onCorrect={handleCorrect}
        onCellChange={handleCellChange}
      />
    </div>
  );
};

export default CrosswordPuzzle;
