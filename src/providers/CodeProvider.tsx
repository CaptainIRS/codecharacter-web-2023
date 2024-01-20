import { Language } from '@codecharacter-2022/client';
import { createContext, useContext, useState } from 'react';
import cppCode from '../assets/codes/cpp/run.cpp?raw';

const CodeContext = createContext<{
  code: string;
  language: Language;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
}>({
  code: cppCode,
  language: Language.Cpp,
  setCode: () => undefined,
  setLanguage: () => undefined,
});

export const CodeProvider = ({ children }: { children: JSX.Element }) => {
  const [code, setCode] = useState<string>(
    localStorage.getItem('code') || cppCode,
  );
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('language') as Language) || Language.Cpp,
  );

  return (
    <CodeContext.Provider value={{ code, language, setCode, setLanguage }}>
      {children}
    </CodeContext.Provider>
  );
};

export const useCode = () => {
  return useContext(CodeContext);
};
