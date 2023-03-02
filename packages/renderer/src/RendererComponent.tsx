import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { events, RendererEvents } from './events/EventEmitter';
import { Parameters } from './Parameters';
import { Renderer } from './Renderer';
import {
  ArwesThemeProvider,
  FrameBox,
  StylesBaseline,
  Text,
} from '@arwes/core';
import {
  FaPlay,
  FaPause,
  FaFastForward,
  FaFastBackward,
  FaRedo,
} from 'react-icons/fa';

const RendererLayer = createComponent(React, 'cc-renderer', Renderer);

const StatsText = () => {
  const [turns, setTurns] = React.useState(0);
  const [coins, setCoins] = React.useState(0);
  const [destruction, setDestruction] = React.useState(0);

  React.useEffect(() => {
    const onCoinsUpdated = (coins: number) => {
      setCoins(coins);
      events.removeAllListeners(RendererEvents.CHANGE_COINS);
      events.once(RendererEvents.CHANGE_COINS, onCoinsUpdated);
    };
    events.once(RendererEvents.CHANGE_COINS, onCoinsUpdated);
  }, [coins]);

  React.useEffect(() => {
    const onTurnsUpdated = (turns: number) => {
      setTurns(turns);
      events.removeAllListeners(RendererEvents.NEXT_TURN);
      events.once(RendererEvents.NEXT_TURN, onTurnsUpdated);
    };
    events.once(RendererEvents.NEXT_TURN, onTurnsUpdated);
  }, [turns]);

  React.useEffect(() => {
    const onDestructionUpdated = (destruction: number) => {
      setDestruction(destruction);
      events.removeAllListeners(RendererEvents.CHANGE_DESTRUCTION);
      events.once(RendererEvents.CHANGE_DESTRUCTION, onDestructionUpdated);
    };
    events.once(RendererEvents.CHANGE_DESTRUCTION, onDestructionUpdated);
  }, [destruction]);

  return (
    <Text
      style={{
        textAlign: 'right',
        fontFamily: 'monospace',
      }}
    >
      Turn : {String(turns).padStart(8, '\xa0')}
      <br />
      Coins : {String(coins).padStart(8, '\xa0')}
      <br />
      Destruction : {String(destruction.toFixed(2)).padStart(6, '\xa0')} %
    </Text>
  );
};

export default function RendererComponent(): JSX.Element {
  const [isPaused, setPaused] = React.useState(false);

  React.useEffect(() => {
    const onResetUi = () => {
      setPaused(false);
      events.removeAllListeners(RendererEvents.RESET_UI);
      events.once(RendererEvents.RESET_UI, onResetUi);
    };
    events.once(RendererEvents.RESET_UI, onResetUi);
  }, [isPaused]);

  return (
    <ArwesThemeProvider>
      <StylesBaseline />
      <div
        style={{
          position: 'absolute',
          padding: '1rem',
          width: '100%',
          alignItems: 'center',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.2rem',
            pointerEvents: 'auto',
            alignContent: 'center',
          }}
        >
          <div
            key="play-pause"
            onClick={() => {
              if (isPaused) {
                setPaused(false);
                events.emit(RendererEvents.RESUME);
              } else {
                setPaused(true);
                events.emit(RendererEvents.PAUSE);
              }
            }}
          >
            <FrameBox>{isPaused ? <FaPlay /> : <FaPause />}</FrameBox>
          </div>
          <div
            key="slow-down"
            onClick={() => {
              Parameters.timePerTurn *= 1.2;
            }}
          >
            <FrameBox>
              <FaFastBackward />
            </FrameBox>
          </div>
          <div
            key="speed-up"
            onClick={() => {
              Parameters.timePerTurn = Math.max(
                100,
                Parameters.timePerTurn / 1.2,
              );
            }}
          >
            <FrameBox>
              <FaFastForward />
            </FrameBox>
          </div>
          <div
            key="reset"
            onClick={() => {
              events.emit(RendererEvents.RESET);
              setPaused(false);
            }}
          >
            <FrameBox>
              <FaRedo />
            </FrameBox>
          </div>
        </div>
        <StatsText />
      </div>

      <RendererLayer
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </ArwesThemeProvider>
  );
}
