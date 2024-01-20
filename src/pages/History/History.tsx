import {
  Button,
  CodeBlock,
  FrameHexagon,
  LoadingBars,
  Text,
} from '@arwes/core';
import {
  CodeApi,
  CodeRevision,
  GameMapRevision,
  MapApi,
} from '@codecharacter-2022/client';
import {
  MapDesignerComponent,
  MapDesignerUtils,
} from '@codecharacter-2022/map-designer';
import { useEffect, useState } from 'react';
import { RiSwordFill } from 'react-icons/ri';
import toast from 'react-simple-toasts';
import { apiConfig } from '../../api/ApiConfig';
import SelfMatchModal from '../../components/Modals/SelfMatchModal';
import { useModal } from '../../providers/ModalProvider';

const History = () => {
  const { setModalState } = useModal();
  const [codeRevisions, setCodeRevisions] = useState<CodeRevision[]>([]);
  const [mapRevisions, setMapRevisions] = useState<GameMapRevision[]>([]);
  const [selectedTab, setSelectedTab] = useState<'code' | 'map'>('code');

  const [isLoading, setIsLoading] = useState(true);

  const [selectedCode, setSelectedCode] = useState<CodeRevision | null>(null);
  const [selectedMap, setSelectedMap] = useState<GameMapRevision | null>(null);

  const codeApi = new CodeApi(apiConfig);
  const mapApi = new MapApi(apiConfig);

  useEffect(() => {
    Promise.all([codeApi.getCodeRevisions(), mapApi.getMapRevisions()])
      .then(([codeRevisions, mapRevisions]) => {
        setCodeRevisions(codeRevisions);
        setMapRevisions(mapRevisions);
        if (codeRevisions.length > 0) {
          setSelectedCode(codeRevisions[0]);
        }
        if (mapRevisions.length > 0) {
          setSelectedMap(mapRevisions[0]);
        }
      })
      .catch(() => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="error">
            <Text>Failed to load revisions!</Text>
          </Button>,
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const saveMapCallback = (newMap: Array<Array<number>>) => {
    return newMap;
  };

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minWidth: 0,
        position: 'relative',
        minHeight: 0,
      }}
    >
      <div
        css={{
          flex: 0,
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <Button
          css={{
            opacity: selectedTab === 'code' ? 1 : 0.5,
          }}
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setSelectedTab('code');
              setIsLoading(false);
            }, 500);
          }}
        >
          Code
        </Button>
        <Button
          css={{
            opacity: selectedTab === 'map' ? 1 : 0.5,
          }}
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setSelectedTab('map');
              setIsLoading(false);
            }, 500);
          }}
        >
          Map
        </Button>
      </div>
      <div
        css={{
          position: 'relative',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          minHeight: 0,
          '@media (max-width: 600px)': {
            flexDirection: 'column',
          },
        }}
      >
        <div
          css={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            zIndex: 100,
            opacity: isLoading ? 1 : 0,
            transition: 'opacity 0.5s',
            pointerEvents: isLoading ? 'all' : 'none',
          }}
        >
          <LoadingBars full />
        </div>
        <div
          css={{
            flexBasis: '30%',
            padding: '1em',
            minHeight: 0,
            overflowY: 'auto',
            '@media (max-width: 1000px)': {
              flexBasis: '50%',
            },
          }}
        >
          {selectedTab === 'code'
            ? codeRevisions.map(revision => (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                <FrameHexagon
                  animator={{ animate: false }}
                  key={revision.id}
                  css={{
                    width: '100%',
                    marginBottom: '0.5em',
                    cursor: 'pointer',
                    color:
                      selectedCode?.id === revision.id ? 'white' : 'inherit',
                  }}
                  onClick={() => setSelectedCode(revision)}
                >
                  <div css={{ position: 'absolute', top: 0, right: 0 }}>
                    <RiSwordFill
                      css={{ fontSize: '1.3em' }}
                      onClick={() => {
                        setModalState({
                          isOpen: true,
                          content: (
                            <SelfMatchModal codeRevisionId={revision.id} />
                          ),
                        });
                      }}
                    />
                  </div>
                  <h6
                    css={{
                      color:
                        selectedCode?.id === revision.id ? 'white' : 'inherit',
                    }}
                  >
                    {revision.message}
                  </h6>
                  <span>{new Date(revision.createdAt).toLocaleString()}</span>
                </FrameHexagon>
              ))
            : mapRevisions.map(revision => (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                <FrameHexagon
                  animator={{ animate: false }}
                  key={revision.id}
                  css={{
                    width: '100%',
                    marginBottom: '0.5em',
                    cursor: 'pointer',
                    color:
                      selectedMap?.id === revision.id ? 'white' : 'inherit',
                  }}
                  onClick={() => {
                    setSelectedMap(revision);
                    MapDesignerUtils.loadMap(JSON.parse(revision.map));
                  }}
                >
                  <div css={{ position: 'absolute', top: 0, right: 0 }}>
                    <RiSwordFill
                      css={{ fontSize: '1.3em' }}
                      onClick={() => {
                        setModalState({
                          isOpen: true,
                          content: (
                            <SelfMatchModal mapRevisionId={revision.id} />
                          ),
                        });
                      }}
                    />
                  </div>
                  <h6
                    css={{
                      color:
                        selectedMap?.id === revision.id ? 'white' : 'inherit',
                    }}
                  >
                    {revision.message}
                  </h6>
                  <span>{new Date(revision.createdAt).toLocaleString()}</span>
                </FrameHexagon>
              ))}
        </div>
        <div
          css={{
            flexBasis: '70%',
            padding: '1em',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            '& div': {
              minWidth: 0,
              minHeight: 0,
              margin: 0,
            },
            '@media (max-width: 1000px)': {
              flexBasis: '50%',
            },
          }}
        >
          {selectedTab === 'code' ? (
            !isLoading && (
              <CodeBlock
                css={{ height: '100%' }}
                lang={selectedCode?.language ?? 'c'}
              >
                {selectedCode?.code ?? ''}
              </CodeBlock>
            )
          ) : (
            <MapDesignerComponent
              saveMapCallback={saveMapCallback}
              readonly={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
