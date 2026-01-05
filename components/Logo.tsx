
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', src }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24',
    xl: 'w-48 h-48'
  };

  if (src) {
    return (
      <div className={`flex items-center justify-center overflow-hidden ${className} ${sizes[size]}`}>
        <img src={src} alt="Logo Empresa" className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className} ${sizes[size]}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fundo Azul Institucional */}
        <rect width="100" height="100" rx="8" fill="#005a9c"/>
        
        {/* Forma Branca (Folha/Escudo) com cantos arredondados alternados conforme imagem */}
        <path 
          d="M25 21H55C66.0457 21 75 29.9543 75 41V79H45C33.9543 79 25 70.0457 25 59V21Z" 
          fill="white"
        />
        
        {/* Cruz Azul Estilizada */}
        <path 
          d="M54.5 30V47.5H72V52.5H54.5V70H49.5V52.5H32V47.5H49.5V30H54.5Z" 
          fill="#005a9c"
        />
        
        {/* Detalhe Azul Claro no Centro da Cruz */}
        <rect x="49.5" y="47.5" width="5" height="5" fill="#00adef"/>
      </svg>
    </div>
  );
};

export default Logo;
