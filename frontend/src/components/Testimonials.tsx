const testimonials = [
  { name: "Rajesh Kumar", image: "1.png", text: "The service provided was exceptional..." },
  { name: "Anita Sharma", image: "5.png", text: "An amazing experience from start to finish..." },
  { name: "Vijay Singh", image: "2.png", text: "Extremely satisfied with the service..." },
  { name: "Priya Patel", image: "6.png", text: "The team did a fantastic job..." },
  { name: "Arun Das", image: "3.png", text: "A seamless and hassle-free experience..." },
  { name: "Sunita Mehta", image: "7.png", text: "Very pleased with the service..." },
  { name: "Ravi Gupta", image: "4.png", text: "Outstanding service from start to finish..." },
  { name: "Neha Verma", image: "8.png", text: "Excellent service and very professional staff..." },
];

export default function Testimonials() {
  return (
    <section id="Testimonials">
      <h2>Testimonials</h2>
      <div className="testimonials-container">
        {testimonials.map((t, idx) => (
          <div className="testimonial-card" key={idx}>
            <div className="header">
              <img className="avatar" src={`/static/images/${t.image}`} alt={t.name} />
              <div className="name">{t.name}</div>
            </div>
            <div className="content">{t.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 