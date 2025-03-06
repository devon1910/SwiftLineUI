import React, { useState, useEffect } from 'react';
import { Card, Carousel } from 'react-bootstrap';

const DidYouKnowSlider = () => {
    const [randomReasons, setRandomReasons] = useState([]);
    // List of reasons why people should use Swiftline.
    const colors = ["#3498db", "#2ecc71", "#34495e"];
    const swiftlineReasons = [
        "You can plan your day 10 times better when you use Swiftline to join queues.",
        "Swiftline users report up to a 70% reduction in wait times.",
        "By joining queues online, you can save an average of 15 minutes per visit.",
        "Swiftline improves your scheduling efficiency by 8 times compared to traditional queues.",
        "Experience up to 50% less waiting with Swiftline's smart queue management.",
        "Users have up to 3x more free time when they use Swiftline.",
        "Swiftline's digital queueing system can boost your daily productivity by 20%.",
        "Say goodbye to long waits—Swiftline can cut your queue time in half.",
        "Plan your day with precision: Swiftline users are 4x more punctual.",
        "Using Swiftline can make your day 10 times more efficient with smart time management."
    ];
    useEffect(() => {
      // Shuffle the reasons array randomly when the component mounts.
      const shuffled = [...swiftlineReasons].sort(() => 0.5 - Math.random());
      setRandomReasons(shuffled);
    }, []);
  
    return (
        <Card className="mt-3">
        <Card.Header>
          <h5>Did you know?</h5>
        </Card.Header>
        <Card.Body>
          <Carousel fade controls={false} indicators={false} interval={10000} pause="hover">
            {randomReasons.map((reason, index) => {
              // Cycle through the color palette.
              const bgColor = colors[index % colors.length];
              return (
                <Carousel.Item key={index}>
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ 
                      height: '100px', 
                      backgroundColor: bgColor, 
                      color: "#fff", 
                      borderRadius: '5px',
                      padding: '10px'
                    }}
                  >
                    <p className="text-center mb-0" style={{ fontSize: '1.1rem' }}>{reason}</p>
                  </div>
                </Carousel.Item>
              );
            })}
          </Carousel>
        </Card.Body>
      </Card>
    );
}

export default DidYouKnowSlider

