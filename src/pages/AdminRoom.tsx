import { useHistory, useParams } from 'react-router-dom';

import logoImg from "../assets/images/logo.svg";
import logoWhiteImg from "../assets/images/logo_white.svg";
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';

import Switch from "react-switch";
import { Button } from "../components/Button";
import { RoomCode } from "../components/RoomCode";
import { Question } from "../components/Question";
//import { useAuth } from '../hooks/useAuth';
import { useTheme } from "../hooks/useTheme";
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';

import "../styles/room.scss";
import { useEffect } from 'react';

type RoomParams = {
    id: string;
}

export function AdminRoom() {
  // const { user } = useAuth();
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { title, questions } = useRoom(roomId);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (theme === "light") {
      document.body.style.backgroundColor = "#fefefe";
    } else {
      document.body.style.backgroundColor = "#1A202C";
    }
  }, [theme]);

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.get().then(room => {
      if(room.val() === null){
        history.push('/');
        return;
      }

      if(room.val().endedAt) {
        history.push('/');
      }
    })
  }, [roomId])

  async function handleEndRoom() {
    if (window.confirm('Tem certeza que você deseja excluir esta sala?')) {
      await database.ref(`rooms/${roomId}`).update({
        endedAt: new Date(),
      })

      history.push('/');
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    }
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    });
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    });
  }

  return (
    <div id="page-room">
      <header>
        <div className={`content ${theme}`}>
          <img src={theme === "light" ? logoImg : logoWhiteImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button isOutlined onClick={handleEndRoom}>Encerrar Sala</Button>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <div className="room-title">
          <h1 className={theme}>Sala {title}</h1>
          { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
          </div>
          <div>
            <Switch
              className="switch"
              onChange={toggleTheme}
              checked={theme === "light"}
              checkedIcon={false}
              uncheckedIcon={false}
              onColor={"#835afd"}
            />
          </div>
        </div>

        <div className={`question-list ${theme}`}>
          {questions.map((question => {
            return (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                {!question.isAnswered && (
                  <>
                    <button
                    type="button"
                    onClick={() => handleCheckQuestionAsAnswered(question.id)}
                    >
                      <img src={checkImg} alt="Marcar Pergunta como respondida" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHighlightQuestion(question.id)}
                    >
                      <img src={answerImg} alt="Dar destaque à pergunta" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover Pergunta" />
                </button>
              </Question>
            );
          }))}
        </div>
      </main>
    </div>
  );
}
