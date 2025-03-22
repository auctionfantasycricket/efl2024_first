import React from 'react';
import './Video.css'


export const Video = () => {
  return (
    <section className='videopage' id='video'>
        <h1>How to Play</h1>
        <div className="video-container">
        <iframe
            className="video-frame"
            src="https://www.youtube.com/embed/EWVWK2spwug?si=LYy8cFsEz8Sa0Cwk"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
        ></iframe>
        </div>
    </section>
  );
}
