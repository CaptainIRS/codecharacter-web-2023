import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, FrameBox, LoadingBars, Table } from '@arwes/core';
import { LeaderboardApi, LeaderboardEntry } from '@codecharacter-2023/client';
import { useEffect, useState } from 'react';
import { apiConfig } from '../../api/ApiConfig';
import { FaChevronLeft, FaChevronRight, FaRedo } from 'react-icons/fa';
import { RiSwordFill } from 'react-icons/ri';
import LeaderboardMatchModal from '../../components/Modals/LeaderboardMatchModal';
import { useModal } from '../../providers/ModalProvider';

const Leaderboard = () => {
  const [activate, setActivate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataset, setDataset] = useState<any>([]);
  const [page, setPage] = useState(1);
  const { setModalState } = useModal();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const leaderboardApi = new LeaderboardApi(apiConfig);

  const getDatasetFromResponse = (response: LeaderboardEntry[]) => {
    return response.map((entry, index) => ({
      id: (page - 1) * 10 + index,
      columns: [
        { id: `rank${entry.user.username}`, data: (page - 1) * 10 + index + 1 },
        { id: `username${entry.user.username}`, data: entry.user.username },
        {
          id: `match${entry.user.username}`,
          data: (
            <span>
              <RiSwordFill
                css={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
                onClick={() => {
                  setModalState({
                    isOpen: true,
                    content: (
                      <LeaderboardMatchModal username={entry.user.username} />
                    ),
                  });
                }}
              />{' '}
            </span>
          ),
        },
        { id: `rating${entry.user.username}`, data: entry.stats.rating },
        { id: `won${entry.user.username}`, data: entry.stats.wins },
        { id: `lost${entry.user.username}`, data: entry.stats.losses },
        { id: `tied${entry.user.username}`, data: entry.stats.ties },
      ],
    }));
  };

  useEffect(() => {
    leaderboardApi.getLeaderboard(page, 10).then(response => {
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
          Leaderboard
        </h1>
        {isLoading && <LoadingBars full />}
        <div
          css={{
            width: '100%',
            maxWidth: '800px',
            minWidth: 0,
            fontFamily: 'monospace',
            overflowX: 'auto',
            position: 'relative',
            display: 'flow-root',
            padding: '0 1em',
          }}
        >
          <div
            css={{
              minWidth: '700px',
            }}
          >
            <Table
              css={{ width: '100%', height: '100%' }}
              animator={{ activate }}
              headers={[
                { id: 'rank', data: 'Rank' },
                { id: 'username', data: 'Username' },
                { id: 'match', data: '' },
                { id: 'rating', data: 'Rating' },
                { id: 'won', data: 'Won' },
                { id: 'lost', data: 'Lost' },
                { id: 'tied', data: 'Tied' },
              ]}
              dataset={dataset}
              columnWidths={['10%', '35%', '5%', '20%', '10%', '10%', '10%']}
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
            FrameComponent={FrameBox}
            onClick={() => {
              if (page === 1) return;
              setActivate(false);
              setIsLoading(true);
              leaderboardApi.getLeaderboard(page - 1, 10).then(response => {
                setDataset(getDatasetFromResponse(response));
                setTimeout(() => {
                  setIsLoading(false);
                  setActivate(true);
                }, 1000);
              });
              setPage(page - 1);
            }}
          >
            <FaChevronLeft />
          </Button>
          <Button
            FrameComponent={FrameBox}
            onClick={() => {
              setActivate(false);
              setIsLoading(true);
              leaderboardApi.getLeaderboard(page + 1, 10).then(response => {
                setDataset(getDatasetFromResponse(response));
                setTimeout(() => {
                  setIsLoading(false);
                  setActivate(true);
                }, 1000);
              });
              setPage(page + 1);
            }}
          >
            <FaChevronRight />
          </Button>
          <Button
            css={{ marginLeft: '1em' }}
            FrameComponent={FrameBox}
            onClick={() => {
              setActivate(false);
              setIsLoading(true);
              leaderboardApi.getLeaderboard(page, 10).then(response => {
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

export default Leaderboard;
