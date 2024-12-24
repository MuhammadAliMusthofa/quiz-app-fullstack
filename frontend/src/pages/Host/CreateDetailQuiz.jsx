import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Typography,
  Grid,
  CardContent,
  Card,
  CardMedia,
  Box,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import api from "../../config/Api";

function CreateQuizPage() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quizName, setQuizName] = useState("");
  const defaultImage = "/public/assets/img-nf.png";

  useEffect(() => {
    async function fetchQuizData() {
      const response = await fetch(`${api}/question-list/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.data.questions);
      } else {
        console.error("Failed to fetch quiz questions:", response.statusText);
      }
    }
    const intervalId = setInterval(fetchQuizData, 1000);

    return () => clearInterval(intervalId);
  }, [quizId]);

  useEffect(() => {
    const fetchQuizName = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const response = await fetch(`${api}/quiz/${userId}`);
        if (response.ok) {
          const data = await response.json();
          const quiz = data.data.find((item) => item.id === parseInt(quizId));
          if (quiz) {
            setQuizName(quiz.title);
          }
        } else {
          console.error("Failed to fetch quiz name:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching quiz name:", error);
      }
    };

    fetchQuizName();
  }, [quizId]);

  const renderQuestionContent = (question, index) => {
    switch (question.question_type) {
      case "pilihan_ganda":
        return (
          <Link
            to={`/quiz/detail/${quizId}/question/${encodeURIComponent(
              question.question_id
            )}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              className="card-read-quiz-pilgan text-dark shadow bg-body-secondary"
              sx={{
                minHeight: "664px",
                maxHeight: "664px",
                borderRadius: "15px",
              }}
            >
              <CardContent>
                <Typography
                  textAlign="center"
                  variant="h5"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  Soal {index + 1}: {question.question_text}
                </Typography>
                <CardMedia
                  className="border mt-3 rounded p-2"
                  component="img"
                  image={
                    question.questionImage
                      ? `http://10.1.4.41/api/image/${question.questionImage}`
                      : defaultImage
                  }
                  alt="Question image"
                  sx={{
                    height: 140,
                    my: 2,
                    borderRadius: "8px",
                    maxWidth: "100%",
                  }}
                />
                <div className="d-flex flex-wrap justify-content-around">
                  {["option1", "option2", "option3", "option4"].map(
                    (option, idx) => (
                      <div
                        className="border bg-body-secondary mt-3 rounded p-2"
                        style={{
                          height: "auto",
                          width: "250px",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        key={idx}
                      >
                        <Typography
                          variant="h6"
                          textAlign="center"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                          }}
                        >
                          {`Option ${idx + 1}`}: {question[option]}
                        </Typography>
                        <CardMedia
                          className="img-fluid"
                          component="img"
                          image={
                            question[`${option}_image`]
                              ? `http://10.1.4.41/api/image/${
                                  question[`${option}_image`]
                                }`
                              : defaultImage
                          }
                          alt={`Option ${idx + 1} image`}
                          sx={{
                            height: 100,
                            mt: 1,
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
                <Typography
                  variant="h5"
                  mt={5}
                  textAlign="center"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  Jawaban Benar:{" "}
                  {["option1", "option2", "option3", "option4"].includes(
                    question.correct_answer
                  )
                    ? question[question.correct_answer]
                    : question.correct_answer}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        );
      case "melengkapi":
        return (
          <Link
            to={`/quiz/detail/${quizId}/question/${encodeURIComponent(
              question.question_id
            )}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              className="card-read-quiz-melengkapi text-light shadow"
              sx={{
                minHeight: "664px",
                maxHeight: "664px",
                borderRadius: "15px",
              }}
            >
              <CardContent className="d-flex flex-column justify-content-between">
                <div
                  className="p-5 shadow"
                  style={{ backgroundColor: "#7964A4", borderRadius: "15px" }}
                >
                  <h3
                    className="ms-5 me-5"
                    style={{
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      textAlign: "center",
                    }}
                  >
                    Soal {index + 1} : {question?.question_text}
                  </h3>
                </div>
                <div>
                  <Typography
                    variant="h5"
                    mt={5}
                    textAlign="center"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    <div
                      className="p-2"
                      style={{
                        backgroundColor: "#7964A4",
                        borderRadius: "15px",
                        marginTop: "250px",
                      }}
                    >
                      <h3 style={{ color: "white" }}>Jawaban Benar:</h3>
                      <h1>
                        {["option1", "option2", "option3", "option4"].includes(
                          question.correct_answer
                        )
                          ? question[question.correct_answer]
                          : question?.correct_answer}
                      </h1>
                    </div>
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      case "tof":
        return (
          <Link
            to={`/quiz/detail/${quizId}/question/${encodeURIComponent(
              question.question_id
            )}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              className="card-read-quiz-tof text-dark shadow"
              sx={{
                borderRadius: "15px",
                minHeight: "664px",
                maxHeight: "664px",
                backgroundColor: "#F9D6C3",
              }}
            >
              <CardContent>
                <h3
                  className="ms-5 me-5"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    textAlign: "center",
                  }}
                >
                  Soal {index + 1} : {question?.question_text}
                </h3>
                <div className="text-center">
                  <img
                    src={
                      question.questionImage
                        ? `http://10.1.4.41/api/image/${question?.questionImage}`
                        : defaultImage
                    }
                    alt=""
                    style={{
                      height: 400,
                      my: 2,
                      borderRadius: "8px",
                      maxWidth: "100%",
                      backgroundSize: "contain",
                    }}
                  />
                </div>
                <Typography
                  variant="h5"
                  mt={5}
                  textAlign="center"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  Jawaban Benar:
                  <div
                    className="p-2 mt-2"
                    style={{ backgroundColor: "#fff", borderRadius: "15px" }}
                  >
                    <h1>
                      {["option1", "option2", "option3", "option4"].includes(
                        question.correct_answer
                      )
                        ? question[question.correct_answer]
                        : question?.correct_answer}
                    </h1>
                  </div>
                </Typography>
              </CardContent>
            </Card>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-quiz">
      <div className="p-5">
        <Typography
          variant="h4"
          className="mb-2 rounded"
          sx={{
            p: 5,
            backgroundImage:
              "linear-gradient(to right top, #4a464b, #655968, #816d86, #9e82a5, #bc97c5, #bc97c5, #bc97c5, #bc97c5, #9e82a5, #816d86, #655968, #4a464b)",
            borderRadius: "15px",
            color: "#fff",
            boxShadow: "0px 0px 5px 2px rgba(255,255,255,0.4)",
            WebkitBoxShadow: "0px 0px 5px 2px rgba(255,255,255,0.4)",
            MozBoxShadow: "0px 0px 5px 2px rgba(255,255,255,0.4)",
          }}
        >
          Nama Quiz: {quizName}
        </Typography>

        <Box>
          <Link
            to={`/quiz/admin`}
            className="p-2 bg-warning text-light rounded me-4 shadow"
          >
            {/* <div>
                            </div> */}
            <KeyboardBackspaceIcon sx={{ fontSize: "2em" }} />
          </Link>
          <Link to={`/quiz/detaillll/${quizId}`}>
            <Button variant="contained" className="mt-3 mb-3 button-add-quiz">
              Tambah Soal
            </Button>
          </Link>
        </Box>
        <Grid container spacing={2}>
          {questions.map((question, index) => (
            <Grid item xs={12} md={6} key={question.question_id}>
              {renderQuestionContent(question, index)}
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default CreateQuizPage;
