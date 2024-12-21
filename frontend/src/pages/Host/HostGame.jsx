import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Statistik from "../Player/Statistik";
import { Howl } from 'howler'; // Import Howl from howler
import { Fade, Bounce } from "react-awesome-reveal";
import api from '../../config/Api';



const Host = () => {
  const { gameCode } = useParams();
  const [status, setStatus] = useState("waiting");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(20);
  const [showAnswerSummary, setShowAnswerSummary] = useState(false);
  const [answerSummary, setAnswerSummary] = useState(null);
  const [selesai, setselesai] = useState(false);
  const [waktuMundur , setwaktuMundur] = useState(1000);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const navigate = useNavigate();
  const [audio1, setAudio1] = useState(null);
  const [audio2, setAudio2] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${api}/quiz_list/${gameCode}`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.data[0].status);
          setQuestions(data.data);
        } else {
          console.error("Failed to fetch game status:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching game status:", error);
      }
    };

    fetchData();
  }, [gameCode]);

  // useEffect(() => {
  
  //   const audioFile2 = '/assets/timer.mp3';
  //   const audioInstance2 = new Howl({
  //     src: [audioFile2],
  //     html5: true,
  //     volume: 0.3,
  //     loop: true,
  //   });
  //   setAudio2(audioInstance2);
  //   audioInstance2.play();

  //   // Membersihkan audio saat komponen dilepas
  //   return () => {
  //     // audioInstance1.unload();
  //     audioInstance2.unload();
  //   };
  // }, []);

  useEffect(() => {
    const storedData = sessionStorage.getItem('gameData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setStatus(parsedData.status);
      setQuestions(parsedData.questions);
      setCurrentQuestionIndex(parsedData.currentQuestionIndex);
      setCountdown(parsedData.countdown);
      setShowAnswerSummary(parsedData.showAnswerSummary);
      setAnswerSummary(parsedData.answerSummary);
      setselesai(parsedData.selesai);
    }
  }, []);

  useEffect(() => {
    const gameData = {
      status,
      questions,
      currentQuestionIndex,
      countdown,
      showAnswerSummary,
      answerSummary,
      selesai,
    };
    sessionStorage.setItem('gameData', JSON.stringify(gameData));
  }, [status, questions, currentQuestionIndex, countdown, showAnswerSummary, answerSummary, selesai]);
// halo ali semangat ngodingnya >_<9
  useEffect(() => {
    const interval = setInterval(() => {
      setwaktuMundur(1000)
      if (status === "ingame") {
        
        setselesai(false)
        if (!showAnswerSummary) {
          // Jika tidak menampilkan total answer, jalankan interval untuk pertanyaan
          setCountdown((prevCountdown) => {
            // console.log(`prevCountdown`,prevCountdown)

            if (prevCountdown === 1) {
             
              if (currentQuestionIndex === questions.length - 1   ) {
                // Jika ini adalah pertanyaan terakhir, arahkan ke halaman finish
                // clearInterval(interval); // Hentikan interval
                navigate(`/host/finish/${gameCode}`); // Navigasi ke halaman finish
                // return ; // Atur countdown ke 0 agar tidak lanjut ke pertanyaan berikutnya
                

              } else {
                setCurrentQuestionIndex(
                  (prevIndex) => (prevIndex + 1) % questions.length
                ); // Go to the next question
                setwaktuMundur(5000)
                setselesai(true)
                // return 10; // Reset countdown to 10 seconds for the next question
              }
              
            } else {
              return prevCountdown - 1; // Decrease countdown every second
            }
          });
        }
      }
    }, waktuMundur); // Update countdown every second
    // Membersihkan interval saat komponen dilepas atau ketika menampilkan total answer
    console.log(`waktuMundur`,waktuMundur)
    return () => clearInterval(interval);
  }, [status, questions.length, showAnswerSummary,waktuMundur]);

  const timer = 10;

 

  const renderQuestionContent = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    switch (question.question_type) {
      case "melengkapi":
        return (
          <>
          

          <div className="d-flex flex-column justify-content-around h-100  ">
            <div className="d-flex justify-content-center bg-light p-3 w-100 align-items-center">
                  <h5 className="text-host-soal">Lengkapi Soal Dibawah ini dengan jawaban yang benar</h5>
                <img className="ms-3" src="../../assets/blank-paper.png" alt="" style={{width:'50px'}} />
          
            </div>

            
            

            <div className="d-flex justify-content-center mt-3">
              
              <h5 className="rounded-circle bg-light p-3 text-dark">{countdown ? countdown : "0"}</h5>

            </div>

            <div className="d-flex justify-content-center">
                <div className="p-5 soal-tof w-50 mt-5">
            
                <Fade left damping={0.1}>
                    <h1 className="text-host-soal text-centers text-light">{question.question_text}</h1>
                </Fade>
                
                  
                </div>

            </div>
            <div className=" h-75 ">
              <div className="  my-3 d-flex flex-wrap justify-content-center align-items-center">
              </div>
            </div>
          

            <div className="p-3 footer-player d-flex justify-content-around">
              <div className=" rounded p-1 " style={{width:'', backgroundColor:'#8D4F98', borderRight:'4px solid #EE8EFF', borderBottom:'4px solid #EE8EFF'}}>
                <h2 className="text-center mt-2 text-light">Nomor {currentQuestionIndex + 1}</h2>
              </div>
            
              
            </div>
          </div>
          </>
        );
      case "pilihan_ganda":
        return (
         <div className="d-flex flex-column justify-content-around h-100  ">
          <div className="d-flex justify-content-center bg-light p-3 w-100 ">
                <h3 className="text-host-soal">{questions[currentQuestionIndex].question_text}</h3>
                
          {/* <Fade cascade damping={0.1}>

               </Fade> */}
          </div>

          <div className="d-flex justify-content-center mt-3">
             
             <h5 className="rounded-circle bg-light p-3 text-dark">{countdown ? countdown : "0"}</h5>

          </div>
         <div className=" h-75 ">
           <div className="  my-3 d-flex flex-wrap justify-content-center align-items-center">
                 <img style={{height:'200px', width:'200px', backgroundSize: 'contain',backgroundRepeat: 'no-repeat',backgroundPosition: 'center',}} src={`http://localhost:4001/image/${questions[currentQuestionIndex]?.question_image}`} alt="" />
           </div>
         </div>
         <div className="container-fluid h-75 ">
           <div className="row h-50">
             <div className="col-md-6 d-flex justify-content-center align-items-center">
               <div className="p-3 col-md-2  w-100 h-75 d-flex justify-content-around align-items-center rounded-5" style={{backgroundColor:'#C039FF', borderRight:'8px solid #C584FC', borderBottom:'8px solid #C584FC'}}>
                <div style={{width:'30%'}}>
                        <img src="/assets/card-a.png"  className="img-fluid " style={{width:'30%'}} alt=""  id="option2"  />
                    </div>

                    <div style={{width:'70%'}} className="d-flex  align-items-center">
                        <img src={`http://localhost:4001/image/${questions[currentQuestionIndex]?.option1_image}`} className="" style={{ width: '15%', borderRadius:'10px', minHeight:'8vh' }} alt="" id="option1" />
                        <h5 className="text-host-jawaban ms-5  text-light">{questions[currentQuestionIndex]?.option1}</h5>

                    </div>
               </div>

                  
             </div>
             <div className="col-md-6 d-flex justify-content-center align-items-center">
               <div className="p-3 col-md-2  w-100 h-75 d-flex  align-items-center rounded-5"  style={{backgroundColor:'#FFA015', borderLeft:'8px solid #FFCF96', borderBottom:'8px solid #FFCF96'}}>
                  <div style={{width:'30%'}}>
                      <img src="/assets/card-b.png" className="img-fluid " style={{width:'30%'}} alt=""  id="option2"  />
                  </div>

                  <div style={{width:'70%'}} className="d-flex  align-items-center">
                      <img src={`http://localhost:4001/image/${questions[currentQuestionIndex]?.option2_image}`} className="" style={{ width: '15%', borderRadius:'10px', minHeight:'8vh' }} alt="" id="option1" />
                      <h5 className="text-host-jawaban ms-5 text-light">{questions[currentQuestionIndex]?.option2}</h5>
                  </div>
                  
               </div>
             </div>
           </div>
           <div className="row h-50">
             <div className="col-md-6 d-flex justify-content-center align-items-center">
               <div className="p-3  col-md-2 w-100 h-75 d-flex justify-content-center align-items-center rounded-5" style={{backgroundColor:'#00BF63', borderRight:'8px solid #96FABD', borderBottom:'8px solid #96FABD'}}>
                  <div style={{width:'30%'}}>
                      <img src="/assets/card-c.png" className="img-fluid " style={{width:'30%'}} alt=""  id="option3"  />
                  </div>

                  <div style={{width:'70%'}} className="d-flex  align-items-center">
                      <img src={`http://localhost:4001/image/${questions[currentQuestionIndex]?.option3_image}`} className="" style={{ width: '15%', borderRadius:'10px', minHeight:'8vh' }} alt="" id="option1" />
                      <h5 className="text-host-jawaban ms-5 text-light">{questions[currentQuestionIndex]?.option3}</h5>
                  </div>
               </div>
             </div>
             <div className="col-md-6 d-flex justify-content-center align-items-center">
               <div className="p-3 col-md-2  w-100 h-75 d-flex justify-content-center align-items-center rounded-5" style={{backgroundColor:'#FF66C4', borderLeft:'8px solid #FFB9FF', borderBottom:'8px solid #FFB9FF'}}>
               <div style={{width:'30%'}}>
                      <img src="/assets/card-d.png" className="img-fluid " style={{width:'30%'}} alt=""  id="option4"  />
                  </div>

                  <div style={{width:'70%'}} className="d-flex  align-items-center">
                      <img src={`http://localhost:4001/image/${questions[currentQuestionIndex]?.option4_image}`} className="" style={{ width: '15%', borderRadius:'10px', minHeight:'8vh' }} alt="" id="option1" />
                      <h5 className="text-host-jawaban ms-5 text-light">{questions[currentQuestionIndex]?.option4}</h5>
                  </div>

               </div>
             </div>
           </div>
         </div>

         <div className="p-3 footer-player d-flex justify-content-around">
           <div className=" rounded p-1 " style={{width:'', backgroundColor:'#8D4F98', borderRight:'4px solid #EE8EFF', borderBottom:'4px solid #EE8EFF'}}>
             <h2 className="text-center mt-2 text-light">Nomor {currentQuestionIndex + 1}</h2>
           </div>
        
           
         </div>
      </div>
        );
      case "tof":
        return (
          <div className="d-flex flex-column justify-content-around h-100 ">
          <div className="d-flex justify-content-center bg-light p-3 w-100 soal-tof">
                <h3 className="text-host-soal">{questions[currentQuestionIndex].question_text}</h3>
          </div>

          <div className="d-flex justify-content-center mt-3">
             <h5 className="rounded-circle bg-light p-3 text-dark">{countdown ? countdown : "0"}</h5>
          </div>
         <div className=" h-75 ">
           <div className="  my-3 d-flex flex-wrap justify-content-center align-items-center">
                 <img  style={{height:'200px', width:'200px', backgroundSize: 'contain',backgroundRepeat: 'no-repeat',backgroundPosition: 'center',}} src={`http://localhost:4001/image/${questions[currentQuestionIndex]?.question_image}`} alt="" />
           </div>
         </div>


         <div className="container-fluid h-75 ">
           <div className="row h-100">
             <div className="col-md-6 d-flex justify-content-center align-items-center">
               <div className="p-3  col-md-2 w-100 h-75 d-flex justify-content-center align-items-center rounded-5" style={{backgroundColor:'#FF66C4', borderRight:'8px solid #FFB9FF', borderBottom:'8px solid #FFB9FF'}}>
                    <h1 className="text-light">FALSE</h1>
               </div>
             </div>
             <div className="col-md-6 d-flex justify-content-center align-items-center">
               <div className="p-3 col-md-2  w-100 h-75 d-flex justify-content-center align-items-center rounded-5" style={{backgroundColor:'#00BF63', borderLeft:'8px solid #96FABD', borderBottom:'8px solid #96FABD'}}>
               <h1 className="text-light">TRUE</h1>
               </div>
             </div>
           </div>
         </div>

         <div className="p-3 footer-player d-flex justify-content-around">
           <div className=" rounded p-1 " style={{width:'', backgroundColor:'#8D4F98', borderRight:'4px solid #EE8EFF', borderBottom:'4px solid #EE8EFF'}}>
                <h2 className="text-center mt-2 text-light">Nomor {currentQuestionIndex + 1}</h2>
           </div>
        
         </div>
      </div>

      
        );
      default:
        return null;
    }
  };

  return (
    <div className="hostgame-player">
      {selesai && (
        <Statistik
          gameCode={gameCode}
          currentQuestionIndex={currentQuestionIndex === questions.length ? currentQuestionIndex : currentQuestionIndex - 1}
          questions={questions}
          setCountdown={setCountdown}
        />
      )}

      {status === "waiting" ? (
        <div className="card shadow col-md-6 mx-auto mt-5 p-4">
          <h1 className="text-center mb-4">Menunggu Game Dimulai Oleh Host....</h1>
        </div>
      ) : status === "ingame" && !selesai ? (
        <>
              {renderQuestionContent()}
        </>
        // <div className="shadow col-md-6 mx-auto mt-5 p-4 rounded" id="">
        //   <div className="text-center">
        //     <h1 className="mb-4">Kuis {currentQuestionIndex + 1}</h1>
        //     <div>
        //       <h1 className="display-1">{countdown}</h1>
        //     </div>
        //   </div>
        // </div>
      ) : (
        <h1 className="text-center mb-4">Total Player Menjawab</h1>
      )}
    </div>
  );
};

export default Host;
