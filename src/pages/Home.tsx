import { useHistory } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import logoWhiteImg from '../assets/images/logo_white.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import { database } from '../services/firebase';

import Switch from 'react-switch';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

import '../styles/auth.scss';

export function Home() {
  const history = useHistory();
  const { user, signInWithGoogle } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const [roomCode, setRoomCode] = useState('');

  async function handleCreateRoom() {
    if(!user) {
      await signInWithGoogle()
    }

    history.push('/rooms/new');
  }

  useEffect(() => {
    if (theme === "light") {
      document.body.style.backgroundColor = "#fefefe";
    } else {
      document.body.style.backgroundColor = "#1A202C";
    }
  }, [theme]);

  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault();

    if (roomCode.trim() === '') {
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      alert('Room does not exists.');
      return;
    }

    if (roomRef.val().endedAt) {
      alert('Room already closed.');
      return;
    }

    if(roomRef.val().authorId === user?.id) {
      history.push(`/admin/rooms/${roomCode}`);
      return;
    }

    history.push(`/rooms/${roomCode}`);
  }

  return (
    <div id="page-auth" className={theme}>
      <aside>
        <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
        <strong>Crie salas de Q&amp;A ao-vivo</strong>
        <p>Tira as dúvidas da sua audiência em tempo-real</p>
      </aside>
      <main>
          <div className="main-content">
              <Switch
                className="switch"
                onChange={toggleTheme}
                checked={theme === 'light'}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor={'#835afd'}
              />
              <img src={theme === 'light' ? logoImg : logoWhiteImg} alt="Letmeask" />
              <button onClick={handleCreateRoom} className="create-room">
                  <img src={googleIconImg} alt="Logo do Google" />
                  Crie sua sala com o Google
              </button>
              <div className="separator">ou entre em uma sala</div>
              <form onSubmit={handleJoinRoom}>
                  <input 
                    className={theme}
                    type="text"
                    placeholder="Digite o código da sala"
                    onChange={event => setRoomCode(event.target.value)}
                    value={roomCode}
                  />
                  <Button type="submit">
                      Entrar na sala
                  </Button>
              </form>
          </div>
      </main>
    </div>
  );
}
