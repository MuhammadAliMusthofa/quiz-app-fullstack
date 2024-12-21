import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Paper, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const DragAndDropQuestion = () => {
  const [words, setWords] = useState(['cat', 'dog', 'bird', 'fish']);
  const [sentence, setSentence] = useState('The {0} jumped over the {1}.');

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(words);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWords(items);

    const updatedSentence = updateSentence(items);
    setSentence(updatedSentence);
  };

  const updateSentence = (items) => {
    let updatedSentence = sentence;
    items.forEach((word, index) => {
      updatedSentence = updatedSentence.replace(`{${index}}`, word);
    });
    return updatedSentence;
  };

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Drag and Drop the words to complete the sentence
            </Typography>
            <Divider />
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="words" direction="horizontal">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    mt={2}
                  >
                    {words.map((word, index) => (
                      <Draggable key={word} draggableId={word} index={index}>
                        {(provided) => (
                          <Paper
                            elevation={2}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ padding: 1 }}
                          >
                            {word}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Completed Sentence
            </Typography>
            <Divider />
            <Box mt={2}>
              <Typography variant="body1">{sentence}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DragAndDropQuestion;