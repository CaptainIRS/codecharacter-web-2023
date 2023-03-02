import { rgba } from 'polished';
import { useRef, useState } from 'react';
import { theme } from '../../theme';
import { MdKeyboardArrowDown } from 'react-icons/md';

let globalSelectCounter = 0;

interface SelectProps {
  labelText?: string;
  value: string;
  onChange?: (newValue: string) => void;
  children: React.ReactNode;
  selectRef?: React.RefObject<HTMLSelectElement>;
}

const Select = ({
  labelText,
  value,
  onChange,
  children,
  selectRef,
}: SelectProps) => {
  const id = useRef('select-' + globalSelectCounter++);

  const [selectValue, setSelectValue] = useState(value);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(event.target.value);
    onChange?.(event.target.value);
  };

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
          {labelText}
        </label>
      )}
      <select
        id={id.current}
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

          '& option, & optgroup': {
            backgroundColor: theme.color.section,
            color: theme.color.content,
          },
        }}
        value={selectValue}
        onChange={handleChange}
        ref={selectRef}
      >
        {children}
      </select>
      <span
        css={{
          position: 'absolute',
          right: 8,
          bottom: 6,
          fontSize: 12,
          color: theme.color.content,
          fontWeight: 'bold',
        }}
      >
        <MdKeyboardArrowDown />
      </span>
    </div>
  );
};

export default Select;
