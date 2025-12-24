import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Stack,
  Section,
  Container,
  Heading,
  Text,
} from '../components/ui/design-system';

const About: React.FC = () => {
  return (
    <Stack>
      <Helmet>
        <title>About | Gergen Software</title>
        <meta
          name='description'
          content='Gergen Software is a software consultancy focused on building simple, maintainable systems for growing businesses.'
        />
      </Helmet>

      <Section>
        <Container size='prose'>
          <Heading level='h1'>About Gergen Software</Heading>
          <Text variant='lead' className='mt-4'>
            Software doesn't have to be complicated.
          </Text>

          <div className='mt-8 space-y-6 text-lg text-text-muted leading-relaxed'>
            <p>
              I'm Jake Gergen, the founder and principal engineer behind Gergen
              Software.
            </p>
            <p>
              After years of seeing companies struggle with bloated, buggy, and
              expensive software, I decided to offer a different kind of
              partnership. One where the goal isn't to bill more hours, but to
              build systems that require <em>less</em> work to maintain.
            </p>
            <p>
              My philosophy is simple:{' '}
              <strong>
                Build it right, keep it simple, and automate the rest.
              </strong>
            </p>
            <p>
              Whether I'm building a new product from scratch or stabilizing a
              legacy system, I focus on long-term health. This approach allows
              me to offer the $1,000/month growth plan—because when software is
              built well, it doesn't need constant fixing.
            </p>
          </div>
        </Container>
      </Section>
    </Stack>
  );
};

export default About;
