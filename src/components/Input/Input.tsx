import { Text } from '@arwes/core';
import { rgba } from 'polished';
import { useRef, useState } from 'react';
import { theme } from '../../theme';

let globalInputCounter = 0;

interface InputProps {
  labelText?: string;
  defaultValue?: string;
  type: 'text' | 'number' | 'email' | 'password';
  inputRef?: React.RefObject<HTMLInputElement>;
}

const Input = ({ labelText, defaultValue, type, inputRef }: InputProps) => {
  const id = useRef('input-' + globalInputCounter++);

  const [inputValue, setInputValue] = useState(defaultValue || '');

  return (
    <div
      css={{
        position: 'relative',
        display: 'block',
        fontFamily: theme.typography.content,
        color: theme.color.content,
        width: '100%',
      }}
    >
      {labelText && (
        <label
          css={{
            display: 'block',
            marginBottom: '0.5rem',
            lineHeight: 1,
            fontSize: 14,
            textTransform: 'uppercase',
            color: rgba(theme.color.headings, 0.75),
          }}
          htmlFor={id.current}
        >
          <Text>{labelText}</Text>
        </label>
      )}
      <input
        id={id.current}
        type={type}
        css={{
          position: 'relative',
          zIndex: 1,
          display: 'block',
          border: 'none',
          margin: 0,
          padding: '0 0 0 8px',
          width: '100%',
          height: 30,
          lineHeight: '30px',
          fontSize: 16,
          fontFamily: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
          backgroundColor: rgba(theme.color.content, 0.1),
          outline: 'none',
          boxShadow: 'none',
          transition: 'color 150ms ease-out',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
        required
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
        ref={inputRef}
      />
    </div>
  );
};

export default Input;
