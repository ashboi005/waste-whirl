import Link from 'next/link';

export default function Hero() {
  return (
    <section id="hero">
      <div className="Right">
        <h1 className="main-h1">
          Sell your recyclables<br />
          online with <span className="waste-whirl-span">Waste Whirl!</span>
        </h1>
        <span className="right-span">
          Paper - Plastics - Metals - Appliances
        </span>
        <br />
        <Link href="/auth" id="book-now">Book now</Link>
      </div>
      <div className="Left">
        <img src="/static/images/download.png" alt="pickup" className="pickup" />
      </div>
    </section>
  );
} 