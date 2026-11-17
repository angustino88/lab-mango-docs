import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

type Card = { title: string; audience: string; body: string; to: string; cta: string };

const guides: Card[] = [
  {
    title: 'Lab user',
    audience: 'Everyone',
    body: 'Book benches, manage your bookings, follow the dashboards and ask for help.',
    to: '/guides/lab-user',
    cta: 'Lab user guide',
  },
  {
    title: 'Lab coordinator',
    audience: 'Coordinators',
    body: 'Approve bookings, keep spaces and equipment up to date, track finance, run the support desk.',
    to: '/guides/lab-coordinator',
    cta: 'Coordinator guide',
  },
  {
    title: 'Lab admin',
    audience: 'Admins',
    body: 'Decide who holds which role, keep access right, configure the support desk.',
    to: '/guides/lab-admin',
    cta: 'Admin guide',
  },
];

const developer: Card = {
  title: 'Developer handbook',
  audience: 'Engineers',
  body: 'Architecture, design specs, conventions, API standards, feature specs and decisions for frontend and backend, synced from the code repositories.',
  to: '/developer',
  cta: 'Open the handbook',
};

function CardView({ card, wide = false }: { card: Card; wide?: boolean }) {
  return (
    <Link to={card.to} className={`${styles.card} ${wide ? styles.wide : ''}`}>
      <span className={styles.audience}>{card.audience}</span>
      <h2 className={styles.cardTitle}>{card.title}</h2>
      <p className={styles.cardBody}>{card.body}</p>
      <span className={styles.cta}>{card.cta} →</span>
    </Link>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <main className={styles.main}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Lab Mango documentation</h1>
          <p className={styles.lead}>
            How to use Lab Mango in your role, and how it is built. New here? Start with{' '}
            <Link to="/guides/getting-started">Getting started</Link>.
          </p>
        </header>

        <section aria-labelledby="guides-heading">
          <h2 id="guides-heading" className={styles.sectionTitle}>User guides</h2>
          <div className={styles.grid}>
            {guides.map((card) => (
              <CardView key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section aria-labelledby="dev-heading">
          <h2 id="dev-heading" className={styles.sectionTitle}>For developers</h2>
          <CardView card={developer} wide />
        </section>
      </main>
    </Layout>
  );
}
