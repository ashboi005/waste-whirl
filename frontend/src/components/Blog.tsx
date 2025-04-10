import Link from 'next/link';

export default function Blog() {
  const blogs = [
    { title: 'NEED  OF WASTE DISPOSAL', img: 'b1.jpg', excerpt: 'In every household...', link: '/blog1' },
    { title: 'METHODS OF WASTE DISPOSAL', img: 'b2.jpg', excerpt: 'In today\'s world...', link: '/blog2' },
    { title: 'WASTE WHIRL AS AN INITIATIVE', img: 'logo4.png', excerpt: 'Empowering Communities...', link: '/blog4' },
  ];

  return (
    <section id="Blog">
      <h2>Our Blog</h2>
      <div className="blog-container">
        {blogs.map((blog, idx) => (
          <div className="blog-card" key={idx}>
            <img src={`/static/images/${blog.img}`} alt={blog.title} />
            <div className="blog-card-content">
              <h3>{blog.title}</h3>
              <p>{blog.excerpt}</p>
              <Link href={blog.link} className="read-more">Read More »</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 