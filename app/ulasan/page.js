import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getDb } from '../../lib/db';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const db = getDb();
  const reviews = db ? (await db.query('SELECT rating, coment FROM ulasan ORDER BY created_at DESC')).rows : [];
  return <><Navbar /><main className="shell simple-page"><span className="eyebrow">CERITA PELANGGAN</span><h1>Pengalaman belanja Anda berarti.</h1><p>Bagikan pengalaman Anda dan bantu SIXTEE SHOP menjadi lebih baik.</p><div className="review-list-next">{reviews.map((review, index) => <article key={index}><div className="review-stars-next">{'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span></div><p>{review.coment}</p></article>)}{!reviews.length && <div className="empty-state"><h2>Belum ada ulasan</h2><p>Jadilah pelanggan pertama yang berbagi pengalaman.</p></div>}</div><Link className="button button-primary" href="/login">Login untuk memberi ulasan</Link></main></>;
}
