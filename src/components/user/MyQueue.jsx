import React, { useState, useEffect, useRef } from "react";
import { Card, Alert, ProgressBar, Button } from "react-bootstrap";
import Confetti from "react-confetti";
import DidYouKnowSlider from "./DidYouKnowSlider";
import { connection } from "../../services/SignalRConn";

export const MyQueue = ({ myQueue, events, updateLineInfo }) => {
  const event = events.find((ev) => ev.id === myQueue.eventId);
  console.log("events: ", events);
  console.log("myQueue: ", myQueue);

  const calculateProgress = (position) => {
    if (position <= 1) return 100;
    return Math.min(Math.floor(100 / position), 99);
  };

  const progress = calculateProgress(myQueue.position);
  console.log("progress: ", progress);
  const showConfetti = myQueue.timeTillYourTurn === 0;

  // Track window dimensions for the Confetti component.
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // State to control the display of the up arrow indicators.
  const [showPositionArrow, setShowPositionArrow] = useState(false);
  const [showWaitTimeArrow, setShowWaitTimeArrow] = useState(false);

  // useRef to store previous values.
  const prevPositionRef = useRef(myQueue.position);
  const prevTimeRef = useRef(myQueue.timeTillYourTurn);

  // Compare the new position with the previous value.
  useEffect(() => {
    if (myQueue.position < prevPositionRef.current) {
      setShowPositionArrow(true);
      setTimeout(() => setShowPositionArrow(false), 25000);
    }
    prevPositionRef.current = myQueue.position;
  }, [myQueue.position]);

  // Compare the new timeTillYourTurn with the previous value.
  useEffect(() => {
    if (myQueue.timeTillYourTurn < prevTimeRef.current) {
      setShowWaitTimeArrow(true);
      setTimeout(() => setShowWaitTimeArrow(false), 25000);
    }
    prevTimeRef.current = myQueue.timeTillYourTurn;
  }, [myQueue.timeTillYourTurn]);

  // Listen for SignalR position updates.
  useEffect(() => {
    const handlePositionUpdate = (positionUpdate) => {
      console.log(positionUpdate);
      updateLineInfo(positionUpdate);
    };

    connection.on("ReceivePositionUpdate", handlePositionUpdate);
    return () => {
      connection.off("ReceivePositionUpdate", handlePositionUpdate);
    };
  }, [updateLineInfo]);

  // Update window dimensions on resize.
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!event) {
    return (
      <Alert variant="warning" className="mt-4">
        You're currently not on any Queue at the moment.
      </Alert>
    );
  }

  return (
    <Card className="mt-4">
      {/* Confetti component that shows when timeTillYourTurn is 0 */}
      {showConfetti && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.2}
        />
      )}
      <Card.Header>
        <h3>{event.title} Queue</h3>
      </Card.Header>
      <Card.Body>
        <p>
          Your Position: {myQueue.position}{" "}
          {showPositionArrow && (
            <span style={{ color: "#2ecc71", fontSize: "1.3rem", marginLeft: "8px" }}>
              ↑
            </span>
          )}
        </p>
        <p>
          Estimated Wait Time: {myQueue.timeTillYourTurn} mins{" "}
          {showWaitTimeArrow && (
            <span style={{ color: "#2ecc71", fontSize: "1.3rem", marginLeft: "6px" }}>
              ↑
            </span>
          )}
        </p>
        {progress < 100 ? (
          <>
            <ProgressBar
              now={progress}
              label={`${Math.floor(progress)}%`}
              animated
              className="mb-3"
            />
            <DidYouKnowSlider />
          </>
        ) : (
          <Alert variant="success" className="mb-3" style={{ fontSize: "1.2rem" }}>
            You're next in line! Thanks for using SwiftLine ⚡😁
          </Alert>
        )}
        
      </Card.Body>
    </Card>
  );
};

export default MyQueue;


// import React, { useState, useEffect } from "react";
// import { Card, Alert, ProgressBar, Button } from "react-bootstrap";
// import Confetti from "react-confetti";
// import DidYouKnowSlider from "./DidYouKnowSlider";
// import { connection } from "../../services/SignalRConn";


// export const MyQueue = ({ myQueue, events, updateLineInfo }) => {
//   const event = events.find((ev) => ev.id === myQueue.eventId);
//   console.log("events: ", events);
//   console.log("myQueue: ", myQueue);

//   const calculateProgress = (position) => {
//     if (position <= 1) return 100;
//     return Math.min(Math.floor(100 / position), 99);
//   };

//   const progress = calculateProgress(myQueue.position);
//   console.log("progress: ", progress);
//   const showConfetti = myQueue.timeTillYourTurn === 0;

//   // Track window dimensions for the Confetti component.
//   const [windowDimension, setWindowDimension] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight,
//   });
 
//    connection.on("ReceivePositionUpdate", (positionUpdate) => {
//         console.log(positionUpdate)
//         updateLineInfo(positionUpdate);
//     });

//   useEffect(() => {
//     const handleResize = () => {
//       setWindowDimension({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Refresh button: fetch the latest queue data from the API and update state.
//   // const getLineInfo = () => {
//   //   lineInfo(myQueue)
//   //     .then((response) => {
//   //       console.log("eventQueueInfo-New: ", response.data.data);
//   //       // updateMyQueue is assumed to update the myQueue object with the new data.
       
//   //     })
//   //     .catch((error) => {
//   //       console.error(error);
//   //     });
//   // };

//   if (!event) {
//     return (
//       <Alert variant="warning" className="mt-4">
//         You're currently not on any Queue at the moment.
//       </Alert>
//     );
//   }

//   return (
//     <Card className="mt-4">
//       {/* Confetti component that shows when progress reaches 100% */}
//       {showConfetti && (
//         <Confetti
//           width={windowDimension.width}
//           height={windowDimension.height}
//           recycle={false}
//           numberOfPieces={400}
//           gravity={0.2}
//         />
//       )}
//       <Card.Header>
//         <h3>{event.title} Queue</h3>
//       </Card.Header>
//       <Card.Body>
//         <p>Your Position: {myQueue.position}</p>
//         <p>Estimated Wait Time: {myQueue.timeTillYourTurn} mins</p>
//         {progress < 100 ? (
//           <>
//             <ProgressBar
//               now={progress}
//               label={`${Math.floor(progress)}%`}
//               animated
//               className="mb-3"
//             />
//             <DidYouKnowSlider />
//           </>
//         ) : (
//           <Alert
//             variant="success"
//             className="mb-3"
//             style={{ fontSize: "1.2rem" }}
//           >
//             You're next in line! Thanks for using SwiftLine ⚡😁
//           </Alert>
//         )}
       
//       </Card.Body>
//     </Card>
//   );
// };

// export default MyQueue;
