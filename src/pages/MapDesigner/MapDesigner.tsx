import { Button, FrameHexagon, Text } from '@arwes/core';
import { MapApi } from '@codecharacter-2022/client';
import { MapDesignerComponent } from '@codecharacter-2022/map-designer';
import toast from 'react-simple-toasts';
import { apiConfig } from '../../api/ApiConfig';
import CommitMapModal from '../../components/Modals/CommitMapModal';
import { useModal } from '../../providers/ModalProvider';

const MapDesigner = () => {
  const mapApi = new MapApi(apiConfig);
  const { setModalState } = useModal();

  return (
    <MapDesignerComponent
      saveMapCallback={(map: Array<Array<number>>) => {
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
      }}
      submitMapCallback={(map: Array<Array<number>>) => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="primary">
            <Text>Submitting Map...</Text>
          </Button>,
        );
        mapApi
          .updateLatestMap({
            map: JSON.stringify(map),
            lock: false,
            mapImage: '',
          })
          .then(() => {
            toast(
              <Button FrameComponent={FrameHexagon} palette="success">
                <Text>Map Submitted Successfully!</Text>
              </Button>,
            );
          })
          .catch(() => {
            toast(
              <Button FrameComponent={FrameHexagon} palette="error">
                <Text>Failed to submit map!</Text>
              </Button>,
            );
          });
      }}
      commitMapCallback={(map: Array<Array<number>>) => {
        setModalState({
          isOpen: true,
          content: <CommitMapModal map={map} />,
        });
      }}
      readonly={false}
    />
  );
};

export default MapDesigner;
