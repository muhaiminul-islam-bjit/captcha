import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import './Captcha.css';

const GRID_SIZE = 4; // 4x4 grid for the locked box
const MAX_ATTEMPTS = 3; // Maximum attempts before blocking

export const Captcha: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [squarePosition, setSquarePosition] = useState({ top: 0, left: 0 });
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lockedPosition, setLockedPosition] = useState({ top: 0, left: 0 });
  const [sectorsWithShapes, setSectorsWithShapes] = useState<{ [sector: number]: { shape: string, color: string } }>({});
  const [shapeToSelect, setShapeToSelect] = useState<string>(''); // Shape to identify
  const [colorToSelect, setColorToSelect] = useState<string>(''); // Color to identify
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS); // Attempts remaining
  const [blocked, setBlocked] = useState<boolean>(false); // Block user on too many failed attempts
  const [isCaptchaPassed, setIsCaptchaPassed] = useState(false); // Flag for passing CAPTCHA

  // Randomly move the box every second until it's locked
  useEffect(() => {
    const moveSquare = () => {
      const containerWidth = 400; // Adjust based on captcha-container size
      const containerHeight = 300;
      const squareSize = 150;
      
      const maxX = containerWidth - squareSize;
      const maxY = containerHeight - squareSize;

      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      
      setSquarePosition({ top: y, left: x });
    };
    if (!isCaptured && !blocked) {
      const intervalId = setInterval(moveSquare, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isCaptured, blocked]);

  // Capture image and lock the box
  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setLockedPosition(squarePosition); // Lock the square's position
      randomizeShapesAndColorsInSectors();
      setIsCaptured(true);
    }
  };

  // Randomize the shapes and colors (triangle, square, circle) in half of the sectors
  const randomizeShapesAndColorsInSectors = () => {
    const sectors = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
    const shapes = ['triangle', 'square', 'circle'];
    const colors = ['red', 'green', 'blue'];
    const randomSectorsWithShapes: { [sector: number]: { shape: string, color: string } } = {};

    // Assign shape and color to half of the sectors (randomly selected)
    const shuffledSectors = sectors.sort(() => 0.5 - Math.random()).slice(0, sectors.length / 2);
    shuffledSectors.forEach((sector, index) => {
      randomSectorsWithShapes[sector] = {
        shape: shapes[index % 3],
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    });

    setSectorsWithShapes(randomSectorsWithShapes);

    // Randomly select which shape and color the user needs to identify
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setShapeToSelect(randomShape);
    setColorToSelect(randomColor);
  };

  // Handle sector selection by user
  const handleSectorClick = (sectorIndex: number) => {
    if (selectedSectors.includes(sectorIndex)) {
      // Unselect if already selected
      setSelectedSectors(selectedSectors.filter(i => i !== sectorIndex));
    } else {
      // Select sector
      setSelectedSectors([...selectedSectors, sectorIndex]);
    }
  };

  // Validate if the user correctly selected all sectors with the specified shape and color
  const validateCaptcha = () => {
    const correctSectors = Object.keys(sectorsWithShapes)
      .map(Number)
      .filter(sector => 
        sectorsWithShapes[sector].shape === shapeToSelect && 
        sectorsWithShapes[sector].color === colorToSelect
      );

    const isCorrect = correctSectors.every(sector => selectedSectors.includes(sector)) && selectedSectors.length === correctSectors.length;

    if (isCorrect) {
      setIsCaptchaPassed(true); // Show success message
    } else {
      if (attemptsLeft > 1) {
        setAttemptsLeft(attemptsLeft - 1);
        alert(`Captcha failed! You have ${attemptsLeft - 1} attempts left.`);
        // Allow the user to try again by resetting the validation flow
        setIsCaptured(false);
        setSelectedSectors([]);
      } else {
        setBlocked(true); // Block the user if they've used up all attempts
        alert('Captcha failed! You have been blocked from further attempts.');
      }
    }
  };

  return (
    <div className="captcha-container">
      {isCaptchaPassed ? (
        <p>Successfully passed the CAPTCHA!</p>
      ) : (
        !isCaptured && !blocked ? (
          <>
            {/* Video stream */}
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="video-stream" />
            {/* Moving square */}
            <div className="moving-square" style={{ top: squarePosition.top, left: squarePosition.left }} />
            <div className="button-container">
              <button onClick={captureImage}>Continue</button>
            </div>
          </>
        ) : blocked ? (
          <p>You have been blocked due to too many failed attempts.</p>
        ) : (
          <>
            {/* Captured image with locked square and divided sectors */}
            <img src={capturedImage || ''} alt="Captured" className="captured-image" />
            <p>Select the sectors containing a {shapeToSelect} with {colorToSelect} tint:</p>
            <div className="grid-container" style={{ top: lockedPosition.top, left: lockedPosition.left }}>
              {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
                <div
                  key={i}
                  className={`grid-sector ${selectedSectors.includes(i) ? 'selected' : ''}`}
                  onClick={() => handleSectorClick(i)}
                >
                  {/* Display watermark if the sector has a shape */}
                  {sectorsWithShapes[i] && (
                    <div className="watermark" style={{ color: sectorsWithShapes[i].color }}>
                      {sectorsWithShapes[i].shape === 'circle' ? '○' : sectorsWithShapes[i].shape === 'triangle' ? '▲' : '■'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="button-container">
              <button onClick={validateCaptcha}>Validate</button>
            </div>
          </>
        )
      )}
    </div>
  );
};
