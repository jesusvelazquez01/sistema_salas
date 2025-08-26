import { ImgHTMLAttributes  } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
      {...props}
      src="/logo_jujuy.jpg" // Ruta a tu imagen en la carpeta 'public'
      alt="App Logo"   // Texto alternativo importante para la accesibilidad
    />
    );
}
