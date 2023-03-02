import { rgba } from 'polished';
import { useState } from 'react';
import { theme } from '../../theme';
import { getAllAvatars } from './Avatar';

const AvatarSelect = ({
  defaultAvatar,
  onSelect,
}: {
  defaultAvatar: number;
  onSelect: (id: number) => void;
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  return (
    <div>
      <div
        css={{
          display: 'block',
          marginBottom: '1rem',
          lineHeight: 1,
          fontSize: 14,
          textTransform: 'uppercase',
          color: rgba(theme.color.headings, 0.75),
        }}
      >
        Select Avatar
      </div>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingBottom: '1rem',
          position: 'relative',
          overflowX: 'auto',
          zIndex: 100,
          minWidth: 0,
        }}
      >
        {getAllAvatars().map(avatar => (
          <div
            css={{
              minWidth: '3em',
              height: '3em',
              margin: '0 0.5em',
              borderRadius: '50%',
              overflow: 'hidden',
              border:
                avatar.id === selectedAvatar ? '0.2rem solid cyan' : 'none',
            }}
            key={avatar.url}
            onClick={() => {
              setSelectedAvatar(avatar.id);
              onSelect(avatar.id);
            }}
          >
            <img
              css={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              src={avatar.url}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelect;
