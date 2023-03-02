import {
  Button,
  CodeBlock,
  Figure,
  FrameHexagon,
  LoadingBars,
  Text,
} from '@arwes/core';
import {
  ChallengeType,
  DailyChallengeGetRequest as DailyChallenge,
  DailyChallengesApi,
  GameMapType,
  Language,
  MapApi,
} from '@codecharacter-2023/client';
import {
  MapDesignerComponent,
  MapDesignerUtils,
} from '@codecharacter-2023/map-designer';
import { useEffect, useState } from 'react';
import toast from 'react-simple-toasts';
import SplitPane from 'react-split-pane';
import { apiConfig } from '../../api/ApiConfig';
import MonacoEditor from '../../components/MonacoEditor/MonacoEditor';
import Select from '../../components/Select/Select';

const DailyChallenges = () => {
  const dailyChallengesApi = new DailyChallengesApi(apiConfig);
  const mapApi = new MapApi(apiConfig);

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>();

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    Language.Cpp,
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage.toUpperCase() as Language);
  };

  useEffect(() => {
    setIsLoading(true);
    dailyChallengesApi
      .getDailyChallenge()
      .then(dailyChallenge => {
        setDailyChallenge(dailyChallenge);
        if (dailyChallenge.challType === ChallengeType.Code) {
          mapApi
            .getLatestMap(GameMapType.DailyChallenge)
            .then(latestMap => {
              MapDesignerUtils.loadMap(JSON.parse(latestMap.map));
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      })
      .catch(() => {
        setIsLoading(false);
        toast(
          <Button FrameComponent={FrameHexagon} palette="error">
            <Text>Failed to load daily challenge!</Text>
          </Button>,
        );
      });
  }, []);

  function handleSaveMap(map: number[][]): void {
    toast(
      <Button FrameComponent={FrameHexagon} palette="primary">
        <Text>Saving Latest Map...</Text>
      </Button>,
    );
    mapApi
      .updateLatestMap({
        map: JSON.stringify(map),
        lock: false,
        mapImage: '',
        mapType: GameMapType.DailyChallenge,
      })
      .then(() => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="success">
            <Text>Map Saved Successfully!</Text>
          </Button>,
        );
      })
      .catch(() => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="error">
            <Text>Failed to save map!</Text>
          </Button>,
        );
      });
  }

  function handleSubmitMap(map: number[][]): void {
    toast(
      <Button FrameComponent={FrameHexagon} palette="primary">
        <Text>Submitting Map...</Text>
      </Button>,
    );
    mapApi
      .updateLatestMap({
        map: JSON.stringify(map),
        lock: true,
        mapType: GameMapType.DailyChallenge,
        mapImage: '',
      })
      .then(() => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="success">
            <Text>Map Submitted Successfully! Starting Match...</Text>
          </Button>,
        );
        dailyChallengesApi
          .createDailyChallengeMatch({
            value: JSON.stringify(map),
          })
          .then(() => {
            toast(
              <Button FrameComponent={FrameHexagon} palette="success">
                <Text>Match Request Submitted!</Text>
              </Button>,
            );
          })
          .catch(() => {
            toast(
              <Button FrameComponent={FrameHexagon} palette="error">
                <Text>Failed to start match!</Text>
              </Button>,
            );
          });
      });
  }

  return (
    <div css={{ position: 'relative', width: '100%', height: '100%' }}>
      <SplitPane
        split="vertical"
        defaultSize="50%"
        css={{
          '& div': {
            minWidth: 0,
          },
        }}
      >
        <div css={{ width: '100%', height: '100%', padding: '1rem' }}>
          {isLoading ? (
            <LoadingBars full />
          ) : (
            <div
              css={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h3>{dailyChallenge?.challName}</h3>
              {dailyChallenge?.completionStatus && (
                <Button FrameComponent={FrameHexagon} palette="success">
                  Completed
                </Button>
              )}
              <Text>{dailyChallenge?.description}</Text>
              {dailyChallenge?.challType === ChallengeType.Code ? (
                <div
                  css={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <Select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  >
                    <option value={Language.Cpp}>C++</option>
                    <option value={Language.Python}>Python</option>
                    <option value={Language.Java}>Java</option>
                  </Select>
                  <CodeBlock lang={selectedLanguage}>
                    {selectedLanguage === Language.Cpp
                      ? dailyChallenge?.chall?.cpp
                      : selectedLanguage === Language.Python
                      ? dailyChallenge?.chall?.python
                      : dailyChallenge?.chall?.java}
                  </CodeBlock>
                </div>
              ) : dailyChallenge?.challType === ChallengeType.Map ? (
                <Figure src={dailyChallenge?.chall?.image ?? ''} />
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
        <div css={{ minWidth: 0 }}>
          {isLoading ? (
            <LoadingBars full />
          ) : dailyChallenge?.challType === ChallengeType.Code ? (
            <MapDesignerComponent
              saveMapCallback={handleSaveMap}
              commitMapCallback={() =>
                toast(
                  <Button FrameComponent={FrameHexagon} palette="error">
                    <Text>
                      Committing map is not supported for daily challenges!
                    </Text>
                  </Button>,
                )
              }
              submitMapCallback={handleSubmitMap}
              readonly={false}
            />
          ) : dailyChallenge?.challType === ChallengeType.Map ? (
            <MonacoEditor isDailyChallenge />
          ) : (
            <div />
          )}
        </div>
      </SplitPane>
    </div>
  );
};

export default DailyChallenges;
