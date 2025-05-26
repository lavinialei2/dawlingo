
import React, { useState, useEffect } from 'react';
import './ProgressScreen.css';
import './Home.css';
import './components/ToolButton.css'
import { useNavigate } from 'react-router-dom';


const ProgressScreen = () => {

    const navigate = useNavigate();
        
    const navigateToHome = () => {
        navigate("/home")
    }; 

    const [LessonsCompleted, setLessonCompleted] = useState(0);

    useEffect(() => {
        const stored = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
        setLessonCompleted(stored);
      }, []);
   
    /*// Lesson 1 is index 0
    if (LessonsCompleted < 1) {
      localStorage.setItem("highestLessonCompleted", "1");
    }*/


    return (
      <div>
        <header className = "header"><h1>DAWlingo Progress Report</h1><button className="home-button" onClick={navigateToHome}>Home</button></header>
            <div className = "align-rect">
                <div className = "rectangle"> 
                    <div className = 'h2-text'>
                        <h2 className = "h2-left"> What you've learnt: </h2>
                        <h2 className = "h2-right">  What's next: </h2>
                        </div>
                        <div className = "progress-report">
                            { LessonsCompleted === 1 &&( <>
                                <ul className = 'ul-left'>
                                    <li>Complete a lesson to learn more!</li>
                                </ul>
                                    <ul className = 'ul-right'>
                                    <li> Add and delete a track </li>
                                    <li> Record a track </li>
                                    <li> Mute and unmute a track </li>
                                    <li> Loop over track </li> 
                                    <li> Preload a track of an instrument </li> 
                                    <li> Adjust pitch of a track </li>
                                    <li> How to use the compressor </li> 
                                    <li> How to use EQ </li> 
                                </ul>
                                </>
                            )}
                            
                            { LessonsCompleted === 2 && ( <>
                                <ul className = 'ul-left'>
                                    <li> Add and delete a track </li>
                                    <li> Record a track </li>
                                    <li> Mute and unmute a track </li>
                                </ul>
                                <ul className = 'ul-right'>
                                  <li> Loop over track </li> 
                                  <li> Preload a track of an instrument </li> 
                                  <li> Adjust pitch of a track </li>
                                </ul>
                                </>
                            )}
                            { LessonsCompleted === 3 && ( <>
                                <ul className = 'ul-left'>
                                    <li> Add and delete a track </li>
                                    <li> Record a track </li>
                                    <li> Mute and unmute a track </li>
                                    <li> Loop over track </li> 
                                    <li> Preload a track of an instrument </li> 
                                    <li> Adjust pitch of a track </li>
                                </ul>
                                <ul className = 'ul-right'>
                                    <li> How to use the compressor </li> 
                                    <li> How to use EQ </li> 
                                </ul>
                            </>

                            )

                            }
                        
                        </div>

                </div>
            </div>
      </div> 
    );
  };

export default ProgressScreen;