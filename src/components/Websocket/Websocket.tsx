import { Button, FrameHexagon, Text } from '@arwes/core';
import {
  BASE_PATH,
  Game,
  GameApi,
  GameStatus,
  Notification,
} from '@codecharacter-2022/client';
import { Stomp } from '@stomp/stompjs';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-simple-toasts';
import { apiConfig } from '../../api/ApiConfig';
import { useAuth } from '../../providers/AuthProvider';

const Websocket = () => {
  const { userId } = useAuth();

  const gameApi = new GameApi(apiConfig);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      return;
    }
    const baseUrl = `${BASE_PATH.replace('http', 'ws')}/ws`;
    const wsClient = Stomp.over(() => new WebSocket(baseUrl));
    wsClient.brokerURL = baseUrl;

    wsClient.onConnect = () => {
      wsClient.subscribe(`/notifications/${userId}`, message => {
        const notification = JSON.parse(message.body) as Notification;
        toast(
          <Button FrameComponent={FrameHexagon} palette="primary">
            <h6>{notification.title}</h6>
            <Text>{notification.content}</Text>
          </Button>,
        );
        message.ack();
      });

      wsClient.subscribe(`/updates/${userId}`, message => {
        const game = JSON.parse(message.body) as Game;
        switch (game.status) {
          case GameStatus.Executing:
            toast(
              <Button FrameComponent={FrameHexagon} palette="primary">
                <Text>Executing now...</Text>
              </Button>,
            );
            break;
          case GameStatus.Executed:
            toast(
              <Button FrameComponent={FrameHexagon} palette="success">
                <Text>Executed Successfully!</Text>
              </Button>,
            );
            gameApi
              .getGameLogsByGameId(game.id)
              .then(log => {
                navigate('/dashboard', { state: { log } });
              })
              .catch(() => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="error">
                    <Text>Failed to fetch logs!</Text>
                  </Button>,
                );
              });
            break;
          case GameStatus.ExecuteError:
            toast(
              <Button FrameComponent={FrameHexagon} palette="error">
                <Text>Execution Error!</Text>
              </Button>,
            );
            gameApi
              .getGameLogsByGameId(game.id)
              .then(log => {
                navigate('/dashboard', { state: { log } });
              })
              .catch(() => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="error">
                    <Text>Failed to fetch logs!</Text>
                  </Button>,
                );
              });
            break;
          default:
            break;
        }
        message.ack();
      });
    };

    wsClient.activate();

    return () => {
      wsClient.deactivate();
    };
  }, [userId]);

  return null;
};

export default Websocket;
