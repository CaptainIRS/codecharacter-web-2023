import { RendererComponent, RendererUtils } from '@codecharacter-2023/renderer';
import { useEffect, useState } from 'react';
import { LazyLog, ScrollFollow } from 'react-lazylog';
import { useLocation } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import MonacoEditor from '../../components/MonacoEditor/MonacoEditor';

const CodeEditor = () => {
  const [log, setLog] = useState(
    'No log available. Please run a game to see the log.',
  );

  RendererUtils.setUpdateLogCallback((log: string) => {
    setLog(log.replace(/\u001b\[K/g, ''));
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      const { log } = location.state as { log: string };
      RendererUtils.loadLog(log);
    }
  }, [location]);

  return (
    <div css={{ position: 'relative', width: '100%', height: '100%' }}>
      <SplitPane split="vertical" defaultSize="50%">
        <MonacoEditor />
        <SplitPane split="horizontal" defaultSize="50%">
          <RendererComponent />
          <div css={{ width: '100%', height: '100%', whiteSpace: 'nowrap' }}>
            <ScrollFollow
              startFollowing={true}
              render={({ follow, onScroll }) => (
                <LazyLog
                  text={log}
                  selectableLines
                  follow={follow}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  onScroll={onScroll}
                  css={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                  }}
                  stream
                />
              )}
            />
          </div>
        </SplitPane>
      </SplitPane>
    </div>
  );
};

export default CodeEditor;
