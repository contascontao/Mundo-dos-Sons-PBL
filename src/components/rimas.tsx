import React, { useState } from "react";
import "../css/rimas.css";
import AnimatedPages from "./animated";
import { useNavigate } from "react-router";
import { UserContext } from "./UserContext";
import { addAnswersToDB } from "./firebase";
import { Stopwatch } from "ts-stopwatch";
import { getConfetti, getFireworks, getStars } from "./congrats";
import "bootstrap/dist/css/bootstrap.css";

const resposta4: string[] = [];
const Tempos: number[] = [];
let stopwatch = new Stopwatch();

enum GameState {
  STARTING,
  RUNNING,
  BETWEEN_LEVELS,
  COMPLETED,
}

interface StartScreenProps {
  onStart: () => void;
}

interface BetweenLevelsScreenProps {
  onNextLevel: () => void;
}

interface GameOverProps {
  onNextgame: () => void;
}

const GameOverScreen: React.FC<GameOverProps> = ({ onNextgame }) => (
  <div className="app-container">
 {getConfetti()}
 {getFireworks()}
 {getStars()}
 <div className="Complete">
 <h1>Fase Completa!</h1>
 <button className="Button btn btn-outline-primary" onClick={onNextgame}>Proximo Jogo</button>
  </div>
  </div>
 );

const BetweenLevelsScreen: React.FC<BetweenLevelsScreenProps> = ({
  onNextLevel,
}) => (
  <div className="app-container">
  {getConfetti()}
  {getFireworks()}
  {getStars()}
  <div className="Congrats ">
    <h1>Parabens!</h1>
    <button className="Button btn btn-outline-primary" onClick={onNextLevel}>Proxima Fase</button>
  </div>
  </div>
);

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => (
  <div className="appContainer">
    <h1>Desafio 4: Identifique as Rimas</h1>
    <button className="btn btn-outline-success" onClick={onStart}>Jogar</button>
  </div>
);

const Rimas = () => {
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [parabens, setParabens] = useState(false);
  const [runAnimation, setRunAnimation] = useState(false);
  const [button, setbutton] = useState("button");
  const { userId } = React.useContext(UserContext);
  const [gameState, setGameState] = useState<GameState>(GameState.STARTING);

  console.log(gameState);

  const imagesMain = ["areia", "golfinho", "farol", "tubarão", "praia"];
  const imageMainSrc = "src/img/" + imagesMain[currentSyllableIndex] + ".png";

  const imagesSec = [
    ["sereia", "tartaruga", "barco", "pirata"],
    ["cavalo-marinho", "polvo", "concha", "estrela-do-mar"],
    ["baleia", "sol", "concha", "boia"],
    ["alga", "caranguejo", "camarão", "gaivota"],
    ["cavalo-marinho", "concha", "toalha", "raia"],
  ];
  const imageSecSrc = "src/img/" + imagesSec[currentSyllableIndex][0] + ".png";
  const num_correto = ["sereia", "cavalo-marinho", "sol", "camarao", "raia"];
  const imageMain = imagesMain[currentSyllableIndex];
  const soundMain = imagesMain.map((image) => `src/snd/${image}.mp3`);
  const soundSec = imagesSec.map((image) => `src/snd/${image}.mp3`);
  const imageSec = imagesSec[currentSyllableIndex];
  const navigate = useNavigate();

  interface SyllableProps {
    image: string;
  }

  const Syllable: React.FC<SyllableProps> = ({ image }) => (
    <div>
      <div className="syllable">
        <span>
          <img
            className="microfone"
            src="src/img/mic.png"
            onClick={() => playSound(image)}
          ></img>
          <img className="syllableImage" src={imageMainSrc} alt={image}></img>
        </span>
      </div>
    </div>
  );

  interface ImagesProps {
    images: string[];
    onImageClick: (image: string) => void;
  }
  const Images: React.FC<ImagesProps> = ({ images, onImageClick }) => (
    <div className="images">
      {images.map((image, index) => (
        <div key={index} className="image-container">
          <img
            className="image"
            src={`src/img/${image}.png`}
            alt={image}
            onClick={() => onImageClick(image)}
          ></img>
          <img
            className="microfone"
            src="src/img/mic.png"
            onClick={() => playSound(image)}
          ></img>
        </div>
      ))}
    </div>
  );

  const handleImageClick = (image: string) => {
    console.log(image);
    resposta4.push(image);
    console.log(num_correto[currentSyllableIndex]);
    if (image === num_correto[currentSyllableIndex]) {
      console.log("acertou");
    } else {
      console.log("errou");
    }
    handleNextPhase();
  };

  const handleNextPhase = () => {
    stopwatch.stop();
    Tempos.push(stopwatch.getTime());
    stopwatch.reset();
    console.log(Tempos);
    if (currentSyllableIndex < imagesMain.length - 1) {
      setGameState(GameState.BETWEEN_LEVELS);
    } else {
      setGameState(GameState.COMPLETED);
      let answerObj = resposta4.slice(0);
      let tempoObj = Tempos.slice(0);

      addAnswersToDB("perguntas4", {
        userId: userId,
        answerObj: answerObj,
        tempoObj: tempoObj,
      });
    }
  };

  function playSound(image: string) {
    const audio = new Audio(`src/snd/${image}.mp3`);
    audio.play();
    console.log("playing sound:" + `src/snd/${image}.mp3`);
  }

  return (
    <AnimatedPages key={gameState}>
      {gameState === GameState.STARTING && (
        <StartScreen
          onStart={() => {
            setGameState(GameState.RUNNING);
            stopwatch.start();
          }}
        />
      )}
      {gameState === GameState.RUNNING && !parabens && (
        <div className="container">
          <div>
            <Syllable image={imageMain} />
            <div className="meio"></div>
            <Images
              images={imagesSec[currentSyllableIndex]}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      )}
      {parabens && (
        <div>
          <span>Parabens!</span>
          <button onClick={handleNextPhase}>Next Syllable</button>
        </div>
      )}
      {gameState === GameState.BETWEEN_LEVELS && (
        <BetweenLevelsScreen
          onNextLevel={() => {
            setGameState(GameState.RUNNING);
            setCurrentSyllableIndex(currentSyllableIndex + 1);
            stopwatch.start();
          }}
        />
      )}
      {gameState === GameState.COMPLETED && (
        <GameOverScreen onNextgame={() => navigate("/sons")} />
      )}
    </AnimatedPages>
  );
};

export default Rimas;
