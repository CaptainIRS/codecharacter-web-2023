import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, FrameBox, LoadingBars, Table, Text } from '@arwes/core';
import { MatchApi, Match, Verdict } from '@codecharacter-2022/client';
import { useEffect, useState } from 'react';
import { apiConfig } from '../../api/ApiConfig';
import { FaEye, FaMinus, FaRedo, FaTimes, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../providers/AuthProvider';

const BattleTv = () => {
  const { user } = useAuth();
  const [activate, setActivate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataset, setDataset] = useState<any>([]);

  const matchApi = new MatchApi(apiConfig);

  const getDatasetFromResponse = (response: Match[]) => {
    return response.map((entry, index) => ({
      id: index,
      columns: [
        {
          id: `player1${entry.id}`,
          data: entry.user1.username,
        },
        {
          id: `coinsUsed1${entry.id}`,
          data: [...entry.games][0].coinsUsed,
        },
        {
          id: `destruction1${entry.id}`,
          data: [...entry.games][0].destruction,
        },
        {
          id: `verdict${entry.id}`,
          data:
            entry.matchVerdict === Verdict.Tie ? (
              <Text css={{ color: 'yellow' }}>
                <FaMinus />{' '}
              </Text>
            ) : (entry.matchVerdict === Verdict.Player1 &&
                entry.user1.username === user?.username) ||
              (entry.matchVerdict === Verdict.Player2 &&
                entry.user2?.username === user?.username) ? (
              <Text css={{ color: 'limegreen' }}>
                <FaTrophy />{' '}
              </Text>
            ) : (
              <Text css={{ color: 'red' }}>
                <FaTimes />{' '}
              </Text>
            ),
        },
        {
          id: `view${entry.id}`,
          data: (
            <span>
              <FaEye />{' '}
            </span>
          ),
        },
        {
          id: `destruction2${entry.id}`,
          data:
            [...entry.games][1]?.destruction ?? [...entry.games][0].destruction,
        },
        {
          id: `coinsUsed2${entry.id}`,
          data: [...entry.games][1]?.coinsUsed ?? [...entry.games][0].coinsUsed,
        },
        {
          id: `player2${entry.id}`,
          data: entry.user2?.username ?? user?.username,
        },
      ],
    }));
  };

  useEffect(() => {
    matchApi.getUserMatches().then(response => {
      setDataset(getDatasetFromResponse(response));
      setIsLoading(false);
      setActivate(true);
      setIsFirstLoad(false);
    });
  }, []);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <div
        css={{
          width: '100%',
          height: '100%',
          minWidth: 0,
          position: 'relative',
          overflowX: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {isFirstLoad && (
          <div
            css={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: 100,
            }}
          >
            <LoadingBars full />
          </div>
        )}
        <div css={{ flexGrow: 1 }} />
        <h1
          css={{
            display: 'block',
            padding: '1em 0',
            margin: 0,
          }}
        >
          Battle TV
        </h1>
        {isLoading && (
          <div
            css={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <LoadingBars />
          </div>
        )}
        <div
          css={{
            width: '100%',
            maxWidth: '1200px',
            minWidth: 0,
            fontFamily: 'monospace',
            overflowX: 'auto',
            position: 'relative',
            display: 'flow-root',
            padding: '0 1em',
            flexGrow: 1,
          }}
        >
          <div
            css={{
              minWidth: '1000px',
            }}
          >
            <Table
              css={{ width: '100%', height: '100%' }}
              animator={{ activate }}
              headers={[
                { id: 'player1', data: 'Player 1' },
                { id: 'coinsUsed1', data: 'Coins Used' },
                { id: 'destruction1', data: 'Destruction %' },
                { id: 'verdict', data: '' },
                { id: 'view', data: '' },
                { id: 'destruction2', data: 'Destruction %' },
                { id: 'coinsUsed2', data: 'Coins Used' },
                { id: 'player2', data: 'Player 2' },
              ]}
              dataset={dataset}
              columnWidths={[
                '20%',
                '10%',
                '15%',
                '5%',
                '5%',
                '15%',
                '10%',
                '20%',
              ]}
            />
          </div>
        </div>
        <div
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            padding: '1em 0',
          }}
        >
          <Button
            css={{ marginLeft: '1em' }}
            FrameComponent={FrameBox}
            onClick={() => {
              setActivate(false);
              setIsLoading(true);
              matchApi.getUserMatches().then(response => {
                setDataset(getDatasetFromResponse(response));
                setTimeout(() => {
                  setIsLoading(false);
                  setActivate(true);
                }, 1000);
              });
            }}
          >
            <FaRedo />
          </Button>
        </div>
        <div css={{ flexGrow: 1 }} />
      </div>
    </AnimatorGeneralProvider>
  );
};

export default BattleTv;
