export default function WhyUs() {
  const reasons = [
    { icon: '💰', title: 'Best Rates', desc: 'We provide the best value for your scrap from our network of Recyclers.' },
    { icon: '👍', title: 'Convenience', desc: "Doorstep pickup according to user's convenient date & time." },
    { icon: '🔒', title: 'Trust', desc: 'Trained & Verified Pickup Staff with Smart Weighing Scale.' },
    { icon: '🌳', title: 'Eco-friendly', desc: 'We ensure responsible recycling of your scrap items.' },
  ];

  return (
    <section id="Whyus">
      <h2>Why us?</h2>
      <div className="why-container">
        {reasons.map((item, idx) => (
          <div className="card" key={idx}>
            <div className="icon">{item.icon}</div>
            <div className="title">{item.title}</div>
            <div className="description">{item.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 