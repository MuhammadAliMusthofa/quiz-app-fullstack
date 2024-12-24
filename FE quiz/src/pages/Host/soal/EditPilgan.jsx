import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Box,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Button,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Edit, Save, DeleteOutline } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import api from "../../../config/Api";

const EditQuestionPage = () => {
  const { quizId, questionId } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [originalOptionImages, setOriginalOptionImages] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [newOptionImages, setNewOptionImages] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    if (questionData) {
      setCorrectAnswer(questionData.correct_answer);
    }
  }, [questionData]);

  const handleCorrectAnswerChange = (event) => {
    setCorrectAnswer(event.target.value);
  };
  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        const response = await fetch(
          `${api}/detailquestion/${quizId}/${questionId}`
        );
        if (response.ok) {
          const data = await response.json();
          setQuestionData(data.data);
          setOptions([
            data.data.option1,
            data.data.option2,
            data.data.option3,
            data.data.option4,
          ]);
          setOriginalOptionImages([
            data.data.option1_image,
            data.data.option2_image,
            data.data.option3_image,
            data.data.option4_image,
          ]);
        } else {
          console.error(
            "Failed to fetch question detail:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching question detail:", error);
      }
    };

    fetchQuestionDetail();
  }, [quizId, questionId]);

  useEffect(() => {
    return () => {
      // Cleanup object URLs when the component unmounts
      newOptionImages.forEach((image) => {
        if (image) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [newOptionImages]);

  if (!questionData) {
    return <Typography>Loading...</Typography>;
  }

  const { question_text, correct_answer, questionImage } = questionData;

  const defaultImage = "/public/assets/img-nf.png";

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && validTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${api}/delete-question/${quizId}/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Output success message
        setSnackbarOpen(true); // Show Snackbar after successful deletion
        // Navigate to quiz detail page after 2 seconds
        setTimeout(() => {
          navigate(`/quiz/detail/${quizId}`);
        }, 2000);
      } else {
        console.error("Failed to delete question:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleOptionImageChange = (e, index) => {
    const file = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && validTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        let tempNewOptionImages = [...newOptionImages];
        tempNewOptionImages[index] = reader.result;
        setNewOptionImages(tempNewOptionImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (e, index) => {
    let tempOptions = [...options];
    tempOptions[index] = e.target.value;
    setOptions(tempOptions);
  };

  const handleSoalChange = (e) => {
    setQuestionData({ ...questionData, question_text: e.target.value });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("question", questionData.question_text);
    formData.append("option1", options[0]);
    formData.append("option2", options[1]);
    formData.append("option3", options[2]);
    formData.append("option4", options[3]);
    formData.append("correctAnswer", correctAnswer);

    if (fileInputRef.current.files[0]) {
      formData.append("questionImage", fileInputRef.current.files[0]);
    }

    newOptionImages.forEach((img, index) => {
      if (img && !(img instanceof File)) {
        const file = dataURLtoFile(img, `option${index + 1}.png`);
        formData.append(`option${index + 1}Image`, file);
      } else if (img instanceof File) {
        formData.append(`option${index + 1}Image`, img);
      }
    });

    try {
      const response = await fetch(
        `${api}/updateDataQuiz/${quizId}/${questionId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSnackbarOpen(true);
        setIsEditing(false);
        setQuestionData(result.data);
        setNewOptionImages([
          result.data.option1_image,
          result.data.option2_image,
          result.data.option3_image,
          result.data.option4_image,
        ]);
        setTimeout(() => {
          navigate(`/quiz/detail/${quizId}`);
        }, 500);
      } else {
        console.error("Failed to update question:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  return (
    <div
      className="bg-edit-question d-flex justify-content-center "
      sx={{ textAlign: "center", mt: 5 }}
    >
      <div className="col-md-10 ">
        <Box sx={{ p: 5, backgroundColor: "none" }}>
          <h5>Masukkan Soal</h5>
          <TextField
            id="question-input"
            name="question"
            placeholder="Masukan Soal"
            fullWidth
            label="Soal"
            variant="outlined"
            margin="normal"
            value={question_text}
            onChange={handleSoalChange}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "5px",
              "& .MuiInputBase-input": {
                textAlign: "center",
                fontSize: "25px",
              },
            }}
          />

          <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
            <Box
              className="shadow"
              sx={{
                width: 300,
                height: 250,
                backgroundColor: "grey.200",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: "20px",
              }}
              onClick={handleDivClick}
            >
              <img
                src={
                  previewImage ||
                  (questionImage
                    ? `http://10.1.4.41/api/image/${questionImage}`
                    : defaultImage)
                }
                alt="Insert Media"
                width="200"
                height="200"
                style={{ borderRadius: "0px" }}
              />
            </Box>
            <input
              type="file"
              name="questionImage"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>

          {/* Input Jawaban */}
          <Grid container spacing={2} sx={{ mt: 5 }}>
            {["primary", "warning", "success", "error"].map((color, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box
                  className="shadow"
                  sx={{
                    backgroundColor: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 100,
                    p: 2,
                    borderRadius: "8px",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: `${color}.main`,
                      height: "90px",
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    <img
                      src={
                        newOptionImages[index] ||
                        (originalOptionImages[index]
                          ? `http://10.1.4.41/api/image/${originalOptionImages[index]}`
                          : defaultImage)
                      }
                      alt={`Option ${index + 1}`}
                      width="70"
                      height="70"
                      style={{ borderRadius: "5px" }}
                    />
                  </Box>
                  <TextField
                    placeholder="Isi Jawaban"
                    fullWidth
                    name={`option${index + 1}`}
                    label={`Option ${index + 1}`}
                    variant="outlined"
                    sx={{ mx: 2 }}
                    value={options[index]}
                    onChange={(e) => handleOptionChange(e, index)}
                  />
                  <label htmlFor={`option-file-${index}`}>
                    <AddPhotoAlternateIcon
                      sx={{ fontSize: 30, cursor: "pointer", color: "grey" }}
                    />
                    <input
                      type="file"
                      name={`option${index + 1}Image`}
                      id={`option-file-${index}`}
                      style={{ display: "none" }}
                      onChange={(e) => handleOptionImageChange(e, index)}
                    />
                  </label>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Jawaban Benar */}
          <Box sx={{ mt: 5 }}>
            <h4>Pilih Jawaban Benar</h4>
            <FormControl fullWidth margin="normal">
              <InputLabel id="select-label">Option</InputLabel>
              <Select
                labelId="select-label"
                id="select-correct-answer"
                value={correctAnswer}
                label="Option"
                onChange={handleCorrectAnswerChange}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                }}
              >
                {["option1", "option2", "option3", "option4"].map(
                  (option, index) => (
                    <MenuItem key={index} value={option}>
                      {`Option ${index + 1}`}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>

          <button class="btn-55 mt-4" onClick={handleSubmit}>
            <span>Simpan</span>
          </button>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={handleSnackbarClose}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            severity="success"
            onClose={handleSnackbarClose}
          >
            Update berhasil
          </MuiAlert>
        </Snackbar>
      </div>
    </div>
  );
};

export default EditQuestionPage;
