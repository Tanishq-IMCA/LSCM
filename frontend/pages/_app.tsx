import type { AppProps } from 'next/app';
import App from 'next/app';
import { Providers } from '@/contexts/Providers';
import { NexusNoticeContainer } from '@/components/ui/NexusNotice';
import BlobBackground from '@/components/ui/BlobBackground';
import ExperienceLayer from '@/components/ExperienceLayer';
import '@/styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <BlobBackground />
      <ExperienceLayer />
      <NexusNoticeContainer />
      <Component {...pageProps} />
    </Providers>
  );
}

MyApp.getInitialProps = App.getInitialProps;
