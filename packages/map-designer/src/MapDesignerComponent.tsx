import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import TowerConfig from './config/TowerConfig';
import { events, MapDesignerEvents } from './events/EventEmitter';
import { MapDesigner } from './MapDesigner';
import {
  ArwesThemeProvider,
  Button,
  FrameBox,
  FramePentagon,
  StylesBaseline,
  Text,
} from '@arwes/core';
import {
  FaArrowsAlt,
  FaSave,
  FaTimesCircle,
  FaEraser,
  FaCodeBranch,
  FaUpload,
} from 'react-icons/fa';
const MapDesignerLayer = createComponent(React, 'cc-map-designer', MapDesigner);

interface MapDesignerComponentProps {
  saveMapCallback: (map: Array<Array<number>>) => void;
  commitMapCallback?: (map: Array<Array<number>>) => void;
  submitMapCallback?: (map: Array<Array<number>>) => void;
  readonly: boolean;
}

const CoinsRemainingText = () => {
  const [coins, setCoins] = React.useState(0);

  React.useEffect(() => {
    const onCoinsUpdated = (coins: number) => {
      setCoins(coins);
      events.removeAllListeners(MapDesignerEvents.COINS_CHANGED);
      events.once(MapDesignerEvents.COINS_CHANGED, onCoinsUpdated);
    };
    events.once(MapDesignerEvents.COINS_CHANGED, onCoinsUpdated);

    return function cleanup() {
      events.removeAllListeners(MapDesignerEvents.COINS_CHANGED);
    };
  }, [coins]);

  return (
    <span
      style={{
        fontSize: '4rem',
        lineHeight: '0.8',
        width: '40ch',
        fontFamily: '"Titillium Web", monospace',
      }}
      id="coins"
    >
      {coins}
    </span>
  );
};

export default function MapDesignerComponent(
  props: MapDesignerComponentProps,
): JSX.Element {
  const [mapData, setMapData] = React.useState<Array<Array<number>>>([]);

  React.useEffect(() => {
    const onMapDataUpdated = (map: Array<Array<number>>) => {
      setMapData(map);
      events.removeAllListeners(MapDesignerEvents.MAP_DATA_CHANGED);
      events.once(MapDesignerEvents.MAP_DATA_CHANGED, onMapDataUpdated);
    };
    events.once(MapDesignerEvents.MAP_DATA_CHANGED, onMapDataUpdated);

    return function cleanup() {
      events.removeAllListeners(MapDesignerEvents.MAP_DATA_CHANGED);
    };
  }, [mapData]);

  return (
    <ArwesThemeProvider>
      <StylesBaseline />
      {!props.readonly ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              padding: '2rem',
              width: '100%',
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-evenly',
              flexWrap: 'wrap',
              gap: '1rem',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.2rem',
                pointerEvents: 'auto',
              }}
            >
              {TowerConfig.towers.map(tower => (
                <Button
                  FrameComponent={FramePentagon}
                  key={tower.name}
                  animator={{ animate: false }}
                >
                  <div
                    key={tower.name}
                    onClick={() => {
                      events.emit(MapDesignerEvents.TOWER_SELECTED, tower);
                    }}
                  >
                    <img
                      src={`../assets/${tower.thumbnailAsset}`}
                      width="20px"
                      height="auto"
                      alt={tower.name}
                    />
                    <br />
                    <span>{tower.name}</span>
                  </div>
                </Button>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.2rem',
                pointerEvents: 'auto',
              }}
            >
              <div
                key="move"
                onClick={() => {
                  events.emit(MapDesignerEvents.MOVE_SELECTED);
                }}
              >
                <Button FrameComponent={FrameBox} style={{ width: '100%' }}>
                  <FaArrowsAlt />
                  <br />
                  <br />
                  Move
                </Button>
              </div>
              <div
                key="clear"
                onClick={() => {
                  events.emit(MapDesignerEvents.CLEAR_MAP);
                }}
              >
                <Button FrameComponent={FrameBox} style={{ width: '100%' }}>
                  <FaTimesCircle />
                  <br />
                  <br />
                  Clear
                </Button>
              </div>
              <div
                key="erase"
                onClick={() => {
                  events.emit(MapDesignerEvents.ERASER_SELECTED);
                }}
              >
                <Button FrameComponent={FrameBox} style={{ width: '100%' }}>
                  <FaEraser />
                  <br />
                  <br />
                  Erase
                </Button>
              </div>
              <div key="save" onClick={() => props.saveMapCallback(mapData)}>
                <Button FrameComponent={FrameBox} style={{ width: '100%' }}>
                  <FaSave />
                  <br />
                  <br />
                  Save
                </Button>
              </div>
              <div
                key="commit"
                onClick={() =>
                  props.commitMapCallback
                    ? props.commitMapCallback(mapData)
                    : undefined
                }
              >
                <Button FrameComponent={FrameBox} style={{ width: '100%' }}>
                  <FaCodeBranch />
                  <br />
                  <br />
                  Commit
                </Button>
              </div>
              <div
                key="submit"
                onClick={() =>
                  props.submitMapCallback
                    ? props.submitMapCallback(mapData)
                    : undefined
                }
              >
                <Button FrameComponent={FrameBox} style={{ width: '100%' }}>
                  <FaUpload />
                  <br />
                  <br />
                  Submit
                </Button>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <CoinsRemainingText />
              <br />
              <Text>Coins Remaining</Text>
            </div>
          </div>
          <MapDesignerLayer />
        </div>
      ) : (
        <div style={{ pointerEvents: 'none' }}>
          <MapDesignerLayer />
        </div>
      )}
    </ArwesThemeProvider>
  );
}
