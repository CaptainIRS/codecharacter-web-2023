import { Button, FrameHexagon, Text } from '@arwes/core';
import {
  CodeApi,
  CodeType,
  DailyChallengesApi,
  Language,
} from '@codecharacter-2023/client';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { rgba } from 'polished';
import { lazy, useEffect, useRef, useState } from 'react';
import toast from 'react-simple-toasts';
import { apiConfig } from '../../api/ApiConfig';
import cppCode from '../../assets/codes/cpp/run.cpp?raw';
import javaCode from '../../assets/codes/java/run.java?raw';
import pythonCode from '../../assets/codes/python/run.py?raw';
import CommitCodeModal from '../Modals/CommitCodeModal';
import SelfMatchModal from '../Modals/SelfMatchModal';
import Select from '../Select/Select';
import { useCode } from '../../providers/CodeProvider';
import { useModal } from '../../providers/ModalProvider';
import { theme } from '../../theme';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  MessageTransports,
  Message,
} from 'monaco-languageclient';

import {
  toSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from 'vscode-ws-jsonrpc';
import { lspUrl } from '../../config/config';
const Editor = lazy(() => import('@monaco-editor/react'));

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

type Workspace = {
  filepath: string;
  folderpath: string;
};

const MonacoEditor = ({
  isDailyChallenge = false,
}: {
  isDailyChallenge?: boolean;
}) => {
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const { setModalState } = useModal();
  const { code, language, setCode, setLanguage } = useCode();

  const setCodeForLanguage = (newLanguage: Language) => {
    if (localStorage.getItem(`${isDailyChallenge}-code-${newLanguage}`)) {
      setCode(
        localStorage.getItem(`${isDailyChallenge}-code-${newLanguage}`) || '',
      );
    } else {
      switch (newLanguage) {
        case Language.Cpp:
        case Language.C:
          setCode(cppCode);
          localStorage.setItem(
            `${isDailyChallenge}-code-${newLanguage}`,
            cppCode,
          );
          break;
        case Language.Java:
          setCode(javaCode);
          localStorage.setItem(
            `${isDailyChallenge}-code-${newLanguage}`,
            javaCode,
          );
          break;
        case Language.Python:
          setCode(pythonCode);
          localStorage.setItem(
            `${isDailyChallenge}-code-${newLanguage}`,
            pythonCode,
          );
          break;
      }
    }
  };

  const codeApi = new CodeApi(apiConfig);
  const dailyChallengesApi = new DailyChallengesApi(apiConfig);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem(`${isDailyChallenge}-language`, newLanguage);
    setCodeForLanguage(newLanguage);
  };

  const handleCodeChange = (newCode: string | undefined) => {
    setCode(newCode || '');
  };

  const createLanguageClient = (transports: MessageTransports) => {
    return new MonacoLanguageClient({
      name: 'Code Editor Language Client',
      clientOptions: {
        documentSelector: ['cpp', 'python', 'java'],
        errorHandler: {
          error: () => ({ action: ErrorAction.Continue }),
          closed: () => ({ action: CloseAction.Restart }),
        },
      },
      connectionProvider: {
        get: () => {
          return Promise.resolve(transports);
        },
      },
    });
  };

  useEffect(() => {
    let languageClient: MonacoLanguageClient;
    let wsClient: WebSocket;
    let contentChangeListener: monaco.IDisposable | undefined;
    loader.config({ monaco });
    loader
      .init()
      .then(monaco => {
        import('../../assets/dark-neon-theme.json').then(data => {
          monaco.editor.defineTheme('dark-black', {
            base: 'vs-dark',
            inherit: data.inherit,
            rules: data.rules,
            colors: data.colors,
          });
          setIsThemeLoaded(true);

          monaco.languages.register({
            id: 'cpp',
            extensions: ['.cpp', '.c', '.h', '.hpp'],
            aliases: ['CPlusPlus', 'cpp', 'CPP', 'C++', 'c++'],
          });

          monaco.languages.register({
            id: 'python',
            extensions: ['.py'],
            aliases: ['Python', 'py'],
          });

          monaco.languages.register({
            id: 'java',
            extensions: ['.java', '.jar', '.class', '.jav'],
            aliases: ['Java', 'java'],
          });

          wsClient = new WebSocket(`${lspUrl}/${language.toLowerCase()}`);
          wsClient.onerror = () => {
            toast(
              <Button FrameComponent={FrameHexagon} palette="error">
                <Text>Auto-complete unavailable. Please try again later.</Text>
              </Button>,
            );
          };
          wsClient.onopen = () => {
            const updater = {
              operation: 'fileUpdate',
              code: code,
            };
            wsClient.send(JSON.stringify(updater));

            const filePathRequest = {
              operation: 'getAbsPath',
            };
            wsClient.send(JSON.stringify(filePathRequest));
            const socket = toSocket(wsClient);

            const filePathMessageReader = new WebSocketMessageReader(socket);
            const writer = new WebSocketMessageWriter(socket);
            filePathMessageReader.listen((message: Message) => {
              const fileInfo = message as Message & Workspace;
              const workspace: Workspace = {
                filepath: fileInfo.filepath,
                folderpath: fileInfo.folderpath,
              };
              filePathMessageReader.dispose();

              MonacoServices.install({
                workspaceFolders: [
                  {
                    uri: monaco.Uri.parse(workspace.folderpath),
                    name: 'workspace',
                    index: 1,
                  },
                ],
              });

              const socket = toSocket(wsClient);
              const reader = new WebSocketMessageReader(socket);
              languageClient = createLanguageClient({
                reader,
                writer,
              });
              reader.onClose(() => languageClient.stop());

              contentChangeListener =
                editorRef.current?.onDidChangeModelContent(() => {
                  const currUpdater = {
                    operation: 'fileUpdate',
                    code: editorRef.current?.getValue(),
                  };
                  wsClient.send(JSON.stringify(currUpdater));
                });

              editorRef.current?.setModel(
                monaco.editor.createModel(
                  code,
                  language.toLowerCase(),
                  monaco.Uri.parse(workspace.filepath),
                ),
              );

              languageClient.start();
            });
          };
        });
      })
      .catch(error =>
        console.error(
          'An error occurred during initialization of Monaco: ',
          error,
        ),
      );
    return () => {
      languageClient.stop(1000).then(() => {
        wsClient.close(1000);
        contentChangeListener?.dispose();
      });
    };
  }, [language]);

  return (
    <>
      <div css={{ width: '100%' }}>
        <div
          css={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignItems: 'end',
            gap: '1rem',
            padding: '0.5rem 1rem 1rem 1rem',
            borderBottom: `1px solid ${rgba(theme.color.border, 0.4)}`,
          }}
        >
          <div css={{ width: '8rem' }}>
            <Select
              value="cpp"
              onChange={newLanguage =>
                handleLanguageChange(newLanguage.toUpperCase() as Language)
              }
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
            </Select>
          </div>
          <Button
            className="save-code-button"
            onClick={() => {
              toast(
                <Button FrameComponent={FrameHexagon} palette="primary">
                  <Text>Updating Latest Code...</Text>
                </Button>,
              );
              codeApi
                .updateLatestCode({
                  code: code,
                  lock: false,
                  language: language,
                  codeType: isDailyChallenge
                    ? CodeType.DailyChallenge
                    : CodeType.Normal,
                })
                .then(() => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="success">
                      <Text>Latest code updated successfully!</Text>
                    </Button>,
                  );
                })
                .catch(() => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="error">
                      <Text>Failed to update latest code!</Text>
                    </Button>,
                  );
                });
            }}
          >
            <Text>Save</Text>
          </Button>
          <Button
            className="commit-code-button"
            onClick={() => {
              if (isDailyChallenge) {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="error">
                    <Text>
                      Committing code is not supported in daily challenge!
                    </Text>
                  </Button>,
                );
                return;
              }
              setModalState({
                isOpen: true,
                content: <CommitCodeModal language={language} code={code} />,
              });
            }}
          >
            <Text>Commit</Text>
          </Button>
          <Button
            className="run-code-button"
            onClick={() => {
              setModalState({
                isOpen: true,
                content: <SelfMatchModal />,
              });
            }}
          >
            <Text>Run</Text>
          </Button>
          <Button
            className="submit-code-button"
            onClick={() => {
              toast(
                <Button FrameComponent={FrameHexagon} palette="primary">
                  <Text>Submitting Code...</Text>
                </Button>,
              );
              codeApi
                .updateLatestCode({
                  code: code,
                  lock: true,
                  language: language,
                  codeType: isDailyChallenge
                    ? CodeType.DailyChallenge
                    : CodeType.Normal,
                })
                .then(() => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="success">
                      <Text>
                        Code Submitted Successfully!
                        {isDailyChallenge && ' Creating match request...'}
                      </Text>
                    </Button>,
                  );
                  if (isDailyChallenge) {
                    dailyChallengesApi
                      .createDailyChallengeMatch({
                        value: code,
                        language: language,
                      })
                      .then(() => {
                        toast(
                          <Button
                            FrameComponent={FrameHexagon}
                            palette="success"
                          >
                            <Text>Match Request Submitted!</Text>
                          </Button>,
                        );
                      })
                      .catch(() => {
                        toast(
                          <Button FrameComponent={FrameHexagon} palette="error">
                            <Text>Failed to create match!</Text>
                          </Button>,
                        );
                      });
                  }
                })
                .catch(() => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="error">
                      <Text>Failed to submit code!</Text>
                    </Button>,
                  );
                });
            }}
          >
            <Text>Submit</Text>
          </Button>
        </div>
      </div>
      <Editor
        height="100vh"
        theme={isThemeLoaded ? 'dark-black' : 'vs-dark'}
        options={{
          theme: 'dark-black',
          fontSize: 16,
          cursorBlinking: 'smooth',
          lightbulb: {
            enabled: true,
          },
          minimap: {
            enabled: false,
          },
        }}
        overrideServices={{}}
        value={code}
        language={language.toLowerCase()}
        onChange={handleCodeChange}
        onMount={editor => (editorRef.current = editor)}
      />
    </>
  );
};

export default MonacoEditor;
