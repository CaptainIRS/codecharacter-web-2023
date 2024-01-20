import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, LoadingBars, FrameHexagon, Text, Card } from '@arwes/core';
import {
  CodeRevision,
  GameMapRevision,
  CodeApi,
  MapApi,
  MatchApi,
  MatchMode,
} from '@codecharacter-2022/client';
import { createRef, useEffect, useState } from 'react';
import toast from 'react-simple-toasts';
import { apiConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import Select from '../Select/Select';

const SelfMatchModal = ({
  codeRevisionId,
  mapRevisionId,
}: {
  codeRevisionId?: string;
  mapRevisionId?: string;
}) => {
  const { modalState, setModalState } = useModal();

  const codeRevisionRef = createRef<HTMLSelectElement>();
  const mapRevisionRef = createRef<HTMLSelectElement>();

  const [isLoadingRevisions, setIsLoadingRevisions] = useState(true);
  const [codeRevisions, setCodeRevisions] = useState<CodeRevision[]>([]);
  const [mapRevisions, setMapRevisions] = useState<GameMapRevision[]>([]);

  const codeApi = new CodeApi(apiConfig);
  const mapApi = new MapApi(apiConfig);
  const matchApi = new MatchApi(apiConfig);

  useEffect(() => {
    setIsLoadingRevisions(true);
    Promise.all([codeApi.getCodeRevisions(), mapApi.getMapRevisions()])
      .then(([codeRevisions, mapRevisions]) => {
        setIsLoadingRevisions(false);
        setCodeRevisions(codeRevisions);
        setMapRevisions(mapRevisions);
      })
      .catch(() => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="error">
            <Text>Failed to load revisions!</Text>
          </Button>,
        );
      });
  }, []);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Create self-match"
        css={{ width: 'min(80vw, 400px)', minWidth: 0, maxHeight: '80vh' }}
        options={
          <div>
            <Button
              palette="error"
              onClick={() => setModalState({ isOpen: false })}
              css={{ marginRight: '1rem' }}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              palette="success"
              onClick={() => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="primary">
                    <Text>Submitting Match Request...</Text>
                  </Button>,
                );
                matchApi
                  .createMatch({
                    codeRevisionId:
                      (codeRevisionRef.current?.value || 'latest') === 'latest'
                        ? undefined
                        : codeRevisionRef.current?.value,
                    mapRevisionId:
                      (mapRevisionRef.current?.value || 'latest') === 'latest'
                        ? undefined
                        : mapRevisionRef.current?.value,
                    mode: MatchMode.Self,
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
                        <Text>Failed to submit match request!</Text>
                      </Button>,
                    );
                  });
                setModalState({ isOpen: false });
              }}
            >
              <Text>Run</Text>
            </Button>
          </div>
        }
      >
        {isLoadingRevisions ? (
          <LoadingBars full />
        ) : (
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Select
              value={codeRevisionId || 'latest'}
              labelText="Code Version"
              selectRef={codeRevisionRef}
            >
              <option value="latest">Latest Code</option>
              {codeRevisions.map(revision => (
                <option value={revision.id} key={revision.id}>
                  Commit: {revision.message}
                </option>
              ))}
            </Select>
            <Select
              value={mapRevisionId || 'latest'}
              labelText="Map Version"
              selectRef={mapRevisionRef}
            >
              <option value="latest">Latest Map</option>
              {mapRevisions.map(revision => (
                <option value={revision.id} key={revision.id}>
                  Commit: {revision.message}
                </option>
              ))}
            </Select>
          </div>
        )}
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default SelfMatchModal;
